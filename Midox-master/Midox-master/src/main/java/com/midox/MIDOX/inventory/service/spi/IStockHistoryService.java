package com.midox.MIDOX.inventory.service.spi;

import com.midox.MIDOX.inventory.Exception.MidoxException;
import com.midox.MIDOX.inventory.entity.StockHistory;
import com.midox.MIDOX.inventory.models.RequestModels.StockHistorySearchCriteria;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface IStockHistoryService {
    public Boolean addStockHistory(List<StockHistory> stockHistories);

    List<StockHistory> getStockHistories(int id);

    List<StockHistory> getStockHistoryFromCriteria(StockHistorySearchCriteria searchCriteria);

    StockHistory createStockHistory(StockHistory stockHistory);

    @Transactional(propagation = Propagation.REQUIRED)
    StockHistory updateStockHistory(StockHistory stockHistory) throws MidoxException;

    @Transactional(propagation = Propagation.REQUIRED)
    void deleteStockHistory(StockHistory stockHistory) throws MidoxException;
}
