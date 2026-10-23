package com.midox.MIDOX.inventory.repository;

import com.midox.MIDOX.inventory.entity.Pattern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatternRepository extends JpaRepository<Pattern, Integer> {
}
