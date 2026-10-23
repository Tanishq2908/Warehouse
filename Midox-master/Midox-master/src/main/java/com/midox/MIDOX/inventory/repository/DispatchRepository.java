package com.midox.MIDOX.inventory.repository;

import com.midox.MIDOX.inventory.entity.Design;
import com.midox.MIDOX.inventory.entity.Dispatch;
import com.midox.MIDOX.inventory.entity.FinishedGoods;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DispatchRepository extends JpaRepository<Dispatch, Integer> {

    String findAllByCriteriaQuery = "select disp.* from dispatch disp, finished_goods fg, adda a, adda_pattern ap, design d where " +
            " a.design_id = d.design_id " +
            " and disp.finished_goods_id = fg.finished_goods_id " +
            " and a.adda_id = ap.adda_id " +
            " and fg.pattern_id = ap.pattern_id " +
            " and fg.adda_id = a.adda_id " +
            " and (:finished_goods_id is null or fg.finished_goods_id = :finished_goods_id) " +
            " and (:adda_id is null or fg.adda_id = :adda_id) " +
            " and (:pattern_id is null or fg.pattern_id = :pattern_id) " +
            " and (:brand_id is null or a.brand_id = :brand_id) " +
            " and (:adda_no is null or a.adda_no ILIKE %:adda_no%)" +
            " and (:design_no is null or d.design_no ILIKE %:design_no%)" +
            " and (:product_cd is null or d.product_cd ILIKE %:product_cd%)";

    @Query(value = findAllByCriteriaQuery, nativeQuery = true)
    List<Dispatch> findDispatchByCriteria(@Param("finished_goods_id") Integer finishedGoodsId, @Param("adda_id") Integer addaId, @Param("pattern_id") Integer patternId,
                                                    @Param("brand_id") Integer brandId, @Param("adda_no") String addaNo,
                                                    @Param("design_no") String designNo, @Param("product_cd") String productCd);

}
