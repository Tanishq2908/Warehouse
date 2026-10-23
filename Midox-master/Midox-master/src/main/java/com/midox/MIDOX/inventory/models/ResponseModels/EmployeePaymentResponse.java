package com.midox.MIDOX.inventory.models.ResponseModels;

import com.midox.MIDOX.inventory.entity.EmployeePayment;
import com.midox.MIDOX.inventory.models.MapperModels.BrandDetails;
import com.midox.MIDOX.inventory.models.MapperModels.EmployeeDetails;
import com.midox.MIDOX.inventory.models.MapperModels.EntityCode;
import com.midox.MIDOX.inventory.models.ResponseWrapper;
import jakarta.persistence.Column;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

import java.sql.Date;
import java.util.List;

@Getter @Setter
public class EmployeePaymentResponse extends AbstractEntityResponse implements ResponseWrapper {

    private Integer paymentId;

    private EmployeeDetails employeeId;

    private Double outstanding;

    private Double totalPaid;

    private long pendingJob;


    private List<EmployeePaymentHistoryResponse> paymentHistories;
}
