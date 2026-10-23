package com.midox.MIDOX.inventory.models.ResponseModels;

import com.midox.MIDOX.inventory.constants.TextileEnum;
import com.midox.MIDOX.inventory.entity.AddaPattern;
import com.midox.MIDOX.inventory.models.MapperModels.BrandDetails;
import com.midox.MIDOX.inventory.models.MapperModels.EntityCode;
import com.midox.MIDOX.inventory.models.ResponseWrapper;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

import java.sql.Date;
import java.util.List;

@Getter @Setter
public class AddaPatternResponse extends AbstractEntityResponse implements ResponseWrapper {

    Integer patternId;

    Integer addaId;

    EntityCode size;

    EntityCode color;

    Integer bundleSize;

    Double quantity;

    String patternName;
}
