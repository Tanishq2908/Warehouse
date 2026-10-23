package com.midox.MIDOX.inventory.models.ResponseModels;

import com.midox.MIDOX.inventory.entity.Employee;
import com.midox.MIDOX.inventory.models.MapperModels.EmployeeDetails;
import com.midox.MIDOX.inventory.models.MapperModels.EntityCode;
import lombok.*;

import java.sql.Date;
import java.sql.Timestamp;

@Getter
@Setter
public class JobCardResponse {

    private String jobCardNo;

    private EmployeeDetails employee;

    EntityCode jobAssigned;

    private String addaNo;

    EntityCode item;

    EntityCode size;

    private String bundle;

    private String design;

    private Double quantity;

    private Double wageToProvide;

    private Double rate;

    private Integer jobFlowNumber;

    private EntityCode status;

    private Timestamp lastModifiedAt;

    private EmployeeDetails lastModifiedBy;

    private Date assignDate;




}

