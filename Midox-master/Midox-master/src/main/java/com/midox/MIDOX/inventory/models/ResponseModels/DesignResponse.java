package com.midox.MIDOX.inventory.models.ResponseModels;

import com.midox.MIDOX.inventory.constants.TextileEnum;
import com.midox.MIDOX.inventory.models.MapperModels.BrandDetails;
import com.midox.MIDOX.inventory.models.MapperModels.EntityCode;
import com.midox.MIDOX.inventory.models.ResponseWrapper;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter @Setter
public class DesignResponse extends AbstractEntityResponse implements ResponseWrapper {
    private Integer designId;
    String designNo;

    BrandDetails brandDetails;

    EntityCode productCd;

    String details;

    private TextileEnum.Status status;

    List<DesignProcessResponse> processes;
}
