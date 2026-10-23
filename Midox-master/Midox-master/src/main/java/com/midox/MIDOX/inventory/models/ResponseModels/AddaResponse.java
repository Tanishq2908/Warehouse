package com.midox.MIDOX.inventory.models.ResponseModels;

import com.midox.MIDOX.inventory.constants.TextileEnum;
import com.midox.MIDOX.inventory.entity.AddaMaterial;
import com.midox.MIDOX.inventory.entity.AddaPattern;
import com.midox.MIDOX.inventory.models.MapperModels.BrandDetails;
import com.midox.MIDOX.inventory.models.MapperModels.EntityCode;
import com.midox.MIDOX.inventory.models.ResponseWrapper;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

import java.sql.Date;
import java.util.List;

@Getter @Setter
public class AddaResponse extends AbstractEntityResponse implements ResponseWrapper {

    private Integer addaId;
    String addaNo;
    DesignResponse designDetails;

    BrandDetails brandDetails;
    Double quantity;

    Date completionDate;

    EntityCode status;

    String remarks;

    String designNo;
    List<AddaMaterialResponse> addaMaterials;

    List<AddaPatternResponse> addaPatterns;

    AddaInfoResponse addaInfo;

    EntityCode productCd;

    Double remainingQtyForPattern;
}
