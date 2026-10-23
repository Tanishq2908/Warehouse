package com.midox.MIDOX.inventory.service.api;

import com.midox.MIDOX.inventory.constants.ConfigConstants;
import com.midox.MIDOX.inventory.entity.GroupMaster;
import com.midox.MIDOX.inventory.entity.GroupEntity;
import com.midox.MIDOX.inventory.repository.GroupEntityJDBC;
import com.midox.MIDOX.inventory.repository.GroupEntityRepository;
import com.midox.MIDOX.inventory.repository.GroupMasterRepository;
import com.midox.MIDOX.inventory.service.spi.IGroupService;
import com.midox.MIDOX.inventory.util.MapperUtils;
import com.midox.MIDOX.inventory.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupServiceImpl implements IGroupService {
    private final GroupEntityRepository groupEntityRepo;
    private final GroupMasterRepository groupMasterRepo;
    private final GroupEntityJDBC groupEntityJDBC;

    private ConfigConstants constants;

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public Boolean createGroupEntities(List<GroupEntity> groupEntities) {
        groupEntities.forEach(entity -> {
            entity.setDefaultValues();
            stampEntityCd(entity);
            groupEntityRepo.saveAndFlush(entity);
        });
        MapperUtils.resetEntitiesMap();
        return true;
    }

    @Override
    public Boolean createGroupMaster(GroupMaster groupMaster){
        groupMaster.setDefaultValues();
        groupMasterRepo.saveAndFlush(groupMaster);
        MapperUtils.resetEntitiesMap();
        return true;
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public void deleteGroupEntity(String entityCd){
        groupEntityRepo.deleteGroupEntityByEntityCd(entityCd);
        MapperUtils.resetEntitiesMap();
    }

    @Override
    public Boolean editGroupEntity(GroupEntity groupEntity){
        GroupEntity existingEntity = groupEntityRepo.findGroupEntityByEntityCd(groupEntity.getEntityCd());
        existingEntity.setDisplayValue(groupEntity.getDisplayValue());
        existingEntity.setParentEntityCd(groupEntity.getParentEntityCd());
        // TODO write explicit update call and update audit details before save. The employee session will be used for getting updated_by.
        groupEntityRepo.save(existingEntity);
        MapperUtils.resetEntitiesMap();
        return true;
    }

    @Override
    public Map<String, List<GroupEntity>> getAllGroupWithEntities() {
        List<GroupEntity> entities = groupEntityJDBC.findAllGroupEntities(null);
        if (ValidationUtil.isNotNull(entities)) {
            return entities.stream().distinct().collect(Collectors.groupingBy(GroupEntity::getMasterCd));
        } else {
            return Collections.EMPTY_MAP;
        }

    }

    @Override
    public Map<String, GroupEntity> getEntitiesMap() {
        List<GroupEntity> entities = groupEntityRepo.findAll();
        // = new HashMap<>();
        if (ValidationUtil.isNotNull(entities)) {
            Map<String, GroupEntity>  entityMap = entities.stream().distinct().collect(Collectors.toMap(GroupEntity::getEntityCd,  Function.identity()));
             entityMap.values().stream().forEach(e -> {
                     if(ValidationUtil.isNotNull(e.getParentEntityCd())) {
                         e.setParentDisplayValue(entityMap.get(e.getParentEntityCd()).getDisplayValue());
                     }}
             );
             return entityMap;
        } else {
            return Collections.EMPTY_MAP;
        }
    }

    @Override
    public List<GroupEntity> getAllEntitiesForGroupMaster(String groupMasterCd){
        List<GroupEntity> result = new ArrayList<>();
        List<GroupEntity> entities = groupEntityJDBC.findAllGroupEntities(groupMasterCd);
        /*for (Object[] o : entities){
            GroupEntity g = (GroupEntity) o[0];
            g.setParentDisplayValue((String) o[1]);
            result.add(g);

        }*/
        return entities;
    }

    private void stampEntityCd(GroupEntity entity){
        List existingEntities = groupEntityRepo.findAllForGroupMasterCd(entity.getMasterCd());
        GroupMaster master = groupMasterRepo.findByMasterCd(entity.getMasterCd());
        String prefix = master.getMasterPrefix();
        String name = entity.getDisplayValue().replaceAll(" ", "").toUpperCase();
        Long seq = groupEntityRepo.getNextValEntitySequence();
        String suffix = null;
        if(name.length()>3){
            suffix = name.substring(0,3)+seq;
        }else{
            suffix = name+seq;
        }
        entity.setEntityCd(prefix+suffix);
        //return null;
    }
// would be better to keep these also configurable - this would be part of the drop_type thins I mentioned in Generic Options
}
