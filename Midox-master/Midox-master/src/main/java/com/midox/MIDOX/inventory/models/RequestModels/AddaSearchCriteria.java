package com.midox.MIDOX.inventory.models.RequestModels;

import com.midox.MIDOX.inventory.models.RequestWrapper;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class AddaSearchCriteria implements RequestWrapper {

    Integer designId;
    String designNo;
    String addaNo;
    Integer addaId;
    Integer brandId;
    String productCd;
    boolean loadDependents = true;
}
