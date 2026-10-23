package com.midox.MIDOX.inventory.models.ResponseModels;

import com.midox.MIDOX.inventory.constants.TextileEnum;
import com.midox.MIDOX.inventory.entity.EmployeePayment;
import com.midox.MIDOX.inventory.models.MapperModels.EmployeeDetails;
import com.midox.MIDOX.inventory.models.MapperModels.EntityCode;
import com.midox.MIDOX.inventory.models.ResponseWrapper;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

import java.sql.Date;
import java.util.List;

@Getter @Setter
public class EmployeePaymentHistoryResponse extends AbstractEntityResponse implements ResponseWrapper {


    private EmployeeDetails employeeId;


    private Integer paymentHistoryId;


    private EntityCode paymentMode;


    String details;


    private EmployeeDetails paidBy;


    Date paymentDate;

    private Double amountPaid;
}
