package com.midox.MIDOX.inventory.util.Mapper;

import com.midox.MIDOX.inventory.entity.BundleCard;
import com.midox.MIDOX.inventory.entity.JobCard;
import com.midox.MIDOX.inventory.models.ResponseModels.BundleCardResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.JobCardResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper( componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {EntityCodeMapper.class, EmployeeNameMapper.class, DesignProcessMapper.class, BrandNameMapper.class})
public interface BundleCardMapper {

    public abstract BundleCardResponse toBundleCardResponse(BundleCard bundleCard);
}
