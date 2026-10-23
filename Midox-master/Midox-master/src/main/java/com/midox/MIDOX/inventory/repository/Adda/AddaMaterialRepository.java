package com.midox.MIDOX.inventory.repository.Adda;

import com.midox.MIDOX.inventory.entity.Adda;
import com.midox.MIDOX.inventory.entity.AddaMaterial;
import com.midox.MIDOX.inventory.entity.Design;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AddaMaterialRepository extends JpaRepository<AddaMaterial, Integer> {

    List<AddaMaterial> findAllByAddaId(Integer addaId);
}
