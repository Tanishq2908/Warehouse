package com.midox.MIDOX.inventory.util.Mapper;

import com.midox.MIDOX.inventory.entity.AddaMaterial;
import com.midox.MIDOX.inventory.entity.AddaPattern;
import com.midox.MIDOX.inventory.models.ResponseModels.AddaMaterialResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.AddaPatternResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper( componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {EntityCodeMapper.class, EmployeeNameMapper.class})
public interface AddaPatternMapper {

    public abstract AddaPatternResponse toAddaPattern(AddaPattern pattern);

}
