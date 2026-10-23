package com.midox.MIDOX.inventory.util.Mapper;

import com.midox.MIDOX.inventory.entity.*;
import com.midox.MIDOX.inventory.models.RequestModels.AddaSearchCriteria;
import com.midox.MIDOX.inventory.models.ResponseModels.FinishedGoodsResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.JobHistoryResponse;
import com.midox.MIDOX.inventory.repository.SearchJDBC;
import com.midox.MIDOX.inventory.service.spi.IAddaService;
import com.midox.MIDOX.inventory.service.spi.IDesignService;
import com.midox.MIDOX.inventory.util.ValidationUtil;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Mapper( componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {EntityCodeMapper.class, EmployeeNameMapper.class})
public abstract class FinishedGoodsMapper {

    @Mapping(source = "addaId", target = "addaNo", qualifiedByName = "mapAddaNo")
    @Mapping(source = "addaId", target = "designNo", qualifiedByName = "mapDesignNo")
    @Mapping(source = "patternId", target = "patternName", qualifiedByName = "mapPatternName")
    @Mapping(source = "patternId", target = "color", qualifiedByName = "mapColor")
    @Mapping(source = "patternId", target = "size", qualifiedByName = "mapSize")
    public abstract FinishedGoodsResponse toFinishedGoodsResponse(FinishedGoods finishedGoods);

    @Autowired
    private IAddaService addaService;

    @Autowired
    private IDesignService designService;

    AddaPattern addaPattern;

    @Named(value = "mapAddaNo")
    String mapAddaNo(Integer addaId) {
        AddaSearchCriteria searchCriteria = new AddaSearchCriteria();
        searchCriteria.setAddaId(addaId);
        List<Adda> addas = addaService.getAddaByCriteria(searchCriteria);
        if(ValidationUtil.isNotEmpty(addas) && addas.size() == 1){
            Adda adda = addas.get(0);
            return adda.getAddaNo();
        }
        return null;
    }

    @Named(value = "mapDesignNo")
    String mapDesignNo(Integer addaId) {
       Design design = designService.getDesignNoForAddaId(addaId);
        if(null != design){
            return design.getDesignNo();
        }
        return null;
    }

    @Named(value = "mapPatternName")
    String mapPatternName(Integer patternId) {
        if(null != addaPattern &&addaPattern.getPatternId() == patternId){
            return addaPattern.getSize();
        }else {
            addaPattern = addaService.getPatternById(patternId);
            if(null != addaPattern){
                return addaPattern.getPatternName();
            }
        }
        return null;
    }

    @Named(value = "mapColor")
    String mapColor(Integer patternId) {
        if(null != addaPattern &&addaPattern.getPatternId() == patternId){
            return addaPattern.getColor();
        }else {
            addaPattern = addaService.getPatternById(patternId);
            if (null != addaPattern) {
                return addaPattern.getColor();
            }
        }
        return null;
    }

    @Named(value = "mapSize")
    String mapSize(Integer patternId) {
        if(null != addaPattern &&addaPattern.getPatternId() == patternId){
            return addaPattern.getSize();
        }else {
            addaPattern = addaService.getPatternById(patternId);
            if(null != addaPattern){
                return addaPattern.getSize();
            }
        }
        return null;
    }
}
