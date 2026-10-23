package com.midox.MIDOX.inventory.models.RequestModels;

import com.midox.MIDOX.inventory.models.RequestWrapper;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class DesignSearchCriteria implements RequestWrapper {

    Integer designId;
    String designNo;
    Integer brandId;
    String productCd;
    String processCd;
    Integer addaId;
}
