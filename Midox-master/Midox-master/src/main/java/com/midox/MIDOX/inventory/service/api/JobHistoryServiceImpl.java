package com.midox.MIDOX.inventory.service.api;

import com.midox.MIDOX.inventory.Exception.MidoxException;
import com.midox.MIDOX.inventory.entity.EmployeePayment;
import com.midox.MIDOX.inventory.entity.JobCard;
import com.midox.MIDOX.inventory.entity.JobHistory;
import com.midox.MIDOX.inventory.models.RequestModels.AddaBundleSearchCriteria;
import com.midox.MIDOX.inventory.models.RequestModels.JobHistorySearchCriteria;
import com.midox.MIDOX.inventory.repository.SearchJDBC;
import com.midox.MIDOX.inventory.repository.JobHistoryRepository;
import com.midox.MIDOX.inventory.service.spi.IEmployeePaymentService;
import com.midox.MIDOX.inventory.service.spi.IJobHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobHistoryServiceImpl implements IJobHistoryService {

    @Autowired
    JobHistoryRepository jobHistoryRepository;

    @Autowired
    IEmployeePaymentService paymentService;

    @Autowired
    SearchJDBC searchJDBC;

    @Override
    public JobHistory addJobHistory(JobHistory jobHistory) throws MidoxException {
        jobHistory.setDefaultValues();
        return jobHistoryRepository.saveAndFlush(jobHistory);
    }

    @Override
    public JobHistory updateJobHistoryAndPaymentForFinishedJob(JobHistory jobHistory) throws MidoxException {
        jobHistory = updateJobHistory(jobHistory);
        EmployeePayment payment = paymentService.getPaymentForEmployee(jobHistory.getEmployeeId());
        if(null == payment){
            payment = paymentService.createEmployeePayment(jobHistory.getEmployeeId());
        }
        payment.setOutstanding(payment.getOutstanding() + jobHistory.getTotalWage());
        paymentService.updateEmployeePayment(payment);
        return jobHistory;
    }

    @Override
    public List<JobCard> getJobCards(AddaBundleSearchCriteria searchCriteria) {
        List<JobCard> jobCards=  searchJDBC.findAllJobCards(searchCriteria);
        return jobCards;
    }

    @Override
    public List<JobHistory> getJobHistoryByCriteria(JobHistorySearchCriteria searchCriteria) {
        List<JobHistory> jobHistories =  jobHistoryRepository.findJobHistoriesByCriteria(searchCriteria.getEmployeeId(), searchCriteria.getProcessCd(), searchCriteria.getAddaId(),
                searchCriteria.getPaymentStatusToExclude(), searchCriteria.getPaymentStatusToInclude(),
                searchCriteria.getStatusToInclude(), searchCriteria.getStatusToExclude(),
                searchCriteria.getCompletionDate(), searchCriteria.getBundleHistoryId(),
                searchCriteria.getStartDate(), searchCriteria.getEndDate(),
                searchCriteria.getStartKey(), searchCriteria.getRecords());
        return jobHistories;
    }

    @Override
    public void deleteJobHistory(JobHistory jobHistory) throws MidoxException{
        if(null == jobHistory.getJobHistoryId()){
            throw new MidoxException(MidoxException.EXCEPTION_ENTITY_DOES_NOT_EXIST);
        }
        jobHistoryRepository.deleteById(jobHistory.getJobHistoryId());
    }

    @Override
    public JobHistory updateJobHistory(JobHistory jobHistory) throws MidoxException {
        if(null == jobHistory.getJobHistoryId()){
            throw new MidoxException(MidoxException.EXCEPTION_ENTITY_DOES_NOT_EXIST);
        }
        jobHistory.setDefaultValues();
        return jobHistoryRepository.saveAndFlush(jobHistory);
    }
}
