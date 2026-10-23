package com.midox.MIDOX.inventory.repository;

import com.midox.MIDOX.inventory.entity.GroupEntity;
import com.midox.MIDOX.inventory.util.ValidationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Component;

import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

@Component
public class GroupEntityJDBC {

    @Autowired
    JdbcTemplate jdbcTemplate;

    String findAllGroupEntities = "select child.entity_id as entityId, child.entity_cd as entityCd, child.parent_entity_cd as parentEntityCd, child.master_cd as masterCd, child.display_value as displayValue, parent.display_value as parentDisplayValue, child.created_at as createdAt, child.updated_at as updatedAt, child.created_by as createdBy, child.updated_by as updatedBy " +
            " from group_entity child left outer join group_entity parent on child.parent_entity_cd = parent.entity_cd ";

    String addWhereClauseWithMasterCd = " where child.master_cd = ? ";


    //@Query(value = findAllForGroupMasterCdQuery, nativeQuery = true)
    public List<GroupEntity> findAllGroupEntities(String masterCd){

       /* List result = jdbcTemplate.query(findAllForGroupMasterCdQuery, new Object[]{masterCd},(rs, rowNum) -> new GroupEntity(
                rs.getInt("entityId"), rs.getString("entityCd"), rs.getString("parentEntityCd"),
                rs.getString("masterCd"), rs.getString("displayValue"), rs.getString("parentDisplayValue"),
                rs.getTimestamp("createdAt"), rs.getTimestamp("updatedAt"), rs.getInt("createdBy"), rs.getInt("updatedBy")
        ));*/

        //List ls = jdbcTemplate.queryForList(findAllGroupEntities, new Object[]{masterCd});
        String query = findAllGroupEntities;
        if(ValidationUtil.isNotNull(masterCd)){
            query = query + addWhereClauseWithMasterCd;
        }
        SqlRowSet rs ;

        if(ValidationUtil.isNotNull(masterCd)) {
            rs = jdbcTemplate.queryForRowSet(query, new Object[]{masterCd}, new int[]{Types.VARCHAR});
        } else {
            rs = jdbcTemplate.queryForRowSet(query);
        }

        List result = new ArrayList();
        while(rs.next()){
            GroupEntity ge = new GroupEntity(
                    rs.getInt("entityId"), rs.getString("entityCd"), rs.getString("parentEntityCd"),
                    rs.getString("masterCd"), rs.getString("displayValue"), rs.getString("parentDisplayValue"),
                    rs.getTimestamp("createdAt"), rs.getTimestamp("updatedAt"), rs.getInt("createdBy"), rs.getInt("updatedBy"));
            result.add(ge);
        }

        /*        GroupEntity result = jdbcTemplate.queryForObject(findAllForGroupMasterCdQuery, new RowMapper<GroupEntity>(){
            @Override
            public GroupEntity mapRow(ResultSet rs, int i) throws SQLException{
                return new GroupEntity(
                        rs.getInt("entityId"), rs.getString("entityCd"), rs.getString("parentEntityCd"),
                        rs.getString("masterCd"), rs.getString("displayValue"), rs.getString("parentDisplayValue"),
                        rs.getTimestamp("createdAt"), rs.getTimestamp("updatedAt"), rs.getInt("createdBy"), rs.getInt("updatedBy"));
            }
        }, new Object[]{masterCd});*/

        return result;
    }

}
