package com.midox.MIDOX.inventory.models.RequestModels;

import com.midox.MIDOX.inventory.models.RequestWrapper;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

import java.sql.Timestamp;

@Getter
@Setter
public class StockSearchCriteria implements RequestWrapper {

    Integer stockId;


    String materialCd;
    String subcategoryCd;
    String colorFabricCd;
    String stockName;
}
