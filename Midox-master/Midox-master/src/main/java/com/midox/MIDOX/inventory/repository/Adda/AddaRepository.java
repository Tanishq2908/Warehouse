package com.midox.MIDOX.inventory.repository.Adda;

import com.midox.MIDOX.inventory.entity.Adda;
import com.midox.MIDOX.inventory.entity.Design;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AddaRepository extends JpaRepository<Adda, Integer> {

    String findAllByCriteriaQuery = "select a.* from adda a, design d where a.design_id = d.design_id " +
            " and (:design_no is null or d.design_no ILIKE %:design_no%)" +
            " and (:adda_no is null or a.adda_no ILIKE %:adda_no%)" +
            " and (:design_id is null or a.design_id = :design_id) " +
            " and (:adda_id is null or a.adda_id = :adda_id) " +
            " and (:brand_id is null or a.brand_id = :brand_id) " +
            " and (:product_cd is null or d.product_cd ILIKE %:product_cd%) " +
            " order by a.created_at DESC";

    @Query(value = findAllByCriteriaQuery, nativeQuery = true)
    List<Adda> findAddasByCriteria(@Param("design_id") Integer designId, @Param("design_no") String designNo, @Param("adda_id") Integer addaId, @Param("brand_id") Integer brandId, @Param("product_cd") String productCd,  @Param("adda_no") String addaNo);

    @Query(value = "select last_value from adda_sequence", nativeQuery = true)
    Long getSeqCurrentVal();
}
