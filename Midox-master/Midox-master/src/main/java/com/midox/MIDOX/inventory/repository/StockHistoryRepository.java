package com.midox.MIDOX.inventory.repository;

import com.midox.MIDOX.inventory.entity.Stock;
import com.midox.MIDOX.inventory.entity.StockHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.Timestamp;
import java.util.List;

@Repository
public interface StockHistoryRepository extends JpaRepository<StockHistory, Integer> {
//    String insertStockHistoryQuery = "INSERT into public.stock_history( " +
//            "  stock_history_id, amount, created_at, created_by, packing_slip_no, quantity, updated_at, updated_by, stock) " +
//            " VALUES (:stockHistoryId, :amount, :timestamp, :userId, :packingSlipNo, :quantity, :timestamp, :userId, :stock);";

    String findLatestStockHistoryIdQuery = "SELECT max(stock_history_id) FROM stock_history;";

    String findAllStockHistoryForStockQuery = "select * from stock_history where stock_id = :stock_id";

    // Explicit casting of timestamp is needed for optional
    // As timestamp is compared with date, the date will be converted with timestamp as start of day, thus subtracted 1 day from update at so that toDate search criteria works
    String findAllStockHistoryByCriteriaQuery = "select * from stock_history where  (:stock_id is null or stock_id=:stock_id) " +
            " and (:adda_id is null or adda_id=:adda_id) " +
            " and (cast(:from_updated_at as timestamp) is null or updated_at >= :from_updated_at) " +
            " and (cast(:to_updated_at as timestamp) is null or updated_at - INTERVAL '1 DAY' <= :to_updated_at) ";

//    @Query(value = insertStockHistoryQuery, nativeQuery = true)
//    void insertStockHistory(@Param("stockHistoryId") Integer stockHistoryId, @Param("amount") Float amount, @Param("userId") String userId, @Param("quantity") Integer quantity,
//                            @Param("packingSlipNo") Integer packingSlipNo, @Param("timestamp") Timestamp timestamp, @Param("stock") Integer stock) throws RuntimeException;

    @Query(value = findLatestStockHistoryIdQuery, nativeQuery = true)
    int findLatestStockHistoryId();

    @Query(value = findAllStockHistoryForStockQuery, nativeQuery = true)
    List<StockHistory> findAllByStockId(@Param("stock_id") Integer stockId);

    @Query(value = findAllStockHistoryByCriteriaQuery, nativeQuery = true)
    List<StockHistory> findAllBySearchCriteria(@Param("stock_id") Integer stockId, @Param("adda_id") Integer addaId, @Param("from_updated_at") Timestamp fromUpdatedAt, @Param("to_updated_at") Timestamp toUpdatedAt);
}
