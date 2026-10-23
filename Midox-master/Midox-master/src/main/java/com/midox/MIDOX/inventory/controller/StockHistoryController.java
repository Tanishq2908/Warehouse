package com.midox.MIDOX.inventory.controller;

import com.midox.MIDOX.inventory.constants.ConfigConstants;
import com.midox.MIDOX.inventory.entity.StockHistory;
import com.midox.MIDOX.inventory.models.ResponseWrapper;
import com.midox.MIDOX.inventory.models.RequestModels.StockHistorySearchCriteria;
import com.midox.MIDOX.inventory.service.spi.IStockHistoryService;
import com.midox.MIDOX.inventory.util.Mapper.StockHistoryMapper;
import com.midox.MIDOX.inventory.util.Message;
import com.midox.MIDOX.inventory.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/stockHistory")
public class StockHistoryController {

    @Autowired
    private final IStockHistoryService stockHistoryService;

    @Autowired
    private final StockHistoryMapper stockHistoryMapper;

    @PostMapping("/save")
    public ResponseEntity<Message> addStock(@RequestBody List<StockHistory> stockHistories) {
        ResponseEntity<Message> response = null;
        try {
            Boolean booleanValue = stockHistoryService.addStockHistory(stockHistories);
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.STOCK_ADDED), HttpStatus.CREATED);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @GetMapping("/get/{id}")
    @Deprecated
    public ResponseEntity<?> getStockHistory(@PathVariable int id) {
        ResponseEntity<?> response = null;
        try {
            List<StockHistory> stockHistories = stockHistoryService.getStockHistories(id);
            List<ResponseWrapper> result = new ArrayList<>();
            stockHistories.forEach(sh -> result.add(stockHistoryMapper.toStockHistoryResponse(sh)));
            //StockHistory  sr = new StockHistoryResponse();
            if (ValidationUtil.isNotNull(stockHistories)) {
                response = new ResponseEntity<List<ResponseWrapper>>(result, HttpStatus.OK);
            } else {
                response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.STOCK_HISTORY_NOT_FOUND), HttpStatus.BAD_REQUEST);

            }
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.NOT_FOUND);
            e.printStackTrace();
        }
        return (ResponseEntity<Message>) response;
    }

    @PostMapping("/get-history-with-criteria")
    public ResponseEntity<?> getStockHistoryWithCriteria(@RequestBody StockHistorySearchCriteria searchCriteria) {
        ResponseEntity<?> response = null;
        try {
            List<StockHistory> stockHistories = stockHistoryService.getStockHistoryFromCriteria(searchCriteria);
            List<ResponseWrapper> result = new ArrayList<>();
            stockHistories.forEach(sh -> result.add(stockHistoryMapper.toStockHistoryResponse(sh)));
            //StockHistory  sr = new StockHistoryResponse();
            if (ValidationUtil.isNotNull(stockHistories)) {
                response = new ResponseEntity<List<ResponseWrapper>>(result, HttpStatus.OK);
            } else {
                response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.STOCK_HISTORY_NOT_FOUND), HttpStatus.BAD_REQUEST);

            }
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return (ResponseEntity<Message>) response;
    }
}
