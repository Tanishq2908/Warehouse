package com.midox.MIDOX.inventory.service.spi;

import com.midox.MIDOX.inventory.entity.Supplier;

import java.util.List;

public interface ISupplierService {
    Supplier addSupplier(Supplier supplier);
    Supplier editSupplier(Supplier supplier);
    List<Supplier> getSuppliersByCriteria(String supplierName, Integer id);

    Supplier getSupplierById(Integer supplierId);
}
