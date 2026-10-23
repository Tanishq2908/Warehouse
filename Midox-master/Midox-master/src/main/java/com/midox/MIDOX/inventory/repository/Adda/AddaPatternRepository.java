package com.midox.MIDOX.inventory.repository.Adda;

import com.midox.MIDOX.inventory.entity.AddaMaterial;
import com.midox.MIDOX.inventory.entity.AddaPattern;
import com.midox.MIDOX.inventory.entity.Design;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AddaPatternRepository extends JpaRepository<AddaPattern, Integer> {


    List<AddaPattern> findAllByAddaId(Integer addaId, Sort sortyBy);
}
