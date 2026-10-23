package com.midox.MIDOX.inventory.util.Mapper;

import com.midox.MIDOX.inventory.entity.EmployeePayment;
import com.midox.MIDOX.inventory.entity.EmployeePaymentHistory;
import com.midox.MIDOX.inventory.models.ResponseModels.EmployeePaymentHistoryResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.EmployeePaymentResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper( componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {EntityCodeMapper.class, EmployeeNameMapper.class})
public interface EmployeePaymentHistoryMapper {

    public abstract EmployeePaymentHistoryResponse toEmployeePaymentHistoryResponse(EmployeePaymentHistory paymentHistory);
}
