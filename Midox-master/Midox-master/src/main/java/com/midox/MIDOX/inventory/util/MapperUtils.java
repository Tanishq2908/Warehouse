package com.midox.MIDOX.inventory.util;

import com.midox.MIDOX.MidoxApplication;
import com.midox.MIDOX.inventory.entity.GroupEntity;
import com.midox.MIDOX.inventory.service.spi.IGroupService;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashMap;
import java.util.Map;

public class MapperUtils {

    /*IGroupService groupService;

    @Autowired
    public MapperUtils(IGroupService groupService){
        this.groupService = groupService;
    }*/

    private static Map entitiesMap = new HashMap();

    public static Map<String, GroupEntity> getallEntitiesMap(){
        if(entitiesMap.size() != 0){
            return entitiesMap;
        }else{
            entitiesMap = MidoxApplication.getAppContext().getBean(IGroupService.class).getEntitiesMap();
        }
        return entitiesMap;
    }

    public static String getDisplayValueForEntity(String entityCd){
        GroupEntity entity =  getallEntitiesMap().get(entityCd);
        return null != entity? entity.getDisplayValue() : null;
    }

    public static void resetEntitiesMap(){
        entitiesMap = new HashMap<>();
    }
}
