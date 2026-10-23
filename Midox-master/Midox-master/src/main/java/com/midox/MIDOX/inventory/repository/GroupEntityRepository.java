package com.midox.MIDOX.inventory.repository;

import com.midox.MIDOX.inventory.entity.GroupEntity;
import com.midox.MIDOX.inventory.entity.StockHistory;
import org.springframework.data.convert.ValueConverter;
import org.springframework.data.convert.WritingConverter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface GroupEntityRepository extends JpaRepository<GroupEntity, Integer> {

    /*String findAllForGroupMasterCdQuery = "select new com.midox.MIDOX.inventory.entity.GroupEntity(child.entity_id, child.entity_cd, child.parent_entity_cd, child.master_cd, child.display_value, parent.display_value as parent_display_value, child.created_at, child.updated_at, child.created_by, child.updated_by) " +
            " from group_entity child left outer join group_entity parent on child.parent_entity_cd = parent.entity_cd where child.master_cd = :master_cd";
*/
   /* String findAllForGroupMasterCdQuery = "select child.entity_id as entityId, child.entity_cd as entityCd, child.parent_entity_cd as parentEntityCd, child.master_cd as masterCd, child.display_value as displayValue, parent.display_value as parentDisplayValue, child.created_at as createdAt, child.updated_at as updatedAt, child.created_by as createdBy, child.updated_by as updatedBy " +
            " from group_entity child left outer join group_entity parent on child.parent_entity_cd = parent.entity_cd where child.master_cd = :master_cd";
  */
    /*String findAllForGroupMasterCdQuery = "select child, parent.display_value as parentDisplayValue " +
            " from group_entity child left outer join group_entity parent on child.parent_entity_cd = parent.entity_cd where child.master_cd = :master_cd";
*/
    String findAllForGroupMasterCdQuery = "select * from group_entity where master_cd = :master_cd";

    String findGroupEntityByEntityCdQuery = "select * from group_entity where entity_cd = :entity_cd";

    String deleteGroupEntityByEntityCdQuery = "delete from group_entity where entity_cd = :entity_cd or parent_entity_cd = :entity_cd";

    @Query(value = findAllForGroupMasterCdQuery, nativeQuery = true)
    List<GroupEntity> findAllForGroupMasterCd(@Param("master_cd") String masterCd);

    @Modifying
    @Query(value = deleteGroupEntityByEntityCdQuery, nativeQuery = true)
    void deleteGroupEntityByEntityCd(@Param("entity_cd") String entityCd);

    @Query(value = findGroupEntityByEntityCdQuery, nativeQuery = true)
    GroupEntity findGroupEntityByEntityCd(@Param("entity_cd") String entityCd);

    @Query(value = "SELECT currval('entity_sequence')", nativeQuery = true)
    BigDecimal currentValGet();

    @Query(value = "SELECT nextval('entity_sequence')", nativeQuery = true)
    Long getNextValEntitySequence();
}
