package com.midox.MIDOX.inventory.repository;

import com.midox.MIDOX.inventory.entity.Bundle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BundleRepository extends JpaRepository<Bundle, Integer> {
}
