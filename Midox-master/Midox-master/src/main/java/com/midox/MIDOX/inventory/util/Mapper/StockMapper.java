package com.midox.MIDOX.inventory.util.Mapper;

import com.midox.MIDOX.inventory.entity.Stock;
import com.midox.MIDOX.inventory.models.ResponseModels.StockResponse;
import org.mapstruct.*;

@Mapper( componentModel = MappingConstants.ComponentModel.SPRING,

        unmappedTargetPolicy = ReportingPolicy.IGNORE,
uses = {EntityCodeMapper.class, EmployeeNameMapper.class})
public abstract class StockMapper {

    public abstract StockResponse toStockResponse(Stock stock);



}
