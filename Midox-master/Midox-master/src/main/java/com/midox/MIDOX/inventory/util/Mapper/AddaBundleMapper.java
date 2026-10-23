package com.midox.MIDOX.inventory.util.Mapper;

import com.midox.MIDOX.inventory.entity.*;
import com.midox.MIDOX.inventory.models.RequestModels.AddaSearchCriteria;
import com.midox.MIDOX.inventory.models.RequestModels.DesignSearchCriteria;
import com.midox.MIDOX.inventory.models.ResponseModels.AddaBundleResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.AddaPatternResponse;
import com.midox.MIDOX.inventory.service.spi.IAddaService;
import com.midox.MIDOX.inventory.service.spi.IDesignProcessService;
import com.midox.MIDOX.inventory.service.spi.IDesignService;
import com.midox.MIDOX.inventory.util.ValidationUtil;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;

import java.util.List;

@Mapper( componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {EntityCodeMapper.class, EmployeeNameMapper.class})
public abstract class AddaBundleMapper {

    @Mapping(source = "patternId", target = "color", qualifiedByName = "mapColor")
    @Mapping(source = "patternId", target = "size", qualifiedByName = "mapSize")
    @Mapping(source = "patternId", target = "addaNo", qualifiedByName = "mapAddaNo")
    @Mapping(source = "patternId", target = "designNo", qualifiedByName = "mapDesignNo")
    @Mapping(source = ".", target = "jobRate", qualifiedByName = "mapJobRate")
    @Mapping(source = ".", target = "jobFlowNo", qualifiedByName = "mapPriority")
    public abstract AddaBundleResponse toAddaBundle(AddaBundle bundle);

    @Autowired
    private IAddaService addaService;

    @Autowired
    private IDesignService designService;

    @Autowired
    IDesignProcessService processService;

    AddaPattern addaPattern;

    Adda adda;

    Design design;

    DesignProcess designProcess;

    @Named(value = "mapColor")
    String mapColor(Integer patternId) {
        addaPattern = addaService.getPatternById(patternId);
        if(null != addaPattern){
            return addaPattern.getColor();
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

    @Named(value = "mapAddaNo")
    String mapAddaNo(Integer patternId) {
        if(null != addaPattern &&addaPattern.getPatternId() == patternId){
            //do nothing
        }else {
            addaPattern = addaService.getPatternById(patternId);
        }
        if(null != addaPattern){
            AddaSearchCriteria searchCriteria = new AddaSearchCriteria();
            searchCriteria.setAddaId(addaPattern.getAddaId());
            List<Adda> addas = addaService.getAddaByCriteria(searchCriteria);
            if(ValidationUtil.isNotEmpty(addas) && addas.size() == 1){
                adda = addas.get(0);
                return adda.getAddaNo();
            }
        }
        return null;
    }

    @Named(value = "mapDesignNo")
    String mapDesignNo(Integer patternId) {
        if(null != addaPattern &&addaPattern.getPatternId() == patternId){
            //do nothing
        }else {
            addaPattern = addaService.getPatternById(patternId);
        }
        if(null != addaPattern){
            design = designService.getDesignNoForAddaId(addaPattern.getAddaId());
            if(null != design){
                return design.getDesignNo();
            }
        }
        return null;
    }

    @Named(value = "mapJobRate")
    Double mapJobRate(AddaBundle bundle) {
        if(null != addaPattern &&addaPattern.getPatternId() == bundle.getPatternId()){
            //do nothing
        }else {
            addaPattern = addaService.getPatternById(bundle.getPatternId());
        }
        if(null != addaPattern) {
            if (null != adda && null != designProcess
                    && adda.getDesignId() == designProcess.getDesignId()
                    && designProcess.getProcessCd().equals(bundle.getCurrentProcessCd())) {
                //do nothing
            } else {
                DesignSearchCriteria searchCriteria = new DesignSearchCriteria();
                searchCriteria.setAddaId(adda.getAddaId());
                searchCriteria.setProcessCd(bundle.getCurrentProcessCd());
                List<DesignProcess> processes = processService.getAllProcessesByDesignCriteria(searchCriteria);
                if (ValidationUtil.isNotEmpty(processes) && processes.size() == 1 && processes.get(0).getProcessCd().equals(bundle.getCurrentProcessCd())) {
                    designProcess = processes.get(0);
                }
            }
            return null == designProcess ? null : designProcess.getRatePerPeice();
        }
        return null;
    }

    @Named(value = "mapPriority")
    Integer mapPriority(AddaBundle bundle) {
        if(null != addaPattern &&addaPattern.getPatternId() == bundle.getPatternId()){
            //do nothing
        }else {
            addaPattern = addaService.getPatternById(bundle.getPatternId());
        }
        if(null != addaPattern){
            if(null != adda && null != designProcess
                    && adda.getDesignId() == designProcess.getDesignId()
                    && designProcess.getProcessCd().equals(bundle.getCurrentProcessCd())){
                //do nothing
            }else{
                DesignSearchCriteria searchCriteria = new DesignSearchCriteria();
                searchCriteria.setAddaId(adda.getAddaId());
                searchCriteria.setProcessCd(bundle.getCurrentProcessCd());
                List<DesignProcess> processes = processService.getAllProcessesByDesignCriteria(searchCriteria);
                if(ValidationUtil.isNotEmpty(processes) && processes.size() == 1 && processes.get(0).getProcessCd().equals(bundle.getCurrentProcessCd())) {
                    designProcess = processes.get(0);
                }
            }
                return null == designProcess? null : designProcess.getPriority();
        }
        return null;
    }
}
