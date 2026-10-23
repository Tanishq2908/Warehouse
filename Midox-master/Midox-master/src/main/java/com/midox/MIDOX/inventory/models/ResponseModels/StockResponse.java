package com.midox.MIDOX.inventory.models.ResponseModels;

import com.midox.MIDOX.inventory.models.MapperModels.EntityCode;
import com.midox.MIDOX.inventory.models.ResponseWrapper;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class StockResponse extends AbstractEntityResponse implements ResponseWrapper {
    private Integer stockId;

    private EntityCode materialCd;
    private EntityCode subcategoryCd;

    private EntityCode colorFabricCd;

    private EntityCode unit;
    String stockName;

    private Double availableQuantity;
}
