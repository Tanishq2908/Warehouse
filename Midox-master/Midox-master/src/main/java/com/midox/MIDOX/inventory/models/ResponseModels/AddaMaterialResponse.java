package com.midox.MIDOX.inventory.models.ResponseModels;

import com.midox.MIDOX.inventory.models.MapperModels.EntityCode;
import com.midox.MIDOX.inventory.models.ResponseWrapper;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

@Getter @Setter
public class AddaMaterialResponse extends AbstractEntityResponse implements ResponseWrapper {

    private Integer addaMaterialId;

    Integer addaId;

    private StockResponse stockDetails;

    Double quantity;
}
