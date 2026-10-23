package com.midox.MIDOX.inventory.service.spi;

import com.midox.MIDOX.inventory.Exception.MidoxException;
import com.midox.MIDOX.inventory.entity.*;
import com.midox.MIDOX.inventory.models.RequestModels.AddaSearchCriteria;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface IAddaService {
    @Transactional(propagation = Propagation.REQUIRED)
    Adda addAdda(Adda adda);

    Adda create(Adda adda) throws MidoxException;

    @Transactional(propagation = Propagation.REQUIRED)
    Adda updateAdda(Adda adda) throws MidoxException;

    AddaMaterial updateAddaMaterial(AddaMaterial addaMaterial) throws MidoxException;

    Adda updateAddaWithFinishedGoods(Adda adda, AddaPattern pattern, AddaBundle bundle) throws MidoxException;

    @Transactional(propagation = Propagation.REQUIRED)
    AddaMaterial addAddaMaterial(AddaMaterial addaMaterial) throws MidoxException;

    void deleteAddaMaterial(AddaMaterial addaMaterial) throws MidoxException;

    AddaPattern updateAddaPattern(AddaPattern addaPattern) throws MidoxException;

    @Transactional(propagation = Propagation.REQUIRED)
    AddaPattern addAddaPattern(AddaPattern addaPattern) throws MidoxException;

    void deleteAddaPattern(AddaPattern addaPattern) throws MidoxException;

     List<Adda> getAddaByCriteria(AddaSearchCriteria searchCriteria);

    List<DesignProcess> getDesignProcessesForAdda(Integer addaId);

    AddaPattern getPatternById(Integer patternId);

    // TODO add a validation API
}

