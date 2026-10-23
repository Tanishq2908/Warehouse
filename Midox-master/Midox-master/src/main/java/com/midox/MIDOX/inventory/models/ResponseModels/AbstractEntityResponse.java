package com.midox.MIDOX.inventory.models.ResponseModels;

import com.midox.MIDOX.inventory.models.MapperModels.EmployeeDetails;
import com.midox.MIDOX.inventory.models.ResponseWrapper;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;

@Getter @Setter
public class AbstractEntityResponse implements ResponseWrapper {

    private Timestamp createdAt;

    private Timestamp updatedAt;

    private EmployeeDetails createdBy;

    private EmployeeDetails updatedBy;
}
