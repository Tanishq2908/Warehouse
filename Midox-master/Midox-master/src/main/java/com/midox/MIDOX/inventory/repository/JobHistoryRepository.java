package com.midox.MIDOX.inventory.repository;

import com.midox.MIDOX.inventory.entity.Adda;
import com.midox.MIDOX.inventory.entity.Employee;
import com.midox.MIDOX.inventory.entity.JobHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.Timestamp;
import java.util.List;

@Repository
public interface JobHistoryRepository extends JpaRepository<JobHistory, Integer> {

    String findAllByCriteriaQuery = "select distinct j.* from job_history j, adda_bundle_history abh, adda_bundle ab, adda_pattern ap, adda a " +
            " where j.bundle_history_id = abh.bundle_history_id " +
            " and abh.bundle_id = ab.bundle_id" +
            " and ab.pattern_id = ap.pattern_id " +
            " and ap.adda_id = a.adda_id " +
            " and (:employee_id is null or j.employee_id = :employee_id)" +
            " and (:bundle_history_id is null or j.bundle_history_id = :bundle_history_id)" +
            " and (:process_cd is null or j.process_cd ILIKE %:process_cd%)" +
            " and (cast(:completion_date as timestamp) is null or j.completion_date = :completion_date) " +
            " and (:adda_id is null or a.adda_id = :adda_id) " +
            " and (:payment_status is null or j.payment_status ILIKE %:payment_status%) " +
            " and (:not_payment_status is null or j.payment_status NOT ILIKE %:not_payment_status%)" +
            " and (:status is null or j.status ILIKE %:status%) " +
            " and (:not_status is null or j.status NOT ILIKE %:not_status%) " +
            " and (cast(:start_date as timestamp) is null or j.created_at >= :start_date) " +
            " and (cast(:end_date as timestamp) is null or j.created_at - INTERVAL '1 DAY' <= :end_date) " +
            " order by j.created_at asc" +
            " OFFSET :start_key LIMIT :records";

    @Query(value = findAllByCriteriaQuery, nativeQuery = true)
    List<JobHistory> findJobHistoriesByCriteria(@Param("employee_id") Integer employeeId, @Param("process_cd") String processCd,
                                                @Param("adda_id") Integer addaId,
                                                @Param("not_payment_status") String paymentStatusToExclude,
                                                @Param("payment_status") String paymentStatusToInclude,
                                                @Param("status") String statusToInclude,
                                                @Param("not_status") String statusToExclude,
                                                @Param("completion_date") Date completionDate,
                                                @Param("bundle_history_id") Integer bundleHistoryId,
                                                @Param("start_date") Date startDate,
                                                @Param("end_date") Date endDate,
                                                @Param("start_key") Integer startKey,
                                                @Param("records") Integer records);

}
