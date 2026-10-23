package com.midox.MIDOX.inventory.service.spi;

import com.midox.MIDOX.inventory.Exception.MidoxException;
import com.midox.MIDOX.inventory.entity.Stock;
import com.midox.MIDOX.inventory.entity.StockHistory;
import com.midox.MIDOX.inventory.models.RequestModels.StockSearchCriteria;
import com.midox.MIDOX.inventory.models.StockModel;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface IStockService {

    public Boolean addStocks(List<StockModel> stocks);

    List<Stock> getAllStocks();

    Stock getStockById(Integer stockId);

    List<Stock> getStocksWithCriteria(StockSearchCriteria searchCriteria);

    Stock createStock(Stock stock);

    @Transactional(propagation = Propagation.REQUIRED)
    Stock updateStock(Stock stock) throws MidoxException;

    public void updateStockCount(List<Stock> stock, StockHistory stockHistory);
}
