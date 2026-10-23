package com.midox.MIDOX.inventory.models.ResponseModels;

import com.midox.MIDOX.inventory.constants.TextileEnum;
import com.midox.MIDOX.inventory.entity.AbstractDataEntity;
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

@Getter
@Setter
public class FinishedGoodsResponse extends AbstractDataEntity implements ResponseWrapper {
    private Integer finishedGoodsId;

    Integer addaId;
    String addaNo;
    String designNo;
    String patternName;
    Integer patternId;
    EntityCode size;
    EntityCode color;


    Double dispatchedQuantity;

    Double finishedQuantity;

    Double availableQuantity;

    EntityCode status;
}

