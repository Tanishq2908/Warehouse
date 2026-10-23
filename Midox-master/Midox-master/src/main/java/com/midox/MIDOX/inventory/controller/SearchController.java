package com.midox.MIDOX.inventory.controller;

import com.midox.MIDOX.inventory.entity.JobCard;
import com.midox.MIDOX.inventory.models.RequestModels.AddaBundleSearchCriteria;
import com.midox.MIDOX.inventory.models.ResponseModels.JobCardResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.SearchResponse;
import com.midox.MIDOX.inventory.service.spi.IJobHistoryService;
import com.midox.MIDOX.inventory.service.spi.ISearchService;
import com.midox.MIDOX.inventory.util.Mapper.JobCardMapper;
import com.midox.MIDOX.inventory.util.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/search")
public class SearchController {

    @Autowired
    ISearchService searchService;

    @Autowired
    JobCardMapper jobCardMapper;

   @GetMapping("/{text}")
    public ResponseEntity<?> getSearchResult(@PathVariable String text) {
        ResponseEntity<?> response = null;
        try {
            List<SearchResponse> result = searchService.getSearchResult(text);
            response = new ResponseEntity<List<SearchResponse>>(result, HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.NOT_FOUND);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("dashboard")
    public ResponseEntity<?> getDashboardData() {
        ResponseEntity<?> response = null;
        try {
            Map result = searchService.getDashboardData();
            response = new ResponseEntity<Map>(result, HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.NOT_FOUND);
            e.printStackTrace();
        }
        return response;
    }
}
