package com.midox.MIDOX.inventory.util.Mapper;

import com.midox.MIDOX.inventory.entity.AddaInfo;
import com.midox.MIDOX.inventory.entity.AddaMaterial;
import com.midox.MIDOX.inventory.models.ResponseModels.AddaInfoResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.AddaMaterialResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper( componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {EntityCodeMapper.class, EmployeeNameMapper.class})
public interface AddaInfoMapper {

    public abstract AddaInfoResponse toAddaInfo(AddaInfo info);

}
