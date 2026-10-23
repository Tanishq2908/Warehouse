package com.midox.MIDOX.inventory.DAO;

import com.midox.MIDOX.inventory.entity.Material;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

//@Repository
//@Transactional
public class MaterialDaoImpl extends AbstractDaoJpa<Material, Integer>implements MaterialDao{
    public MaterialDaoImpl() {
        super(Material.class);
    }
}
