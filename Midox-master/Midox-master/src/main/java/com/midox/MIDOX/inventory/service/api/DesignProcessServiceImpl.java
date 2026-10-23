package com.midox.MIDOX.inventory.service.api;

import com.midox.MIDOX.inventory.entity.Design;
import com.midox.MIDOX.inventory.entity.DesignProcess;
import com.midox.MIDOX.inventory.models.RequestModels.DesignSearchCriteria;
import com.midox.MIDOX.inventory.repository.DesignProcessRepository;
import com.midox.MIDOX.inventory.service.spi.IDesignProcessService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DesignProcessServiceImpl implements IDesignProcessService {

    @Autowired
    DesignProcessRepository designProcessRepo;

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public void addDesignProcess(DesignProcess designProcess){

            designProcess.setDefaultValues();
            designProcessRepo.saveAndFlush(designProcess);

    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public void addDesignProcesses(List<DesignProcess> designProcesses){
        designProcesses.forEach(designProcess -> {
            designProcess.setDefaultValues();
            designProcessRepo.saveAndFlush(designProcess);
        });
    }

   /* @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public Design addDesignWithProcess(Design design){
        design = createDesign(design);
        Integer designId = design.getDesignId();
        List<DesignProcess> processes = design.getProcesses();
        processes.forEach(process -> {
            process.setDesignId(designId);
            designProcessRepo.saveAndFlush(process);
        });
        return design;
    }*/

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public Design updateDesignProcess(Design design){
        List<DesignProcess> existingProcess = designProcessRepo.findAllByDesignId(design.getDesignId());
        List<DesignProcess> currentProcesses = design.getProcesses();
        List<Integer> processIds = currentProcesses.stream().map(DesignProcess::getProcessId).collect(Collectors.toList());
        List<DesignProcess> processesToDelete = existingProcess.stream().filter(p -> !processIds.contains(p.getProcessId())
                && p.getDesignId().intValue() == design.getDesignId().intValue()).collect(Collectors.toList());
        processesToDelete.forEach(process ->
                {
                    designProcessRepo.deleteById(process.getProcessId());
                }
                );

        currentProcesses.forEach(process -> {
            if(null == process.getDesignId()){
                process.setDesignId(design.getDesignId());
            }
            process.setDefaultValues();
            designProcessRepo.saveAndFlush(process);
        });
        return design;
    }

    @Override
    public List<DesignProcess> getAllProcessesForDesign(Integer designId) {
        return designProcessRepo.findAllByDesignId(designId);
    }

    @Override
    public List<DesignProcess> getAllProcessesByDesignCriteria(DesignSearchCriteria designSearchCriteria) {
        return designProcessRepo.findDesignProcessesByCriteria(designSearchCriteria.getDesignId(), designSearchCriteria.getDesignNo(), designSearchCriteria.getProcessCd(), designSearchCriteria.getAddaId());
    }
}
