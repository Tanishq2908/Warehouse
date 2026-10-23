package com.midox.MIDOX.inventory.models.ResponseModels;

import com.midox.MIDOX.inventory.entity.AbstractDataEntity;
import com.midox.MIDOX.inventory.entity.FinishedGoods;
import com.midox.MIDOX.inventory.models.MapperModels.EntityCode;
import com.midox.MIDOX.inventory.models.ResponseWrapper;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

import java.sql.Date;

@Getter
@Setter
public class DispatchResponse extends AbstractDataEntity implements ResponseWrapper {
    private Integer dispatchId;
    Date dispatchDate;

    String remarks;
    String vehicleNo;

    String dispatchNo;

    FinishedGoodsResponse finishedGoods;

    Double quantity;
}

