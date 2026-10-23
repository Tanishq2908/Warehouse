package com.midox.MIDOX.inventory.service.api;

import com.midox.MIDOX.inventory.entity.Brand;
import com.midox.MIDOX.inventory.entity.Supplier;
import com.midox.MIDOX.inventory.repository.SupplierRepository;
import com.midox.MIDOX.inventory.service.spi.ISupplierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements ISupplierService {

    @Autowired
    SupplierRepository supplierRepo;

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public Supplier addSupplier(Supplier supplier){
        supplier.setDefaultValues();
        return supplierRepo.saveAndFlush(supplier);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public Supplier editSupplier(Supplier supplier){
        return supplierRepo.saveAndFlush(supplier);
    }

    @Override
    public List<Supplier> getSuppliersByCriteria(String supplierName, Integer supplierId){
        return  supplierRepo.findSupplierByName(supplierName, supplierId);
    }

    @Override
    public Supplier getSupplierById(Integer supplierId){
        return  supplierRepo.findById(supplierId).get();
    }

}
