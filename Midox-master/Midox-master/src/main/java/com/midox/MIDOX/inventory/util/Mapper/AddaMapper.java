package com.midox.MIDOX.inventory.util.Mapper;

import com.midox.MIDOX.inventory.entity.*;
import com.midox.MIDOX.inventory.models.MapperModels.EntityCode;
import com.midox.MIDOX.inventory.models.ResponseModels.*;
import com.midox.MIDOX.inventory.service.spi.IBrandService;
import com.midox.MIDOX.inventory.service.spi.IDesignService;
import com.midox.MIDOX.inventory.util.ValidationUtil;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Mapper( componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {EntityCodeMapper.class, EmployeeNameMapper.class, BrandNameMapper.class, DesignMapper.class, AddaMaterialMapper.class, AddaPatternMapper.class, AddaInfoMapper.class})
public abstract class AddaMapper {

    @Mapping(source = "brandId", target = "brandDetails")
    @Mapping(source = "designId", target = "productCd", qualifiedByName = "mapProductCd")
    @Mapping(source = "designId", target = "designNo", qualifiedByName = "mapDesignNo")
    @Mapping(source = "designId", target = "designDetails", qualifiedByName = "mapDesignFromId")
    public abstract AddaResponse toAddaResponse(Adda adda);

    abstract List<AddaMaterialResponse> getAddaMaterials(List<AddaMaterial> materials);
    abstract List<AddaPatternResponse> getAddaPatterns(List<AddaPattern> patterns);
    //abstract AddaInfoResponse getAddaInfo(AddaInfo info);


    @Autowired
    private IDesignService designService;

    @Named(value = "mapProductCd")
    String mapProductCd(Integer designId) {
        List<Design> designs = designService.getDesignByCriteria(designId, null, null, null);
        if(ValidationUtil.isNotEmpty(designs) && designs.size() == 1){
            Design design = designs.get(0);
            return design.getProductCd();
        }
        return null;
    }

    @Named(value = "mapDesignNo")
    String mapDesignNo(Integer designId) {
        List<Design> designs = designService.getDesignByCriteria(designId, null, null, null);
        if(ValidationUtil.isNotEmpty(designs) && designs.size() == 1){
            Design design = designs.get(0);
            return design.getDesignNo();
        }
        return null;
    }

    @Named(value = "mapDesignFromId")
    Design mapDesignFromId(Integer designId) {
        List<Design> result = designService.getDesignByCriteria(designId, null, null, null);
        if(ValidationUtil.isNotEmpty(result) && result.size() == 1){
            return result.get(0);
        }
        return null;
    }
}
