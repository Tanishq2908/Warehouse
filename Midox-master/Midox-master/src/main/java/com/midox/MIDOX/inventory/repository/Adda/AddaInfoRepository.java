package com.midox.MIDOX.inventory.repository.Adda;

import com.midox.MIDOX.inventory.entity.AddaInfo;
import com.midox.MIDOX.inventory.entity.AddaMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddaInfoRepository extends JpaRepository<AddaInfo, Integer> {

    AddaInfo findByAddaId(Integer addaId);
}
