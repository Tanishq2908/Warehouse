package com.midox.MIDOX.inventory.service.api;

import com.midox.MIDOX.inventory.Exception.MidoxException;
import com.midox.MIDOX.inventory.entity.Stock;
import com.midox.MIDOX.inventory.entity.StockHistory;
import com.midox.MIDOX.inventory.models.RequestModels.StockHistorySearchCriteria;
import com.midox.MIDOX.inventory.repository.StockHistoryRepository;
import com.midox.MIDOX.inventory.repository.StockRepository;
import com.midox.MIDOX.inventory.service.spi.IStockHistoryService;
import com.midox.MIDOX.inventory.service.spi.IStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockHistoryServiceImpl implements IStockHistoryService {

    private final StockHistoryRepository stockHistoryRepo;
    private final StockRepository stockRepo;

    private final IStockService stockService;

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public Boolean addStockHistory(List<StockHistory> stockHistories) {
        for (StockHistory stockHistory : stockHistories) {

            if (stockRepo.countStock() == 0) {
                Integer stockHistoryId = stockHistoryRepo.save(stockHistory).getStockHistoryId();

            } else {
                //List<Stock> stock = stockRepo.findStock(stockHistory.getStock().getMaterial().getMaterialName());
                Stock stock = stockRepo.findStock("", "", "");
                /*if (ValidationUtil.isNotEmpty(stock)) {
                    stockService.updateStockCount(stock, stockHistory);
                } else {
                    stockService.addStocks(null);
                }*/
            }

        }
        return true;
    }

    @Override
    public List<StockHistory> getStockHistories(int id) {
        return stockHistoryRepo.findAllByStockId(id);
    }

    public List<StockHistory> getStockHistoryFromCriteria(StockHistorySearchCriteria searchCriteria){

        return stockHistoryRepo.findAllBySearchCriteria(searchCriteria.getStockId(), searchCriteria.getAddaId(), searchCriteria.getFromDate(), searchCriteria.getToDate());
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public StockHistory createStockHistory(StockHistory stockHistory){
        stockHistory.setDefaultValues();
        return stockHistoryRepo.save(stockHistory);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public StockHistory updateStockHistory(StockHistory stockHistory) throws MidoxException {
        if(null == stockHistory.getStockHistoryId()){
            throw new MidoxException(MidoxException.EXCEPTION_ENTITY_DOES_NOT_EXIST);
        }
        stockHistory.setDefaultValues();
        return stockHistoryRepo.saveAndFlush(stockHistory);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public void deleteStockHistory(StockHistory stockHistory) throws MidoxException {
        if(null == stockHistory.getStockHistoryId()){
            throw new MidoxException(MidoxException.EXCEPTION_ENTITY_DOES_NOT_EXIST);
        }
        stockHistoryRepo.deleteById(stockHistory.getStockHistoryId());
    }
}
