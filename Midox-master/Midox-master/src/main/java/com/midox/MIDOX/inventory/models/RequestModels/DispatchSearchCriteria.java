package com.midox.MIDOX.inventory.models.RequestModels;

import com.midox.MIDOX.inventory.models.RequestWrapper;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DispatchSearchCriteria implements RequestWrapper {
    Integer designId;
    String designNo;
    String addaNo;
    Integer addaId;
    Integer patternId;
    Integer brandId;
    String productCd;
    Integer finishedGoodsId;
}
