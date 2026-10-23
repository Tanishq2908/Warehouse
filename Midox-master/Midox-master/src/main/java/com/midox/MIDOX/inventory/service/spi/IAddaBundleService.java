package com.midox.MIDOX.inventory.service.spi;

import com.midox.MIDOX.inventory.Exception.MidoxException;
import com.midox.MIDOX.inventory.constants.TextileEnum;
import com.midox.MIDOX.inventory.entity.*;
import com.midox.MIDOX.inventory.models.RequestModels.AddaBundleSearchCriteria;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface IAddaBundleService {
    @Transactional(propagation = Propagation.REQUIRED)
    AddaBundle createBundle(AddaBundle bundle);

    @Transactional(propagation = Propagation.REQUIRED)
    boolean createBundlesForPattern(AddaPattern pattern) throws MidoxException;

    @Transactional(propagation = Propagation.REQUIRED)
    AddaBundle updateBundle(AddaBundle bundle) throws MidoxException;

    @Transactional(propagation = Propagation.REQUIRED)
    AddaBundle assignBundleToEmployee(AddaBundle bundle) throws MidoxException;

    List<AddaBundleHistory> getBundleHistoriesByCriteria(AddaBundleSearchCriteria criteria);

    @Transactional(propagation = Propagation.REQUIRED)
    AddaBundle updateBundleStatus(Integer bundleId, TextileEnum.ProcStatus processStatus) throws MidoxException;

    @Transactional(propagation = Propagation.REQUIRED)
    AddaBundleHistory createBundleHistory(AddaBundleHistory bundleHistory);

    @Transactional(propagation = Propagation.REQUIRED)
    AddaBundleHistory updateBundleHistory(AddaBundleHistory bundleHistory) throws MidoxException;

    void deleteAddaBundle(AddaBundle bundle) throws MidoxException;

    List<AddaBundle> getAddaBundleByCriteria(AddaBundleSearchCriteria searchCriteria);

    List<BundleCard> getBundleCards(AddaBundleSearchCriteria searchCriteria);
}
