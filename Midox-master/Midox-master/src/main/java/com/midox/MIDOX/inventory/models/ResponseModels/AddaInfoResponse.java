package com.midox.MIDOX.inventory.models.ResponseModels;

import com.midox.MIDOX.inventory.models.MapperModels.EmployeeDetails;
import com.midox.MIDOX.inventory.models.ResponseWrapper;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

@Getter @Setter
public class AddaInfoResponse extends AbstractEntityResponse implements ResponseWrapper {

    private Integer addaInfoId;

    Integer addaId;

    EmployeeDetails dryingBy;

    EmployeeDetails cuttingBy;

    EmployeeDetails tieBy;

    EmployeeDetails custom;

    Double grossWeight;

    Double netWeight;

    Double wastageWeight;

    Double wastagePercent;

    Double ribWeight;

    Double paipinWeight;

    Double ribNetWeight;
}
