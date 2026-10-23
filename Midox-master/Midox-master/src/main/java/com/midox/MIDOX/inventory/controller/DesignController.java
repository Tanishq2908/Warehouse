package com.midox.MIDOX.inventory.controller;

import com.midox.MIDOX.inventory.constants.ConfigConstants;
import com.midox.MIDOX.inventory.entity.Design;
import com.midox.MIDOX.inventory.models.ResponseModels.DesignResponse;
import com.midox.MIDOX.inventory.models.RequestModels.DesignSearchCriteria;
import com.midox.MIDOX.inventory.service.spi.IDesignProcessService;
import com.midox.MIDOX.inventory.service.spi.IDesignService;
import com.midox.MIDOX.inventory.util.Mapper.DesignMapper;
import com.midox.MIDOX.inventory.util.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/design")
public class DesignController {

    @Autowired
    IDesignService designService;

    @Autowired
    IDesignProcessService designProcessService;

    @Autowired
    DesignMapper designMapper;


    @PostMapping("/add")
    public ResponseEntity<?> addDesign(@RequestBody Design design) {
        ResponseEntity<?> response = null;
        try {
            design = designService.addDesign(design);
            response = new ResponseEntity<Design>(design, HttpStatus.CREATED);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/add-processes")
    public ResponseEntity<Message> addProcesses(@RequestBody Design design) {
        ResponseEntity<Message> response = null;
        try {
            designService.addProcesses(design);
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.BRAND_ADDED), HttpStatus.CREATED);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }


    @PostMapping("/edit")
    public ResponseEntity<Message> editDesign(@RequestBody Design design) {
        ResponseEntity<Message> response = null;
        try {
            designService.editDesign(design);
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.BRAND_ADDED), HttpStatus.CREATED);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/update-processes")
    public ResponseEntity<Message> updateDesignProcesses(@RequestBody Design design) {
        ResponseEntity<Message> response = null;
        try {
            designProcessService.updateDesignProcess(design);
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.BRAND_ADDED), HttpStatus.CREATED);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/get-designs")
    public ResponseEntity<?> getDesigns(@RequestBody DesignSearchCriteria searchCriteria) {
        ResponseEntity<?> response = null;
        try {
            List<Design> designs = designService.getDesignByCriteria(searchCriteria.getDesignId(), searchCriteria.getDesignNo(), searchCriteria.getBrandId(), searchCriteria.getProductCd());
            List<DesignResponse> result = new ArrayList<>();
            designs.forEach(d -> result.add(designMapper.toDesignResponse(d)));
            response = new ResponseEntity<List<DesignResponse>>(result, HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.NOT_FOUND);
            e.printStackTrace();
        }
        return response;
    }

    // delete api - including process

    /*@GetMapping("/get/{brandId}")
    public ResponseEntity<Brand> getSupplierDetails(@PathVariable Integer brandId) {
        ResponseEntity<Brand> response = null;
        try {
            Brand brand = designService.getBrandById(brandId);
            response = new ResponseEntity<Brand>(brand, HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Brand>(new Brand(), HttpStatus.OK);
            e.printStackTrace();
        }
        return response;
    }*/
}
