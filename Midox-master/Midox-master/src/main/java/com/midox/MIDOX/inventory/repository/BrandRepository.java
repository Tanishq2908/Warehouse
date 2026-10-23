package com.midox.MIDOX.inventory.repository;

import com.midox.MIDOX.inventory.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BrandRepository extends JpaRepository<Brand, Integer> {

    String findAllByBrandNameQuery = "select * from brand where (:brand_name is null or brand_name ILIKE %:brand_name%)" +
            " and (:brand_id is null or brand_id = :brand_id)";

    @Query(value = findAllByBrandNameQuery, nativeQuery = true)
    List<Brand> findBrandsByCriteria(@Param("brand_name") String brandName, @Param("brand_id") Integer brandId);

}
