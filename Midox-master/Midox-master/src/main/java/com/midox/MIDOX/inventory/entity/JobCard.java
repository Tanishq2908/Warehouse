package com.midox.MIDOX.inventory.entity;

import com.midox.MIDOX.inventory.constants.TextileEnum;
import jakarta.persistence.*;
import lombok.*;

import java.sql.Date;
import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor(force = true)
@AllArgsConstructor
@Builder
public class JobCard {

    private String jobCardNo;

    private Integer employeeId;

    String jobAssigned;

    private String addaNo;

    String item;

    String size;

    private String bundle;
    private String pattern;
    private String design;

    private Double quantity;

    private Double wageToProvide;

    private Double rate;

    private Integer jobFlowNumber;

    private String status;

    private Timestamp lastModifiedAt;

    private Integer lastModifiedBy;

    private Date assignDate;




}

