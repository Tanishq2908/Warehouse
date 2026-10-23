package com.midox.MIDOX.inventory.util.Mapper;

import com.midox.MIDOX.inventory.entity.AddaMaterial;
import com.midox.MIDOX.inventory.entity.BundleCard;
import com.midox.MIDOX.inventory.entity.EmployeePayment;
import com.midox.MIDOX.inventory.entity.EmployeePaymentHistory;
import com.midox.MIDOX.inventory.models.ResponseModels.AddaMaterialResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.BundleCardResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.EmployeePaymentHistoryResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.EmployeePaymentResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper( componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {EntityCodeMapper.class, EmployeeNameMapper.class, EmployeePaymentHistoryMapper.class})
public interface EmployeePaymentMapper {

    public abstract EmployeePaymentResponse toEmployeePaymentResponse(EmployeePayment payment);

    public abstract List<EmployeePaymentHistoryResponse> getEmployeePaymentHistory(List<EmployeePaymentHistory> histories);
}
