package com.midox.MIDOX.inventory.repository;

import com.midox.MIDOX.inventory.entity.Adda;
import com.midox.MIDOX.inventory.entity.Design;
import com.midox.MIDOX.inventory.entity.DesignProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DesignProcessRepository extends JpaRepository<DesignProcess, Integer> {

    String findAllByBrandNameQuery = "select * from brand where (:brand_name is null or brand_name ILIKE %:brand_name%)" +
            " and (:brand_id is null or brand_id = :brand_id)";

    @Query(value = findAllByBrandNameQuery, nativeQuery = true)
    List<Design> findBrandsByCriteria(@Param("brand_name") String brandName, @Param("brand_id") Integer brandId);


    String findAllByCriteriaQuery = "select dp.* from design_process dp, design d, adda a where dp.design_id = d.design_id and a.design_id = d.design_id" +
            " and (:design_no is null or d.design_no ILIKE %:design_no%)" +
            " and (:design_id is null or d.design_id = :design_id) " +
            " and (:adda_id is null or a.adda_id = :adda_id) " +
            " and (:process_cd is null or dp.process_cd ILIKE %:process_cd%) " +
            " order by dp.created_at DESC";

    @Query(value = findAllByCriteriaQuery, nativeQuery = true)
    List<DesignProcess> findDesignProcessesByCriteria(@Param("design_id") Integer designId,
                                   @Param("design_no") String designNo, @Param("process_cd") String processCd,
                                   @Param("adda_id") Integer addaId);


    List<DesignProcess> findAllByDesignId(Integer designId);
}
