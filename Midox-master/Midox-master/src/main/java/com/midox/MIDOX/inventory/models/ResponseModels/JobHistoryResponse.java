package com.midox.MIDOX.inventory.models.ResponseModels;

import com.midox.MIDOX.inventory.constants.TextileEnum;
import com.midox.MIDOX.inventory.entity.AbstractDataEntity;
import com.midox.MIDOX.inventory.models.MapperModels.EmployeeDetails;
import com.midox.MIDOX.inventory.models.MapperModels.EntityCode;
import com.midox.MIDOX.inventory.models.ResponseWrapper;
import jakarta.persistence.*;
import lombok.*;

import java.sql.Date;

@Getter
@Setter
public class JobHistoryResponse extends AbstractDataEntity implements ResponseWrapper {

    private Integer jobHistoryId;
    EmployeeDetails employeeId;
    private Integer bundleHistoryId;
    EntityCode processCd;
    private Date assignDate;
    private Date completionDate;

    private Double quantity;

    private Double paidWage;

    private Double totalWage;
    EntityCode paymentStatus;

    String details;

    String bundleName;
    EntityCode status;
}

