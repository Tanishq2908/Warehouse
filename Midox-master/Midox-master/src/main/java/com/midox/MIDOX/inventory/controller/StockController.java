package com.midox.MIDOX.inventory.controller;

import com.midox.MIDOX.inventory.constants.ConfigConstants;
import com.midox.MIDOX.inventory.entity.Stock;
import com.midox.MIDOX.inventory.models.RequestModels.StockSearchCriteria;
import com.midox.MIDOX.inventory.models.StockModel;
import com.midox.MIDOX.inventory.models.ResponseModels.StockResponse;
import com.midox.MIDOX.inventory.service.spi.IStockService;
import com.midox.MIDOX.inventory.util.Mapper.StockMapper;
import com.midox.MIDOX.inventory.util.Message;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
@CrossOrigin()
@RestController
@RequiredArgsConstructor
@RequestMapping("/stock")
public class StockController {
    @Autowired
    private IStockService stockService;

    @Autowired
    private final StockMapper stockMapper;

    @GetMapping(value = {"/", "/home","/test"})
    public ResponseEntity<Message> testApp() {
        ResponseEntity<Message> response = null;
        response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.STATUS), HttpStatus.OK);
        return response;
    }

   @PostMapping("/save")
    public ResponseEntity<Message> addStocks(@RequestBody List<StockModel> stockList) {
        ResponseEntity<Message> response = null;
        try {
            Boolean booleanValue = stockService.addStocks(stockList);
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.STOCK_ADDED), HttpStatus.CREATED);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.EXPECTATION_FAILED);
            e.printStackTrace();
        }
        return response;
    }

    @GetMapping("/list")
    public ResponseEntity<List<StockResponse>> viewStocks() {
        ResponseEntity<List<StockResponse>> response = null;
        try {
            List<Stock> stockList = stockService.getAllStocks();
            List<StockResponse> result = new ArrayList<>();
            stockList.forEach(s -> result.add(stockMapper.toStockResponse(s)));
            response = new ResponseEntity<>(new ArrayList<>(result), HttpStatus.OK);
        } catch (Exception e) {
        response = new ResponseEntity<List<StockResponse>>(new ArrayList(), HttpStatus.EXPECTATION_FAILED);
        e.printStackTrace();
    }
        return response;
    }

    @PostMapping("/get-stocks")
    public ResponseEntity<?> getStockWithCriteria(@RequestBody StockSearchCriteria searchCriteria) {
        ResponseEntity<?> response = null;
        try {
            List<Stock> stockList = stockService.getStocksWithCriteria(searchCriteria);
            List<StockResponse> result = new ArrayList<>();
            stockList.forEach(s -> result.add(stockMapper.toStockResponse(s)));
            response = new ResponseEntity<>(new ArrayList<>(result), HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.NOT_FOUND);
            e.printStackTrace();
        }
        return response;
    }
}
