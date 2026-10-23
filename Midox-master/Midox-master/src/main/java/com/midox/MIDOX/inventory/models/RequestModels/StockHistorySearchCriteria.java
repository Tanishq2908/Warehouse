package com.midox.MIDOX.inventory.models.RequestModels;

import com.midox.MIDOX.inventory.models.RequestWrapper;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;

@Getter
@Setter
public class StockHistorySearchCriteria implements RequestWrapper {

    Timestamp fromDate;
    Timestamp toDate;
    Integer stockId;
    Integer addaId;

}
