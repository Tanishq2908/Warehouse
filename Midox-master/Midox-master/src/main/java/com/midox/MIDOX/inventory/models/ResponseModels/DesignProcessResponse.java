package com.midox.MIDOX.inventory.models.ResponseModels;

import com.midox.MIDOX.inventory.constants.TextileEnum;
import com.midox.MIDOX.inventory.models.MapperModels.EntityCode;
import com.midox.MIDOX.inventory.models.ResponseWrapper;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class DesignProcessResponse extends AbstractEntityResponse implements ResponseWrapper {

    private Integer processId;

    private Integer designId;

    EntityCode processCd;


    Integer priority;


    private Double ratePerPeice;


    String details;


    private TextileEnum.Status status;
}
