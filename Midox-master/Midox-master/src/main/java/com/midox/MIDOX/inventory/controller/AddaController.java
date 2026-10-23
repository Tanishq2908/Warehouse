package com.midox.MIDOX.inventory.controller;

import com.midox.MIDOX.inventory.Exception.MidoxException;
import com.midox.MIDOX.inventory.constants.ConfigConstants;
import com.midox.MIDOX.inventory.entity.Adda;
import com.midox.MIDOX.inventory.entity.AddaMaterial;
import com.midox.MIDOX.inventory.entity.AddaPattern;
import com.midox.MIDOX.inventory.models.RequestModels.AddaSearchCriteria;
import com.midox.MIDOX.inventory.models.ResponseModels.AddaResponse;
import com.midox.MIDOX.inventory.service.spi.IAddaService;
import com.midox.MIDOX.inventory.util.Mapper.AddaMapper;
import com.midox.MIDOX.inventory.util.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/adda")
public class AddaController {

    @Autowired
    IAddaService addaService;

    @Autowired
    AddaMapper addaMapper;

    @PostMapping("/add")
    public ResponseEntity<?> addAdda(@RequestBody Adda adda) {
        ResponseEntity<?> response = null;
        try {
            adda = addaService.create(adda);
            response = new ResponseEntity<Adda>(adda, HttpStatus.CREATED);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }


    @PostMapping("/update")
    public ResponseEntity<Message> updateAdda(@RequestBody Adda adda) {
        ResponseEntity<Message> response = null;
        try {
            addaService.updateAdda(adda);
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.ADDA_UPDATED), HttpStatus.CREATED);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/add-material")
    public ResponseEntity<?> addAddaMaterial(@RequestBody AddaMaterial addaMaterial) {
        ResponseEntity<?> response = null;
        try {
            addaMaterial = addaService.addAddaMaterial(addaMaterial);
            response = new ResponseEntity<AddaMaterial>(addaMaterial, HttpStatus.CREATED);
        }catch (MidoxException e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/update-material")
    public ResponseEntity<?> updateAddaMaterial(@RequestBody AddaMaterial addaMaterial) {
        ResponseEntity<?> response = null;
        try {
            addaMaterial = addaService.updateAddaMaterial(addaMaterial);
            response = new ResponseEntity<AddaMaterial>(addaMaterial, HttpStatus.CREATED);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @DeleteMapping("/delete-material")
    public ResponseEntity<?> deleteAddaMaterial(@RequestBody AddaMaterial addaMaterial) {
        ResponseEntity<?> response = null;
        try {
            addaService.deleteAddaMaterial(addaMaterial);
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.GROUP_ENTITY_DELETED), HttpStatus.CREATED);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/add-pattern")
    public ResponseEntity<?> addAddaPattern(@RequestBody AddaPattern addaPattern) {
        ResponseEntity<?> response = null;
        try {
            addaPattern = addaService.addAddaPattern(addaPattern);
            response = new ResponseEntity<AddaPattern>(addaPattern, HttpStatus.CREATED);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/update-pattern")
    public ResponseEntity<?> updateAddaPattern(@RequestBody AddaPattern addaPattern) {
        ResponseEntity<?> response = null;
        try {
            addaPattern = addaService.updateAddaPattern(addaPattern);
            response = new ResponseEntity<AddaPattern>(addaPattern, HttpStatus.CREATED);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }

    @DeleteMapping("/delete-pattern")
    public ResponseEntity<?> deleteAddaPattern(@RequestBody AddaPattern addaPattern) {
        ResponseEntity<?> response = null;
        try {
            addaService.deleteAddaPattern(addaPattern);
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.GROUP_ENTITY_DELETED), HttpStatus.CREATED);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(e.getMessage()), HttpStatus.FORBIDDEN);
            e.printStackTrace();
        }
        return response;
    }


    @PostMapping("/update-processes")
    public ResponseEntity<Message> updateAddaProcesses(@RequestBody Adda Adda) {
        ResponseEntity<Message> response = null;
        /*try {
            AddaProcessService.updateAddaProcess(Adda);
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.BRAND_ADDED), HttpStatus.CREATED);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.BRAND_ADD_OPERATION_FAILED), HttpStatus.OK);
            e.printStackTrace();
        }*/
        return response;
    }

    @PostMapping("/get-addas")
    public ResponseEntity<?> getAddas(@RequestBody AddaSearchCriteria searchCriteria) {
        ResponseEntity<?> response = null;
        try {
            List<Adda> addas = addaService.getAddaByCriteria(searchCriteria);
            List<AddaResponse> result = new ArrayList<>();
            addas.forEach(a -> result.add(addaMapper.toAddaResponse(a)));
            response = new ResponseEntity<List<AddaResponse>>(result, HttpStatus.OK);
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
