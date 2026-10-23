package com.midox.MIDOX.inventory.util.Mapper;

import com.midox.MIDOX.inventory.entity.AddaMaterial;
import com.midox.MIDOX.inventory.entity.Design;
import com.midox.MIDOX.inventory.entity.DesignProcess;
import com.midox.MIDOX.inventory.models.ResponseModels.AddaMaterialResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.DesignProcessResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.DesignResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper( componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {EntityCodeMapper.class, EmployeeNameMapper.class, StockMapper.class, StockHistoryMapper.class, BrandNameMapper.class})
public interface AddaMaterialMapper {

    @Mapping(source = "stockId", target = "stockDetails", qualifiedByName = "mapStockFromId")
    public abstract AddaMaterialResponse toAddaMaterial(AddaMaterial material);

}
