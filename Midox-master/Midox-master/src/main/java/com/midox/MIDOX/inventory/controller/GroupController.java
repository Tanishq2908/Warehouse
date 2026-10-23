package com.midox.MIDOX.inventory.controller;

import com.midox.MIDOX.inventory.entity.GroupMaster;
import com.midox.MIDOX.inventory.entity.GroupEntity;
import com.midox.MIDOX.inventory.service.spi.IGroupService;
import com.midox.MIDOX.inventory.constants.ConfigConstants;
import com.midox.MIDOX.inventory.util.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/groups")
public class GroupController {
    @Autowired
    private IGroupService service;

    @GetMapping("/get-grouped-entities")
    public ResponseEntity<Map<String, List<GroupEntity>>> getEntitiesGroupedByMasterCd() {
        ResponseEntity<Map<String, List<GroupEntity>>> response = null;
        try {
            Map<String, List<GroupEntity>> groupedEntities = service.getAllGroupWithEntities();
            response = new ResponseEntity<>(groupedEntities, HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<>(new HashMap<>(), HttpStatus.EXPECTATION_FAILED);
            e.printStackTrace();
        }
        return response;
    }

    @GetMapping("/get-all-entities")
    public ResponseEntity<Map<String, GroupEntity>> getEntitiesMap() {
        ResponseEntity<Map<String, GroupEntity>> response = null;
        try {
            Map<String, GroupEntity> entitiesMap = service.getEntitiesMap();
            response = new ResponseEntity<>(entitiesMap, HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<>(new HashMap<>(), HttpStatus.EXPECTATION_FAILED);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/save-entity")
    public ResponseEntity<Message> addGroupEntities(@RequestBody List<GroupEntity> groupEntities) {
        ResponseEntity<Message> response = null;
        try {
            service.createGroupEntities(groupEntities);
            response = new ResponseEntity<>(new Message(ConfigConstants.Messages.GROUP_ENTITY_ADDED), HttpStatus.CREATED);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.GROUP_ENTITY_ADDED_FAILED), HttpStatus.EXPECTATION_FAILED);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/save-master")
    public ResponseEntity<Message> addGroupMaster(@RequestBody GroupMaster groupMaster) {
        ResponseEntity<Message> response = null;
        try {
            service.createGroupMaster(groupMaster);
            response = new ResponseEntity<>(new Message(ConfigConstants.Messages.GROUP_MASTER_ADDED), HttpStatus.CREATED);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.GROUP_MASTER_ADDED_FAILED), HttpStatus.EXPECTATION_FAILED);
            e.printStackTrace();
        }
        return response;
    }

    @DeleteMapping("/delete-entity/{entityCd}")
    public ResponseEntity<Message> deleteGroupEntities(@PathVariable String entityCd) {
        ResponseEntity<Message> response = null;
        try {
            service.deleteGroupEntity(entityCd);
            response = new ResponseEntity<>(new Message(ConfigConstants.Messages.GROUP_ENTITY_DELETED), HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.GROUP_ENTITY_DELETED_FAILED), HttpStatus.EXPECTATION_FAILED);
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/edit-entity")
    public ResponseEntity<Message> editGroupEntity(@RequestBody GroupEntity groupEntity) {
        ResponseEntity<Message> response = null;
        try {
            service.editGroupEntity(groupEntity);
            response = new ResponseEntity<>(new Message(ConfigConstants.Messages.GROUP_ENTITY_EDITED), HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<Message>(new Message(ConfigConstants.Messages.GROUP_ENTITY_EDITED_FAILED), HttpStatus.EXPECTATION_FAILED);
            e.printStackTrace();
        }
        return response;
    }

    @GetMapping("/get-entities/{masterCd}")
    public ResponseEntity<List> getAllEntities(@PathVariable String masterCd) {
        ResponseEntity<List> response = null;
        try {
            List entities = service.getAllEntitiesForGroupMaster(masterCd);
            response = new ResponseEntity<>(entities, HttpStatus.OK);
        } catch (Exception e) {
            response = new ResponseEntity<List>(new ArrayList<>(), HttpStatus.EXPECTATION_FAILED);
            e.printStackTrace();
        }
        return response;
    }

}
