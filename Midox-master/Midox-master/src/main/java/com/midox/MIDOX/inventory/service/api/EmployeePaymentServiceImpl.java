package com.midox.MIDOX.inventory.service.api;

import com.midox.MIDOX.inventory.Exception.MidoxException;
import com.midox.MIDOX.inventory.constants.TextileEnum;
import com.midox.MIDOX.inventory.entity.EmployeePayment;
import com.midox.MIDOX.inventory.entity.EmployeePaymentHistory;
import com.midox.MIDOX.inventory.entity.JobHistory;
import com.midox.MIDOX.inventory.models.RequestModels.JobHistorySearchCriteria;
import com.midox.MIDOX.inventory.models.RequestModels.PaymentSearchCriteria;
import com.midox.MIDOX.inventory.repository.EmployeePaymentRepository;
import com.midox.MIDOX.inventory.repository.EmployeePaymentHistoryRepository;
import com.midox.MIDOX.inventory.service.spi.IEmployeePaymentService;
import com.midox.MIDOX.inventory.service.spi.IJobHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeePaymentServiceImpl implements IEmployeePaymentService {

    @Autowired
    EmployeePaymentRepository paymentRepository;

    @Autowired
    EmployeePaymentHistoryRepository paymentHistoryRepository;

    @Autowired
    @Lazy
    IJobHistoryService jobHistoryService;

    @Override
    public EmployeePayment addEmployeePayment(EmployeePayment payment) throws MidoxException {
        payment.setDefaultValues();
        return paymentRepository.saveAndFlush(payment);
    }

    @Override
    public EmployeePayment updateEmployeePayment(EmployeePayment payment) throws MidoxException {
        if(null == payment.getPaymentId()){
            throw new MidoxException(MidoxException.EXCEPTION_ENTITY_DOES_NOT_EXIST);
        }
        payment.setDefaultValues();
        return paymentRepository.saveAndFlush(payment);
    }

    @Override
    public EmployeePaymentHistory addEmployeePaymentHistory(EmployeePaymentHistory paymentHistory) throws MidoxException {
        paymentHistory.setDefaultValues();
        return paymentHistoryRepository.saveAndFlush(paymentHistory);
    }

    @Override
    public EmployeePaymentHistory updateEmployeePaymentHistory(EmployeePaymentHistory paymentHistory) throws MidoxException {
        if(null == paymentHistory.getPaymentHistoryId()){
            throw new MidoxException(MidoxException.EXCEPTION_ENTITY_DOES_NOT_EXIST);
        }
        paymentHistory.setDefaultValues();
        return paymentHistoryRepository.saveAndFlush(paymentHistory);
    }

    @Override
    public EmployeePayment makePayment(EmployeePaymentHistory paymentHistory) throws MidoxException{
        EmployeePayment payment = paymentRepository.findByEmployeeId(paymentHistory.getEmployeeId());
        if(null ==  payment){
            payment = createEmployeePayment(payment.getEmployeeId());
        }
        if(validateOutstadingAgainstPayment(paymentHistory, payment)){
            payment.setOutstanding(payment.getOutstanding() - paymentHistory.getAmountPaid());
            payment.setTotalPaid(payment.getTotalPaid() + paymentHistory.getAmountPaid());
            updateEmployeePayment(payment);
            addEmployeePaymentHistory(paymentHistory);
            // TODO update  job history - mark paid and if partly paid, set amount in details
            updateJobHistores(paymentHistory);
        } else{
            throw new MidoxException(MidoxException.AMOUNT_PAID_MORE_THAN_OUTSTANDING);
        }
        return payment;
    }

    private boolean validateOutstadingAgainstPayment(EmployeePaymentHistory paymentHistory, EmployeePayment payment) {
        return payment.getOutstanding() >= paymentHistory.getAmountPaid();
    }

    private boolean updateJobHistores(EmployeePaymentHistory paymentHistory) throws MidoxException{
        JobHistorySearchCriteria searchCriteria = new JobHistorySearchCriteria();
        searchCriteria.setEmployeeId(paymentHistory.getEmployeeId());
        searchCriteria.setPaymentStatusToExclude(TextileEnum.PaymentStatus.PAID_FULL.toString());
        searchCriteria.setStatusToInclude(TextileEnum.ProcStatus.PROC_STAT_FIN.toString());
        List<JobHistory> jobHistories = jobHistoryService.getJobHistoryByCriteria(searchCriteria);
        Double amountRemaining = paymentHistory.getAmountPaid();
        int historyIndex = 0;
        // TODO handling for scneario where amount paid is more than outstanding -- I think it will be handled earlier by validationm
        while(amountRemaining > 0 && historyIndex < jobHistories.size()){
            JobHistory job = jobHistories.get(historyIndex++);
            String details = null == job.getDetails() ? "" : job.getDetails();
            Double amountToPay = job.getTotalWage() - job.getPaidWage();
            if(amountRemaining >= amountToPay){
                details = details + amountToPay + " paid on " + paymentHistory.getPaymentDate() + " with payment history id " + paymentHistory.getPaymentHistoryId();
                amountRemaining = amountRemaining - amountToPay;
                job.setPaidWage(job.getTotalWage());
                job.setPaymentStatus(TextileEnum.PaymentStatus.PAID_FULL);
            }else{
                details = details + amountRemaining + " paid on " + paymentHistory.getPaymentDate() + " with payment history id " + paymentHistory.getPaymentHistoryId() + ". \n";
                job.setPaidWage(job.getPaidWage() + amountRemaining);
                amountRemaining = 0d;
                job.setPaymentStatus(TextileEnum.PaymentStatus.PAID_PARTIAL);
            }
            job.setDetails(details);
            jobHistoryService.updateJobHistory(job);
        }
        return true;
    }

    @Override
    public List<EmployeePaymentHistory> getPaymentByCriteria(PaymentSearchCriteria searchCriteria) {
        return paymentHistoryRepository.findPaymentHistoriesByCriteria(searchCriteria.getEmployeeId(),
                searchCriteria.getPaymentDate(),
                searchCriteria.getStartDate(), searchCriteria.getEndDate(),
                searchCriteria.getStartKey(), searchCriteria.getRecords());
    }

    @Override
    public List<EmployeePayment> getEmployeeOutstandingByCriteria(PaymentSearchCriteria searchCriteria) {
        List<EmployeePayment> payments =  paymentRepository.findEmployeePayments(searchCriteria.getEmployeeId());
        payments.forEach(p -> {
            PaymentSearchCriteria criteria = new PaymentSearchCriteria();
            criteria.setEmployeeId(p.getEmployeeId());
            p.setPaymentHistories(getPaymentByCriteria(criteria));
            JobHistorySearchCriteria jobHistorySearchCriteria = new JobHistorySearchCriteria();
            jobHistorySearchCriteria.setEmployeeId(p.getEmployeeId());
            jobHistorySearchCriteria.setStatusToInclude(TextileEnum.ProcStatus.PROC_STAT_INP.toString());
            List result = jobHistoryService.getJobHistoryByCriteria(jobHistorySearchCriteria);
            p.setPendingJob(result.size());
        });
        return payments;
    }

    @Override
    public EmployeePayment getPaymentForEmployee(Integer employeeId) {
        return paymentRepository.findByEmployeeId(employeeId);
    }

    @Override
    public EmployeePayment createEmployeePayment(Integer employeeId) throws MidoxException {
        // create entry
        EmployeePayment payment = new EmployeePayment(employeeId);
        payment = addEmployeePayment(payment);
        return payment;
    }
}
