package com.midox.MIDOX.inventory.util.Mapper;

import com.midox.MIDOX.inventory.entity.Adda;
import com.midox.MIDOX.inventory.entity.Stock;
import com.midox.MIDOX.inventory.entity.StockHistory;
import com.midox.MIDOX.inventory.entity.Supplier;
import com.midox.MIDOX.inventory.models.RequestModels.AddaSearchCriteria;
import com.midox.MIDOX.inventory.models.ResponseModels.StockHistoryResponse;
import com.midox.MIDOX.inventory.service.spi.IAddaService;
import com.midox.MIDOX.inventory.service.spi.IStockService;
import com.midox.MIDOX.inventory.service.spi.ISupplierService;
import com.midox.MIDOX.inventory.util.ValidationUtil;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Mapper( componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
uses = {EntityCodeMapper.class, EmployeeNameMapper.class, StockMapper.class})
public abstract class StockHistoryMapper {

    @Autowired
    private ISupplierService supplierService;

    @Autowired
    private IStockService stockService;

    @Autowired
    private IAddaService addaService;

    @Mapping(source = "addaId", target = "addaNo", qualifiedByName = "mapAddaNo")
    @Mapping(source = "stockId", target = "stockDetails", qualifiedByName = "mapStockFromId")
    @Mapping(source = "supplierId", target = "supplierDetails", qualifiedByName = "mapSupplierFromId")
    public abstract StockHistoryResponse toStockHistoryResponse(StockHistory stockHistory);

    @Named(value = "mapStockFromId")
    Stock mapStockFromId(Integer stockId) { // return type of gender, I took String. For id took Long
        return stockService.getStockById(stockId);
    }

    @Named(value = "mapSupplierFromId")
    Supplier mapSupplierFromId(Integer supplierId) { // return type of gender, I took String. For id took Long
        if(null != supplierId && supplierId>0){
            return supplierService.getSupplierById(supplierId);
        }
        return null;
    }

    @Named(value = "mapAddaNo")
    String mapAddaNo(Integer addaId) {
        if(null != addaId && addaId > 0){
            AddaSearchCriteria searchCriteria = new AddaSearchCriteria();
            searchCriteria.setAddaId(addaId);
            List<Adda> addas = addaService.getAddaByCriteria(searchCriteria);
            if(ValidationUtil.isNotEmpty(addas) && addas.size() == 1){
                Adda adda = addas.get(0);
                return adda.getAddaNo();
            }
        }
        return null;
    }
}
