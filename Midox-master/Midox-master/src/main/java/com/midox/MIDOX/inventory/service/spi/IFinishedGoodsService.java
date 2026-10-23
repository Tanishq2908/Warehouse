package com.midox.MIDOX.inventory.service.spi;

import com.midox.MIDOX.inventory.entity.Design;
import com.midox.MIDOX.inventory.entity.Dispatch;
import com.midox.MIDOX.inventory.entity.FinishedGoods;
import com.midox.MIDOX.inventory.models.RequestModels.DispatchSearchCriteria;
import com.midox.MIDOX.inventory.repository.FinishedGoodsRepository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface IFinishedGoodsService {
    @Transactional(propagation = Propagation.REQUIRED)
    FinishedGoods createFinishedGoods(FinishedGoods finishedGoods);

    @Transactional(propagation = Propagation.REQUIRED)
    FinishedGoods updateFinishedGoods(FinishedGoods finishedGoods);

    List<FinishedGoods> getFinishedGoods(DispatchSearchCriteria searchCriteria);
}
