package com.midox.MIDOX.inventory.util.Mapper;

import com.midox.MIDOX.inventory.entity.Design;
import com.midox.MIDOX.inventory.entity.DesignProcess;
import com.midox.MIDOX.inventory.entity.JobCard;
import com.midox.MIDOX.inventory.models.ResponseModels.DesignProcessResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.DesignResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.JobCardResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper( componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {EntityCodeMapper.class, EmployeeNameMapper.class, DesignProcessMapper.class, BrandNameMapper.class})
public interface JobCardMapper {

    @Mapping(source = "employeeId", target = "employee")
    public abstract JobCardResponse toJobCardResponse(JobCard jobCard);
}
