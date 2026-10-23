package com.midox.MIDOX.inventory.service.spi;

import com.midox.MIDOX.inventory.entity.Dispatch;
import com.midox.MIDOX.inventory.entity.FinishedGoods;
import com.midox.MIDOX.inventory.models.RequestModels.DispatchSearchCriteria;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface IDispatchService {
    @Transactional(propagation = Propagation.REQUIRED)
    Dispatch createDispatch(Dispatch dispatch);

    Dispatch addDispatch(Dispatch dispatch);

    @Transactional(propagation = Propagation.REQUIRED)
    Dispatch updateDispatch(Dispatch dispatch);

    List<Dispatch> getDispatchHistory(DispatchSearchCriteria searchCriteria);
}
