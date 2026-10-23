package com.midox.MIDOX.inventory.repository;

import com.midox.MIDOX.inventory.entity.Design;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DesignRepository extends JpaRepository<Design, Integer> {

    String findAllByCriteriaQuery = "select * from design where (:design_no is null or design_no ILIKE %:design_no%)" +
            " and (:design_id is null or design_id = :design_id) " +
            " and (:brand_id is null or brand_id = :brand_id) " +
            " and (:product_cd is null or product_cd ILIKE %:product_cd%)";

    String findDesignNoByAddaIdQuery = "select d.* from adda a, design d where a.design_id = d.design_id " +
            " and (:adda_id is null or a.adda_id = :adda_id) ";

    @Query(value = findAllByCriteriaQuery, nativeQuery = true)
    List<Design> findDesignsByCriteria(@Param("design_id") Integer designId, @Param("design_no") String designNo, @Param("brand_id") Integer brandId, @Param("product_cd") String productCd);

    @Query(value = findDesignNoByAddaIdQuery, nativeQuery = true)
    Design findDesignNoByAddaIdQuery(@Param("adda_id") Integer addaId);

}
