package com.midox.MIDOX.inventory.service.api;

import com.midox.MIDOX.inventory.Exception.MidoxException;
import com.midox.MIDOX.inventory.constants.BusinessConstants;
import com.midox.MIDOX.inventory.entity.Stock;
import com.midox.MIDOX.inventory.entity.StockHistory;
import com.midox.MIDOX.inventory.models.RequestModels.StockSearchCriteria;
import com.midox.MIDOX.inventory.models.StockModel;
import com.midox.MIDOX.inventory.repository.StockHistoryRepository;
import com.midox.MIDOX.inventory.repository.StockRepository;
import com.midox.MIDOX.inventory.service.spi.IStockHistoryService;
import com.midox.MIDOX.inventory.service.spi.IStockService;
import com.midox.MIDOX.inventory.util.MapperUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockServiceImpl implements IStockService {

    @Autowired
    @Lazy
    IStockHistoryService stockHistoryService;

    private final DataSource dataSource;
    private final StockRepository stockRepo;
    private final StockHistoryRepository stockHistoryRepo;

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public Boolean addStocks(List<StockModel> stocks) {

        //Integer stockHistoryId = stockHistoryRepo.save(stockHistory).getStockHistoryId();
        stocks.forEach(stockModel -> {
            Stock stock = stockModel.getStock();
            Stock found = stockRepo.findStock(stock.getMaterialCd(), stock.getSubcategoryCd(), stock.getColorFabricCd());
            if(null == found){
                found = createStock(stock);
            }
            StockHistory history = stockModel.getStockHistory();
            history.setStockId(found.getStockId());
            history.setCreditDebitInd(BusinessConstants.CREDIT_INDICATOR);
            stockHistoryService.createStockHistory(history);
            found.setAvailableQuantity(found.getAvailableQuantity() + history.getQuantity());
            stockRepo.saveAndFlush(found);
        });
        return true;
    }

    @Override
    public List<Stock> getAllStocks() {
        List<Stock> stockList = stockRepo.getStockList();
        /*List<Stock> stocks= new ArrayList<>();
        stockList.stream().distinct().forEach(stockIterate -> {
            Stock stock = new Stock();
            stock.setQuantity(stockIterate.getQuantity());
            stocks.add(stock);
        });*/
        return stockList;
    }

    @Override
    public Stock getStockById(Integer stockId){
        return stockRepo.findById(stockId).get();
    }

    @Override
    public List<Stock> getStocksWithCriteria(StockSearchCriteria searchCriteria) {
        List<Stock> stockList = stockRepo.findStockByCriteria(searchCriteria.getStockId(), searchCriteria.getMaterialCd(), searchCriteria.getSubcategoryCd(), searchCriteria.getColorFabricCd(), searchCriteria.getStockName());
        return stockList;
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public Stock createStock(Stock stock){
        stock.setStockName(setStockName(stock));
        stock.setDefaultValues();
        return stockRepo.saveAndFlush(stock);
    }

    private String setStockName(Stock stock){
        String stockName = MapperUtils.getDisplayValueForEntity(stock.getMaterialCd()) + "_";
        stockName = stockName + MapperUtils.getDisplayValueForEntity(stock.getSubcategoryCd());
        if(null != MapperUtils.getDisplayValueForEntity(stock.getColorFabricCd())){
            stockName = stockName + "_" + MapperUtils.getDisplayValueForEntity(stock.getColorFabricCd());
        }
        return stockName.replaceAll(" ", "_");
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public Stock updateStock(Stock stock) throws MidoxException{
        if(null == stock.getStockId()){
            throw new MidoxException(MidoxException.EXCEPTION_ENTITY_DOES_NOT_EXIST);
        }
        stock.setDefaultValues();
        return stockRepo.saveAndFlush(stock);
    }

    @Override
    public void updateStockCount(List<Stock> stockList, StockHistory stockHistory) {
/*
        Material material = new Material();
        AtomicInteger existingQuantity = new AtomicInteger();
        AtomicInteger stockNo = new AtomicInteger();
        Number amount = stockHistory.getAmount();
        AtomicReference<String> userId = new AtomicReference<>("");
        stockList.stream().filter(stockStream -> {
            //stockNo.set(stockStream.getStockNo());
            //userId.set(stockStream.getMaterial().getCreatedBy());
            //material.setMaterialName(stockStream.getMaterial().getMaterialName());
            //material.setMaterialId(stockStream.getMaterial().getMaterialId());
            //existingQuantity.set(stockStream.getQuantity());
            return true;
        }).collect(Collectors.toList());
        int updatedQuantity = existingQuantity.intValue() + stockHistory.getQuantity();
        if (ValidationUtil.isNotNull(material.getMaterialName())) {
            try {
                int stockHistoryId = stockHistoryRepo.findLatestStockHistoryId();

                try {
                    SimpleJdbcCall simpleJdbcCall = new SimpleJdbcCall(dataSource)
                            .withSchemaName(ConfigConstants.DatabaseConstants.SCHEMA_NAME)
                            .withFunctionName(ConfigConstants.FUNCTION_UPDATE_STOCK.FUNCTION_UPDATE_STOCK_NAME)
                            .declareParameters(new SqlParameter(ConfigConstants.FUNCTION_UPDATE_STOCK.STOCK_HISTORY_ID, Types.INTEGER))
                            .declareParameters(new SqlParameter(ConfigConstants.FUNCTION_UPDATE_STOCK.STOCK, Types.INTEGER))
                            .declareParameters(new SqlParameter(ConfigConstants.FUNCTION_UPDATE_STOCK.AMOUNT, Types.NUMERIC))
                            .declareParameters(new SqlParameter(ConfigConstants.FUNCTION_UPDATE_STOCK.INSERT_QUANTITY, Types.INTEGER))
                            .declareParameters(new SqlParameter(ConfigConstants.FUNCTION_UPDATE_STOCK.UPDATE_QUANTITY, Types.INTEGER))
                            .declareParameters(new SqlParameter(ConfigConstants.FUNCTION_UPDATE_STOCK.PACKING_SLIP_NUMBER, Types.INTEGER))
                            .declareParameters(new SqlParameter(ConfigConstants.FUNCTION_UPDATE_STOCK.MATERIAL_ID, Types.INTEGER))
                            .declareParameters(new SqlParameter(ConfigConstants.FUNCTION_UPDATE_STOCK.USER_ID, Types.VARCHAR))
                            .withoutProcedureColumnMetaDataAccess()
                            .withReturnValue();
                    SqlParameterSource sqlParameterSource = new MapSqlParameterSource()
                            .addValue(ConfigConstants.FUNCTION_UPDATE_STOCK.STOCK_HISTORY_ID, stockHistoryId + 1)
                            .addValue(ConfigConstants.FUNCTION_UPDATE_STOCK.STOCK, stockNo.intValue())
                            .addValue(ConfigConstants.FUNCTION_UPDATE_STOCK.AMOUNT, amount)
                            .addValue(ConfigConstants.FUNCTION_UPDATE_STOCK.INSERT_QUANTITY, stockHistory.getQuantity())
                            .addValue(ConfigConstants.FUNCTION_UPDATE_STOCK.UPDATE_QUANTITY, updatedQuantity)
                            //.addValue(ConfigConstants.FUNCTION_UPDATE_STOCK.PACKING_SLIP_NUMBER, stockHistory.getPackingSlipNo())
                            .addValue(ConfigConstants.FUNCTION_UPDATE_STOCK.MATERIAL_ID, material.getMaterialId())
                            .addValue(ConfigConstants.FUNCTION_UPDATE_STOCK.USER_ID, userId.get());
                    simpleJdbcCall.executeFunction(void.class, sqlParameterSource);


                } catch (Exception ex) {
                    log.error(ex.getMessage(), ex);
                }

            } catch (JpaSystemException e) {
                e.getRootCause();
            }
        }
*/
    }

}

