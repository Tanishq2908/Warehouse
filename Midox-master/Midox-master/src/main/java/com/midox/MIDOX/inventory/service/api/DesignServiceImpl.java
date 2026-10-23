package com.midox.MIDOX.inventory.service.api;

import com.midox.MIDOX.inventory.entity.*;
import com.midox.MIDOX.inventory.repository.DesignRepository;
import com.midox.MIDOX.inventory.service.spi.IDesignProcessService;
import com.midox.MIDOX.inventory.service.spi.IDesignService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DesignServiceImpl implements IDesignService {

    @Autowired
    DesignRepository designRepo;

    @Autowired
    IDesignProcessService processService;

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public Design addDesign(Design design){
        design.setDefaultValues();
        return designRepo.saveAndFlush(design);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public Design editDesign(Design design){
        return designRepo.saveAndFlush(design);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public Design addProcesses(Design design) throws Exception{
        Optional<Design> existingDesign;
        if(null == design.getDesignId()) {
            throw new Exception("Design not found");
        }
        existingDesign = designRepo.findById(design.getDesignId());
        if(!existingDesign.isPresent()) {
            throw new Exception("Design not found");
        }

        Integer designId = design.getDesignId();
        List<DesignProcess> processes = design.getProcesses();
        processes.forEach(process -> {
            process.setDesignId(designId);
            processService.addDesignProcess(process);
        });
        return design;
    }

    // TODO remove add Design once discussed
    private Design createDesign(Design design){
        design.setDefaultValues();
        return designRepo.saveAndFlush(design);
    }

    @Override
    public List<Design> getDesignByCriteria(Integer designId, String designNo, Integer brandId, String productCd){
       List<Design> designs =  designRepo.findDesignsByCriteria(designId, designNo, brandId, productCd);
       designs.forEach(design -> {
           design.setProcesses(processService.getAllProcessesForDesign(design.getDesignId()));
       });
        return designs;
    }

    @Override
    public Design getDesignNoForAddaId(Integer addaId){
        Design design = designRepo.findDesignNoByAddaIdQuery(addaId);
        return design;
    }
}
