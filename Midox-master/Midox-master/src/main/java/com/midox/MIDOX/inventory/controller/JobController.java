package com.midox.MIDOX.inventory.controller;

import com.midox.MIDOX.inventory.constants.ConfigConstants;
import com.midox.MIDOX.inventory.entity.AddaBundle;
import com.midox.MIDOX.inventory.entity.Brand;
import com.midox.MIDOX.inventory.entity.JobCard;
import com.midox.MIDOX.inventory.entity.JobHistory;
import com.midox.MIDOX.inventory.models.RequestModels.AddaBundleSearchCriteria;
import com.midox.MIDOX.inventory.models.RequestModels.GenericSearchCriteria;
import com.midox.MIDOX.inventory.models.RequestModels.JobHistorySearchCriteria;
import com.midox.MIDOX.inventory.models.ResponseModels.AddaBundleResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.JobCardResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.JobHistoryResponse;
import com.midox.MIDOX.inventory.service.spi.IAddaBundleService;
import com.midox.MIDOX.inventory.service.spi.IBrandService;
import com.midox.MIDOX.inventory.service.spi.IJobHistoryService;
import com.midox.MIDOX.inventory.util.Mapper.AddaBundleMapper;
import com.midox.MIDOX.inventory.util.Mapper.JobCardMapper;
import com.midox.MIDOX.inventory.util.Mapper.JobHistoryMapper;
import com.midox.MIDOX.inventory.util.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/job")
public class JobController {

    @Autowired
    IJobHistoryService jobService;

    @Autowired
    JobCardMapper jobCardMapper;

    @Autowired
    JobHistoryMapper jobHistoryMapper;

   @PostMapping("/card")
    public ResponseEntity<?> getJobCards(@RequestBody AddaBundleSearchCriteria searchCriteria) {
        ResponseEntity<?> response = null;
        try {
            List<JobCard> jobs = jobService.getJobCards(searchCriteria);
            List<JobCardResponse> result = new ArrayList<>();
            jobs.forEach(j -> result.add(jobCardMapper.toJobCardResponse(j)));
            response = new ResponseEntity<List<JobCardResponse>>(result, HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.NOT_FOUND);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/history")
    public ResponseEntity<?> getJobHistoriesByCriteria(@RequestBody JobHistorySearchCriteria searchCriteria) {
        ResponseEntity<?> response = null;
        try {
            List<JobHistory> histories = jobService.getJobHistoryByCriteria(searchCriteria);
            List<JobHistoryResponse> result = new ArrayList<>();
            histories.forEach(h -> result.add(jobHistoryMapper.toJobHistoryResponse(h)));
            response = new ResponseEntity<List<JobHistoryResponse>>(result, HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.NOT_FOUND);
            e.printStackTrace();
        }
        return response;
    }
}
