package com.midox.MIDOX.inventory.service.api;

import com.midox.MIDOX.inventory.entity.Brand;
import com.midox.MIDOX.inventory.repository.BrandRepository;
import com.midox.MIDOX.inventory.service.spi.IBrandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements IBrandService {

    @Autowired
    BrandRepository brandRepo;

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public Brand addBrand(Brand brand){
        brand.setDefaultValues();
        return brandRepo.saveAndFlush(brand);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public Brand editBrand(Brand brand){
        return brandRepo.saveAndFlush(brand);
    }

    @Override
    public List<Brand> getBrandsByCriteria(String brandName, Integer brandId){
        return  brandRepo.findBrandsByCriteria(brandName, brandId);
    }

    @Override
    public Brand getBrandById(Integer brand){
        return  brandRepo.findById(brand).get();
    }

}
