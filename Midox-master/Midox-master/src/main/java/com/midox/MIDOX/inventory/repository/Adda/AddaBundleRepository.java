package com.midox.MIDOX.inventory.repository.Adda;

import com.midox.MIDOX.inventory.entity.AddaBundle;
import com.midox.MIDOX.inventory.entity.AddaPattern;
import com.midox.MIDOX.inventory.entity.JobHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.sql.Date;
import java.util.List;

public interface AddaBundleRepository extends JpaRepository<AddaBundle, Integer> {

    String findAllByCriteriaQuery = "select distinct ab.* from  adda_bundle ab, adda_pattern ap, adda a " +
            " where ab.pattern_id = ap.pattern_id " +
            " and ap.adda_id = a.adda_id " +
            " and (:employee_id is null or ab.current_employee_id = :employee_id)" +
            " and (:bundle_id is null or ab.bundle_id = :bundle_id)" +
            " and (:process_cd is null or ab.current_process_cd ILIKE %:process_cd%)" +
            " and (:pattern_id is null or ab.pattern_id = :pattern_id) " +
            " and (:adda_id is null or a.adda_id = :adda_id) " +
            " and (:status is null or ab.status ILIKE %:status%) " +
            " and (:exclude_status is null or ab.status NOT ILIKE %:exclude_status%)" +
            " order by ab.created_at asc";

    @Query(value = findAllByCriteriaQuery, nativeQuery = true)
    List<AddaBundle> findBundlesByCriteria(@Param("employee_id") Integer employeeId, @Param("process_cd") String processCd,
                                           @Param("bundle_id") Integer bundleId,
                                           @Param("pattern_id") Integer patternId,
                                           @Param("adda_id") Integer addaId,
                                           @Param("exclude_status") String exclude_status,
                                           @Param("status") String status);

    @Query(value = "select last_value from bundle_sequence", nativeQuery = true)
    Long getSeqCurrentVal();

    @Query(value = "SELECT nextval('bundle_sequence')", nativeQuery = true)
    Long getSeqNextVal();

    List<AddaBundle> findAllByPatternId(Integer patterId);
}
