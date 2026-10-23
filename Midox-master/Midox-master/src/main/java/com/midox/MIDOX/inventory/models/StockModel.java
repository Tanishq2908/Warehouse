package com.midox.MIDOX.inventory.models;

import com.midox.MIDOX.inventory.entity.Stock;
import com.midox.MIDOX.inventory.entity.StockHistory;
import lombok.Data;

@Data
public class StockModel implements RequestWrapper {
    Stock stock;
    StockHistory stockHistory;
}
