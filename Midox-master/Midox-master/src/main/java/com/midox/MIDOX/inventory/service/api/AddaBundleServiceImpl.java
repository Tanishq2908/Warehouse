package com.midox.MIDOX.inventory.service.api;

import com.midox.MIDOX.inventory.Exception.MidoxException;
import com.midox.MIDOX.inventory.constants.TextileEnum;
import com.midox.MIDOX.inventory.entity.*;
import com.midox.MIDOX.inventory.models.RequestModels.AddaBundleSearchCriteria;
import com.midox.MIDOX.inventory.models.RequestModels.AddaSearchCriteria;
import com.midox.MIDOX.inventory.models.RequestModels.JobHistorySearchCriteria;
import com.midox.MIDOX.inventory.repository.Adda.*;
import com.midox.MIDOX.inventory.repository.SearchJDBC;
import com.midox.MIDOX.inventory.service.spi.*;
import com.midox.MIDOX.inventory.util.MapperUtils;
import com.midox.MIDOX.inventory.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AddaBundleServiceImpl implements IAddaBundleService {

    @Autowired
    AddaBundleRepository bundleRepository;

    @Autowired
    AddaBundleHistoryRepository bundleHistoryRepo;

    @Autowired
    IAddaService addaService;

    @Autowired
    IJobHistoryService jobHistoryService;

    @Autowired
    IDesignProcessService processService;

    @Autowired
    SearchJDBC searchJDBC;

    @Autowired
    IFinishedGoodsService goodsService;

    @Override
    public AddaBundle createBundle(AddaBundle bundle) {
        bundle.setDefaultValues();
        return bundleRepository.saveAndFlush(bundle);
    }

    @Override
    public boolean createBundlesForPattern(AddaPattern pattern) throws MidoxException{
        DesignProcess process = getDesignProcessesSorted(pattern.getAddaId()).get(0);
        String bundleNamePrefix = getBundleNamePrefix(pattern);
        Double totalQuantity = pattern.getQuantity();
        Integer bundleSize = pattern.getBundleSize();
        Integer totalBundles= (int) Math.ceil(totalQuantity/bundleSize);
        Double remainingQuantity = totalQuantity;
        //Long seq = bundleRepository.getSeqCurrentVal();
        for(int i =0; i< totalBundles; i++){
            AddaBundle bundle = new AddaBundle();
            bundle.setPatternId(pattern.getPatternId());
            bundle.setQuantity(remainingQuantity > Double.valueOf(bundleSize) ? Double.valueOf(bundleSize) : remainingQuantity);
            bundle.setCurrentProcessCd(process.getProcessCd());
            bundle.setCurrentProcessStatus(TextileEnum.ProcStatus.PROC_STAT_TBS);
            bundle.setStatus(TextileEnum.ProcStatus.PROC_STAT_TBS);
            bundle.setBundleName(bundleNamePrefix+(bundleRepository.getSeqCurrentVal()+1));
            bundle = createBundle(bundle);
            createBundleHistoryForBundle(bundle);
            remainingQuantity = remainingQuantity - bundleSize;
        }
        return true;
    }

    private List<DesignProcess> getDesignProcessesSorted(Integer addaId){
        List<DesignProcess> processes = addaService.getDesignProcessesForAdda(addaId);
        if(ValidationUtil.isEmpty(processes) || processes.size() == 0){
            throw new MidoxException(MidoxException.NO_PROCESS_ASSOCIATED);
        }
        processes.sort((p1, p2) -> p1.getPriority().compareTo(p2.getPriority()));

        return processes;
    }

    private String getBundleNamePrefix(AddaPattern pattern){
        /* StringBuilder bundleName = new StringBuilder("A");
        bundleName.append(pattern.getAddaId()).append("-");
        bundleName.append(MapperUtils.getDisplayValueForEntity(pattern.getSize())).append("-");
        bundleName.append(MapperUtils.getDisplayValueForEntity(pattern.getColor())).append("-");
        bundleName.append("B");
        bundleName.toString().trim().replaceAll(" ", "-");
        */
        return "B-";
    }

    private void createBundleHistoryForBundle(AddaBundle bundle){
        AddaBundleHistory history = new AddaBundleHistory();
        history.setBundleId(bundle.getBundleId());
        history.setProcessCd(bundle.getCurrentProcessCd());
        history.setProcessStatus(bundle.getCurrentProcessStatus());
        history.setEmployeeId(bundle.getCurrentEmployeeId());
        history.setQuantity(bundle.getQuantity());
        createBundleHistory(history);

    }
    @Override
    public AddaBundle updateBundle(AddaBundle bundle) throws MidoxException {
        if(null == bundle.getBundleId()){
            throw new MidoxException(MidoxException.EXCEPTION_ENTITY_DOES_NOT_EXIST);
        }
        bundle.setDefaultValues();
        return bundleRepository.saveAndFlush(bundle);
    }

    @Override
    public AddaBundle assignBundleToEmployee(AddaBundle bundleReceived) throws MidoxException {
        // TODO make job history entry when bundle is assigned
        AddaBundle bundle = bundleRepository.findById(bundleReceived.getBundleId()).get();
        AddaBundleHistory history = getLatestBundleHistory(bundle);

        if(null != history && !TextileEnum.ProcStatus.PROC_STAT_TBS.equals(history.getProcessStatus())){
            throw new MidoxException(MidoxException.BUNDLE_NOT_IN_TBS);
        }

        // Setting Adda in IN Progress
        AddaPattern pattern = addaService.getPatternById(bundle.getPatternId());
        AddaSearchCriteria addaSearchCriteria = new AddaSearchCriteria();
        addaSearchCriteria.setAddaId(pattern.getAddaId());
        List<Adda> result = addaService.getAddaByCriteria(addaSearchCriteria);
        if(ValidationUtil.isNotEmpty(result) && result.size()==1){
            Adda adda = result.get(0);
            if(adda.getStatus().equals(TextileEnum.ProcStatus.PROC_STAT_TBS)){
                adda.setStatus(TextileEnum.ProcStatus.PROC_STAT_INP);
                addaService.updateAdda(adda);
            }
        }
        /*if(!history.getProcessStatus().equals(TextileEnum.ProcStatus.PROC_STAT_TBS)
                && bundleReceived.getCurrentProcessStatus().equals(TextileEnum.ProcStatus.PROC_STAT_TBS)){
            bundle.setCurrentEmployeeId(null);
            bundle.setCurrentProcessStatus(TextileEnum.ProcStatus.PROC_STAT_TBS);
            history.setEmployeeId(null);
            history.setProcessStatus(TextileEnum.ProcStatus.PROC_STAT_TBS);
            JobHistorySearchCriteria jobSearch = new JobHistorySearchCriteria();
            jobSearch.setBundleHistoryId(history.getBundleHistoryId());
            jobSearch.setStatusToInclude(TextileEnum.ProcStatus.PROC_STAT_INP.toString());
            List<JobHistory> existingJob = jobHistoryService.getJobHistoryByCriteria(jobSearch);
            if(ValidationUtil.isNotEmpty(existingJob) && existingJob.size() == 1){
                jobHistoryService.deleteJobHistory(existingJob.get(0));
            }
        }else{
        */

        bundle.setCurrentEmployeeId(bundleReceived.getCurrentEmployeeId());
        bundle.setCurrentProcessStatus(TextileEnum.ProcStatus.PROC_STAT_INP);
        bundle.setStatus(TextileEnum.ProcStatus.PROC_STAT_INP);
        history.setEmployeeId(bundleReceived.getCurrentEmployeeId());
        history.setProcessStatus(TextileEnum.ProcStatus.PROC_STAT_INP);
        JobHistory jobHistory = createJobHistory(history, null);
        jobHistoryService.addJobHistory(jobHistory);
        //}
        updateBundle(bundle);
        updateBundleHistory(history);
        return  bundle;
    }

    private AddaBundleHistory getLatestBundleHistory(AddaBundle bundle){
        // TODO change query for efficient performance
        AddaBundleSearchCriteria searchCriteria = new AddaBundleSearchCriteria();
        searchCriteria.setBundleId(bundle.getBundleId());
        searchCriteria.setProcessCd(bundle.getCurrentProcessCd());
        List<AddaBundleHistory> histories = getBundleHistoriesByCriteria(searchCriteria);
        // TODO check and handling for empty history
        return histories.get(0);
    }

    @Override
    public List<AddaBundleHistory> getBundleHistoriesByCriteria(AddaBundleSearchCriteria criteria){
        List<AddaBundleHistory> histories = bundleHistoryRepo.getBundleHistoryBySearchCriteria(criteria.getBundleId(), criteria.getProcessCd(), criteria.getBundleHistoryId());
        // TODO check and handling for empty history
        return histories;
    }

    @Override
    public AddaBundle updateBundleStatus(Integer bundleId, TextileEnum.ProcStatus processStatus) throws MidoxException {
        AddaBundle bundle = bundleRepository.findById(bundleId).get();
        AddaBundleHistory history = getLatestBundleHistory(bundle);
        if(!history.getProcessStatus().equals(TextileEnum.ProcStatus.PROC_STAT_TBS) &&
                TextileEnum.ProcStatus.PROC_STAT_TBS.equals(processStatus)){
            bundle.setCurrentEmployeeId(null);
            bundle.setCurrentProcessStatus(TextileEnum.ProcStatus.PROC_STAT_TBS);
            history.setEmployeeId(null);
            history.setProcessStatus(TextileEnum.ProcStatus.PROC_STAT_TBS);
            JobHistorySearchCriteria jobSearch = new JobHistorySearchCriteria();
            jobSearch.setBundleHistoryId(history.getBundleHistoryId());
            jobSearch.setStatusToInclude(TextileEnum.ProcStatus.PROC_STAT_INP.toString());
            List<JobHistory> existingJob = jobHistoryService.getJobHistoryByCriteria(jobSearch);
            if(ValidationUtil.isNotEmpty(existingJob)){
                for(JobHistory jobHistory: existingJob){
                    jobHistoryService.deleteJobHistory(jobHistory);
                }
            }
        }
        history.setProcessStatus(processStatus);
        bundle.setCurrentProcessStatus(processStatus);
        if(TextileEnum.ProcStatus.PROC_STAT_FIN.equals(processStatus)){
            history.setEndDate(new Date(System.currentTimeMillis()));
            AddaPattern pattern = addaService.getPatternById(bundle.getPatternId());
            List<DesignProcess> processes = getDesignProcessesSorted(pattern.getAddaId());
            DesignProcess currentProcess = null;
            Iterator<DesignProcess> it = processes.iterator();
            while(it.hasNext()){
                DesignProcess process = it.next();
                if(process.getProcessCd().equals(bundle.getCurrentProcessCd())){
                    currentProcess = process;
                    it.remove();
                    break;
                }
                it.remove();
            }
            // TODO register for employee wage calculation
            JobHistory jobHistory = finishJobHistory(history, currentProcess);
            jobHistoryService.updateJobHistoryAndPaymentForFinishedJob(jobHistory);

            if(ValidationUtil.isEmpty(processes)){
                bundle = completeAddaBundle(bundle, pattern);
            }else{
                // create new bundle history for next process
                DesignProcess nextProcess = processes.get(0);
                bundle.setCurrentProcessCd(nextProcess.getProcessCd());
                bundle.setCurrentProcessStatus(TextileEnum.ProcStatus.PROC_STAT_TBS);
                bundle.setCurrentEmployeeId(null);
                // Create new bundle history
                createBundleHistoryForBundle(bundle);
            }
        }

        updateBundleHistory(history);

        updateBundle(bundle);

        return bundle;
    }

    private AddaBundle completeAddaBundle(AddaBundle bundle, AddaPattern pattern) throws MidoxException{
        // All process in design is completed for bundle. Mark it complete and update corresponding finished quantity
        bundle.setStatus(TextileEnum.ProcStatus.PROC_STAT_FIN);
        // TODO check if this shouldn't be set to null
        bundle.setCurrentProcessCd(null);
        bundle.setCurrentProcessStatus(null);
        bundle.setCurrentEmployeeId(null);
        // update pattern finished quantity also
        pattern.setFinishedQuantity(pattern.getFinishedQuantity() + bundle.getQuantity());
        addaService.updateAddaPattern(pattern);
        AddaSearchCriteria searchCriteria = new AddaSearchCriteria();
        searchCriteria.setAddaId(pattern.getAddaId());
        List<Adda> addas = addaService.getAddaByCriteria(searchCriteria);
        // TODO create finished goods entry
        if(ValidationUtil.isNotEmpty(addas)){
            Adda adda = addas.get(0);
            adda.setFinishedQuantity(adda.getFinishedQuantity() + bundle.getQuantity());
            if(adda.getFinishedQuantity().doubleValue() == adda.getQuantity().doubleValue()){
                // Marking Adda as complete since all quantity is finished
                adda.setStatus(TextileEnum.ProcStatus.PROC_STAT_FIN);
            }
            addaService.updateAddaWithFinishedGoods(adda, pattern, bundle);
        }
        return bundle;
    }

    private JobHistory createJobHistory(AddaBundleHistory bundleHistory, DesignProcess process){
        JobHistory job = new JobHistory();
        job.setBundleHistoryId(bundleHistory.getBundleHistoryId());
        job.setEmployeeId(bundleHistory.getEmployeeId());
        job.setQuantity(bundleHistory.getQuantity());
        job.setProcessCd(bundleHistory.getProcessCd());
        if(null != process){
            job.setTotalWage(process.getRatePerPeice() * bundleHistory.getQuantity());
        }
        return job;
    }

    private JobHistory finishJobHistory(AddaBundleHistory bundleHistory, DesignProcess process) throws  MidoxException{
        JobHistorySearchCriteria searchCriteria = new JobHistorySearchCriteria();
        searchCriteria.setBundleHistoryId(bundleHistory.getBundleHistoryId());
        List<JobHistory> jobs = jobHistoryService.getJobHistoryByCriteria(searchCriteria);
        if(ValidationUtil.isNotEmpty(jobs) && jobs.size()==1){
            JobHistory job = jobs.get(0);
            job.setCompletionDate(new Date(System.currentTimeMillis()));
            job.setStatus(TextileEnum.ProcStatus.PROC_STAT_FIN);
            if(null != process){
                job.setTotalWage(process.getRatePerPeice() * bundleHistory.getQuantity());
            }
            return job;
        } else{
            throw new MidoxException(MidoxException.NO_OR_MORE_THAN_ONE_JOB_HISTORY_FOUND);
        }
    }

    @Override
    public AddaBundleHistory createBundleHistory(AddaBundleHistory bundleHistory) {
        bundleHistory.setDefaultValues();
        return bundleHistoryRepo.saveAndFlush(bundleHistory);
    }

    @Override
    public AddaBundleHistory updateBundleHistory(AddaBundleHistory bundleHistory) throws MidoxException {
        if(null == bundleHistory.getBundleHistoryId()){
            throw new MidoxException(MidoxException.EXCEPTION_ENTITY_DOES_NOT_EXIST);
        }
        bundleHistory.setDefaultValues();
        return bundleHistoryRepo.saveAndFlush(bundleHistory);
    }

    @Override
    public void deleteAddaBundle(AddaBundle bundle) throws MidoxException {
        // TODO to be implemented. consider adding new bundle manually also.
    }

    @Override
    public List<AddaBundle> getAddaBundleByCriteria(AddaBundleSearchCriteria searchCriteria) {
       List<AddaBundle> bundles = bundleRepository.findBundlesByCriteria(searchCriteria.getEmployeeId(), searchCriteria.getProcessCd(), searchCriteria.getBundleId(),
               searchCriteria.getPatternId(), searchCriteria.getAddaId(), searchCriteria.getExclude_status(), searchCriteria.getStatus());
        // TODO check and handling for empty history
        return bundles;
    }

    @Override
    public List<BundleCard> getBundleCards(AddaBundleSearchCriteria searchCriteria) {
        Map<Integer, List> stProsMap = new HashMap<>();
        List<BundleCard> bundleCards=  searchJDBC.findAllBundleCards(searchCriteria);
        bundleCards.forEach(b -> {
            if(!stProsMap.containsKey(b.getDesignId())){
                stProsMap.put(b.getDesignId(), getBundleCardProcesses(b.getDesignId()));
            }
            b.setStPros( stProsMap.get(b.getDesignId()));
        });
        return bundleCards;
    }

    private List<String> getBundleCardProcesses(Integer designId){
        List<DesignProcess> processes = processService.getAllProcessesForDesign(designId);
        processes.sort((p1, p2) -> p1.getPriority().compareTo(p2.getPriority()));
        List<String> stPros = new ArrayList<>();
        int count = 1;
        for(DesignProcess p : processes)
        {
            stPros.add(count++ +"-" + (MapperUtils.getDisplayValueForEntity(p.getProcessCd())).substring(0,1));
        };
        return stPros;
    }
}
