package com.midox.MIDOX.inventory.controller;

import com.midox.MIDOX.inventory.entity.Dispatch;
import com.midox.MIDOX.inventory.entity.FinishedGoods;
import com.midox.MIDOX.inventory.models.RequestModels.DispatchSearchCriteria;
import com.midox.MIDOX.inventory.models.ResponseModels.DesignResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.DispatchResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.FinishedGoodsResponse;
import com.midox.MIDOX.inventory.service.spi.IDispatchService;
import com.midox.MIDOX.inventory.service.spi.IFinishedGoodsService;
import com.midox.MIDOX.inventory.util.Mapper.DesignMapper;
import com.midox.MIDOX.inventory.util.Mapper.DispatchMapper;
import com.midox.MIDOX.inventory.util.Mapper.FinishedGoodsMapper;
import com.midox.MIDOX.inventory.util.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/finished-goods")
public class FinishedGoodsController {

    @Autowired
    IDispatchService dispatchService;

    @Autowired
    IFinishedGoodsService goodsService;

    @Autowired
    FinishedGoodsMapper finishedGoodsMapper;

    @Autowired
    DispatchMapper dispatchMapper;


    @PostMapping("/dispatch")
    public ResponseEntity<?> addDispatch(@RequestBody Dispatch dispatch) {
        ResponseEntity<?> response = null;
        try {
            dispatch = dispatchService.createDispatch(dispatch);
            response = new ResponseEntity<Dispatch>(dispatch, HttpStatus.CREATED);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/get-dispatches")
    public ResponseEntity<?> getDispatches(@RequestBody DispatchSearchCriteria searchCriteria) {
        ResponseEntity<?> response = null;
        try {
            List<Dispatch> dispatches = dispatchService.getDispatchHistory(searchCriteria);
            List<DispatchResponse> result = new ArrayList<>();
            dispatches.forEach(d -> result.add(dispatchMapper.toDispatchResponse(d)));
            response = new ResponseEntity<List<DispatchResponse>>(result, HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.NOT_FOUND);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/get-goods")
    public ResponseEntity<?> getFinishedGoods(@RequestBody DispatchSearchCriteria searchCriteria) {
        ResponseEntity<?> response = null;
        try {
            List<FinishedGoods> finishedGoodsList = goodsService.getFinishedGoods(searchCriteria);
            List<FinishedGoodsResponse> result = new ArrayList<>();
            finishedGoodsList.forEach(f -> result.add(finishedGoodsMapper.toFinishedGoodsResponse(f)));
            response = new ResponseEntity<List<FinishedGoodsResponse>>(result, HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.NOT_FOUND);
            e.printStackTrace();
        }
        return response;
    }

}
