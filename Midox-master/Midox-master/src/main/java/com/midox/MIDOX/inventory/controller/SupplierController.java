package com.midox.MIDOX.inventory.controller;

import com.midox.MIDOX.inventory.constants.ConfigConstants;
import com.midox.MIDOX.inventory.entity.Supplier;
import com.midox.MIDOX.inventory.models.RequestModels.GenericSearchCriteria;
import com.midox.MIDOX.inventory.service.spi.ISupplierService;
import com.midox.MIDOX.inventory.util.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/supplier")
public class SupplierController {

    @Autowired
    ISupplierService supplierService;

    @PostMapping("/add")
    public ResponseEntity<Message> addSupplier(@RequestBody Supplier supplier) {
        ResponseEntity<Message> response = null;
        try {
            supplierService.addSupplier(supplier);
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.SUPPLIER_ADDED), HttpStatus.CREATED);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/edit")
    public ResponseEntity<Message> editSupplier(@RequestBody Supplier supplier) {
        ResponseEntity<Message> response = null;
        try {
            supplierService.editSupplier(supplier);
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.SUPPLIER_ADDED), HttpStatus.CREATED);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/get-suppliers")
    public ResponseEntity<?> getSuppliers(@RequestBody GenericSearchCriteria searchCriteria) {
        ResponseEntity<?> response = null;
        try {
            List<Supplier> suppliers = supplierService.getSuppliersByCriteria(searchCriteria.getName(), searchCriteria.getId());
            response = new ResponseEntity<List<Supplier>>(suppliers, HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.NOT_FOUND);
            e.printStackTrace();
        }
        return response;
    }

    @GetMapping("/get/{supplierId}")
    public ResponseEntity<?> getSupplierDetails(@PathVariable Integer supplierId) {
        ResponseEntity<?> response = null;
        try {
            Supplier supplier = supplierService.getSupplierById(supplierId);
            response = new ResponseEntity<Supplier>(supplier, HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.NOT_FOUND);
            e.printStackTrace();
        }
        return response;
    }

    // TODO implement delete api - should be soft delete
}
