package com.midox.MIDOX.inventory.service.spi;

import com.midox.MIDOX.inventory.entity.Brand;

import java.util.List;

public interface IBrandService {
    Brand addBrand(Brand brand);

    Brand editBrand(Brand brand);

    List<Brand> getBrandsByCriteria(String brandName, Integer brandId);
    Brand getBrandById(Integer brandId);
}
