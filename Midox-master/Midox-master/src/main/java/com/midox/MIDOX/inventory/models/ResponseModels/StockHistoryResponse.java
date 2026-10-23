package com.midox.MIDOX.inventory.models.ResponseModels;

import com.midox.MIDOX.inventory.entity.Supplier;
import com.midox.MIDOX.inventory.models.ResponseWrapper;
import lombok.Getter;
import lombok.Setter;

import java.sql.Date;

@Getter
@Setter
public class StockHistoryResponse extends AbstractEntityResponse implements ResponseWrapper {

    private Integer stockHistoryId;

    private StockResponse stockDetails;

    private String billNo;

    private Double quantity;

    private Double amount;

    private Date billDate;

    private char creditDebitInd;
    Supplier supplierDetails;

    Integer addaId;
    String addaNo;

}
