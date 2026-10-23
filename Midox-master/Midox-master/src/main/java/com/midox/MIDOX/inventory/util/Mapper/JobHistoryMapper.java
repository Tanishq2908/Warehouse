package com.midox.MIDOX.inventory.util.Mapper;

import com.midox.MIDOX.inventory.entity.*;
import com.midox.MIDOX.inventory.models.ResponseModels.AddaMaterialResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.AddaPatternResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.JobHistoryResponse;
import com.midox.MIDOX.inventory.repository.SearchJDBC;
import com.midox.MIDOX.inventory.service.spi.IDesignService;
import com.midox.MIDOX.inventory.util.ValidationUtil;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Mapper( componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {EntityCodeMapper.class, EmployeeNameMapper.class, AddaMaterialMapper.class, AddaPatternMapper.class})
public abstract class JobHistoryMapper {

    @Mapping(source = "bundleHistoryId", target = "bundleName", qualifiedByName = "mapBundleName")
    public abstract JobHistoryResponse toJobHistoryResponse(JobHistory jobHistory);

    @Autowired
    private SearchJDBC searchJDBC;

    @Named(value = "mapBundleName")
    String mapBundleName(Integer bundleHistoryId) {
        String bundleName = searchJDBC.getBundleNameFromHistory(bundleHistoryId);
        return bundleName;
    }

}
