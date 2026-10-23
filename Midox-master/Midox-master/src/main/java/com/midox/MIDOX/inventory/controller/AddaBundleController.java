package com.midox.MIDOX.inventory.controller;

import com.midox.MIDOX.inventory.constants.ConfigConstants;
import com.midox.MIDOX.inventory.entity.*;
import com.midox.MIDOX.inventory.models.RequestModels.AddaBundleSearchCriteria;
import com.midox.MIDOX.inventory.models.RequestModels.AddaSearchCriteria;
import com.midox.MIDOX.inventory.models.ResponseModels.AddaBundleResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.AddaResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.BundleCardResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.JobCardResponse;
import com.midox.MIDOX.inventory.service.spi.IAddaBundleService;
import com.midox.MIDOX.inventory.service.spi.IAddaService;
import com.midox.MIDOX.inventory.util.Mapper.AddaBundleMapper;
import com.midox.MIDOX.inventory.util.Mapper.AddaMapper;
import com.midox.MIDOX.inventory.util.Mapper.BundleCardMapper;
import com.midox.MIDOX.inventory.util.Message;
import com.midox.MIDOX.inventory.util.ValidationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/bundle")
public class AddaBundleController {

    @Autowired
    IAddaBundleService bundleService;

    @Autowired
    AddaBundleMapper bundleMapper;

    @Autowired
    BundleCardMapper bundleCardMapper;

    @PostMapping("/update-status")
    public ResponseEntity<?> updateAddBundleStatus(@RequestBody AddaBundle bundle) {
        ResponseEntity<Message> response = null;
        try {
            bundle = bundleService.updateBundleStatus(bundle.getBundleId(), bundle.getCurrentProcessStatus());
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.BUNDLE_UPDATE_SUCCESFUL), HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/assign-employee")
    public ResponseEntity<?> assignBundleToEmployee(@RequestBody AddaBundle bundle) {
        ResponseEntity<Message> response = null;
        try {
            bundle = bundleService.assignBundleToEmployee(bundle);
            //bundle = bundleService.assignBundleToEmployee(bundle.getBundleId(), bundle.getCurrentEmployeeId(), bundle.getCurrentProcessStatus());

            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.BUNDLE_UPDATE_SUCCESFUL), HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/get-bundles")
    public ResponseEntity<?> getBundles(@RequestBody AddaBundleSearchCriteria searchCriteria) {
        ResponseEntity<?> response = null;
        List<AddaBundleResponse> result = new ArrayList<>();
        try {
            if(!ValidationUtil.allFieldsEmpty(searchCriteria)) {
                List<AddaBundle> bundles = bundleService.getAddaBundleByCriteria(searchCriteria);
                bundles.forEach(b -> result.add(bundleMapper.toAddaBundle(b)));
            }
            response = new ResponseEntity<List<AddaBundleResponse>>(result, HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.NOT_FOUND);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/card")
    public ResponseEntity<?> getBundleCards(@RequestBody AddaBundleSearchCriteria searchCriteria) {
        ResponseEntity<?> response = null;
        try {
            List<BundleCard> bundleCards = bundleService.getBundleCards(searchCriteria);
            List<BundleCardResponse> result = new ArrayList<>();
            bundleCards.forEach(b -> result.add(bundleCardMapper.toBundleCardResponse(b)));
            response = new ResponseEntity<List<BundleCardResponse>>(result, HttpStatus.OK);
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
            Brand brand = AddaService.getBrandById(brandId);
            response = new ResponseEntity<Brand>(brand, HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Brand>(new Brand(), HttpStatus.OK);
            e.printStackTrace();
        }
        return response;
    }*/
}
