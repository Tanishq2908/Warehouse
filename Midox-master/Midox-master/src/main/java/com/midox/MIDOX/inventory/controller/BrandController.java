package com.midox.MIDOX.inventory.controller;

import com.midox.MIDOX.inventory.constants.ConfigConstants;
import com.midox.MIDOX.inventory.entity.Brand;
import com.midox.MIDOX.inventory.models.RequestModels.GenericSearchCriteria;
import com.midox.MIDOX.inventory.service.spi.IBrandService;
import com.midox.MIDOX.inventory.util.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/brand")
public class BrandController {

    @Autowired
    IBrandService brandService;

    @PostMapping("/add")
    public ResponseEntity<Message> addBrand(@RequestBody Brand brand) {
        ResponseEntity<Message> response = null;
        try {
            brandService.addBrand(brand);
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.BRAND_ADDED), HttpStatus.CREATED);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/edit")
    public ResponseEntity<Message> editBrand(@RequestBody Brand brand) {
        ResponseEntity<Message> response = null;
        try {
            brandService.editBrand(brand);
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.BRAND_EDIT), HttpStatus.CREATED);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/get-brands")
    public ResponseEntity<?> getBrands(@RequestBody GenericSearchCriteria searchCriteria) {
        ResponseEntity<?> response = null;
        try {
            List<Brand> brands = brandService.getBrandsByCriteria(searchCriteria.getName(), searchCriteria.getId());
            response = new ResponseEntity<List<Brand>>(brands, HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.NOT_FOUND);
            e.printStackTrace();
        }
        return response;
    }

    @GetMapping("/get/{brandId}")
    public ResponseEntity<?> getSupplierDetails(@PathVariable Integer brandId) {
        ResponseEntity<?> response = null;
        try {
            Brand brand = brandService.getBrandById(brandId);
            response = new ResponseEntity<Brand>(brand, HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.NOT_FOUND);
            e.printStackTrace();
        }
        return response;
    }

    // TODO implement delete api - should be soft delete
}
