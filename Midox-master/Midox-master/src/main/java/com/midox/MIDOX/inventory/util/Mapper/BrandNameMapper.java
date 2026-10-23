package com.midox.MIDOX.inventory.util.Mapper;

import com.midox.MIDOX.inventory.entity.Brand;
import com.midox.MIDOX.inventory.models.MapperModels.BrandDetails;
import com.midox.MIDOX.inventory.service.spi.IBrandService;
import com.midox.MIDOX.inventory.util.MapperUtils;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper( componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        injectionStrategy = InjectionStrategy.CONSTRUCTOR,
imports = {MapperUtils.class})
public abstract class BrandNameMapper {

    @Mapping(source = "brandId", target = "brandId")
    @Mapping(source = "brandId", target = "brandName", qualifiedByName = "mapBrandName")
    abstract BrandDetails intToBrand(Integer brandId);

    @Autowired
    private IBrandService brandService;

    @Named(value = "mapBrandName")
    String mapBrandFromId(Integer brandId) {
        Brand brand = brandService.getBrandById(brandId);
        return brand.getBrandName();
    }

}
