package com.midox.MIDOX.inventory.service.spi;

import com.midox.MIDOX.inventory.entity.Design;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface IDesignService {
    Design addDesign(Design design);

    @Transactional(propagation = Propagation.REQUIRED)
    Design editDesign(Design design);

    Design addProcesses(Design design) throws Exception;

    List<Design> getDesignByCriteria(Integer designId, String designNo, Integer brandId, String productCd);

    Design getDesignNoForAddaId(Integer addaId);

}
