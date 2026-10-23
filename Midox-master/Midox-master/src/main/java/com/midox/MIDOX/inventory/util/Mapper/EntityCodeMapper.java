package com.midox.MIDOX.inventory.util.Mapper;

import com.midox.MIDOX.inventory.entity.GroupEntity;
import com.midox.MIDOX.inventory.models.MapperModels.EntityCode;
import com.midox.MIDOX.inventory.util.MapperUtils;
import org.mapstruct.*;

@Mapper( componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        injectionStrategy = InjectionStrategy.CONSTRUCTOR,
imports = {MapperUtils.class})
public interface EntityCodeMapper {



    @Mapping(source = "entityCd", target = "entityCd")
    @Mapping(source = "entityCd", target = "displayValue", qualifiedByName = "mapDisplayValue")
    EntityCode stringToEntityCode(String entityCd);

    @Named(value = "mapDisplayValue")
    default String mapDisplayValue(String entityCd) { // return type of gender, I took String. For id took Long
        GroupEntity entity = (GroupEntity)MapperUtils.getallEntitiesMap().get(entityCd);
        return null != entity ? entity.getDisplayValue() : null;
    }
    /*default String fromEntityCode(EntityCode entityCode) {
        return entityCode.getEntityCd();
    }

    default EntityCode toEntityCode(String entityCd) {
        EntityCode e = new EntityCode();
        e.setEntityCd(entityCd);
        e.setDisplayValue(mapDisplayValue(entityCd));
        return e;
    }*/

}
