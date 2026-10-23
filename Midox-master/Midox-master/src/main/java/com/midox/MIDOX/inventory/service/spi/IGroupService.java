package com.midox.MIDOX.inventory.service.spi;

import com.midox.MIDOX.inventory.entity.GroupMaster;
import com.midox.MIDOX.inventory.entity.GroupEntity;

import java.util.List;
import java.util.Map;

public interface IGroupService {

    public Boolean createGroupEntities(List<GroupEntity> groupEntities);

    public Boolean createGroupMaster(GroupMaster groupMaster);

    public void deleteGroupEntity(String enitytCd);

    public Boolean editGroupEntity(GroupEntity groupEntity);

    public Map<String, List<GroupEntity>> getAllGroupWithEntities();

    public Map<String, GroupEntity> getEntitiesMap();

    public List<GroupEntity> getAllEntitiesForGroupMaster(String groupMasterCd);

}
