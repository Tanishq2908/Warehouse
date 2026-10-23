package com.midox.MIDOX.inventory.service.spi;

import com.midox.MIDOX.inventory.Exception.MidoxException;
import com.midox.MIDOX.inventory.entity.JobCard;
import com.midox.MIDOX.inventory.entity.JobHistory;
import com.midox.MIDOX.inventory.models.RequestModels.AddaBundleSearchCriteria;
import com.midox.MIDOX.inventory.models.RequestModels.JobHistorySearchCriteria;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface IJobHistoryService {
    @Transactional(propagation = Propagation.REQUIRED)
    JobHistory addJobHistory(JobHistory jobHistory) throws MidoxException;

    @Transactional(propagation = Propagation.REQUIRED)
    JobHistory updateJobHistoryAndPaymentForFinishedJob(JobHistory jobHistory) throws MidoxException;

    List<JobHistory> getJobHistoryByCriteria(JobHistorySearchCriteria searchCriteria);

    List<JobCard> getJobCards(AddaBundleSearchCriteria searchCriteria);

    @Transactional(propagation = Propagation.REQUIRED)
    void deleteJobHistory(JobHistory jobHistory) throws MidoxException;

    @Transactional(propagation = Propagation.REQUIRED)
    JobHistory updateJobHistory(JobHistory jobHistory) throws MidoxException;

    //List<Employee> searchEmployees(String employeeName, String designation, String);
}