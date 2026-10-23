package com.midox.MIDOX.inventory.repository.Adda;

import com.midox.MIDOX.inventory.entity.Adda;
import com.midox.MIDOX.inventory.entity.AddaBundleHistory;
import com.midox.MIDOX.inventory.entity.AddaPattern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AddaBundleHistoryRepository extends JpaRepository<AddaBundleHistory, Integer> {

    String findAllByCriteriaQuery = "select * from adda_bundle_history where  " +
            " (:bundle_id is null or bundle_id = :bundle_id)" +
            " and (:process_cd is null or process_cd = :process_cd) " +
            " and (:bundle_history_id is null or bundle_history_id = :bundle_history_id) " +
            " order by created_at desc";

    @Query(value = findAllByCriteriaQuery, nativeQuery = true)
    List<AddaBundleHistory> getBundleHistoryBySearchCriteria(@Param("bundle_id") Integer bundleId, @Param("process_cd") String processCd,
                                                             @Param("bundle_history_id") Integer bundle_history_id);


    AddaBundleHistory findByProcessCd(String currentProcessCd);
}
