package com.midox.MIDOX.inventory.service.api;

import com.midox.MIDOX.inventory.Exception.MidoxException;
import com.midox.MIDOX.inventory.constants.BusinessConstants;
import com.midox.MIDOX.inventory.entity.*;
import com.midox.MIDOX.inventory.models.RequestModels.AddaSearchCriteria;
import com.midox.MIDOX.inventory.models.RequestModels.DispatchSearchCriteria;
import com.midox.MIDOX.inventory.models.RequestModels.StockHistorySearchCriteria;
import com.midox.MIDOX.inventory.repository.Adda.AddaMaterialRepository;
import com.midox.MIDOX.inventory.repository.Adda.AddaPatternRepository;
import com.midox.MIDOX.inventory.repository.Adda.AddaRepository;
import com.midox.MIDOX.inventory.repository.FinishedGoodsRepository;
import com.midox.MIDOX.inventory.service.spi.*;
import com.midox.MIDOX.inventory.util.MapperUtils;
import com.midox.MIDOX.inventory.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FinishedGoodsServiceImpl implements IFinishedGoodsService {

    @Autowired
    FinishedGoodsRepository goodsRepository;

    @Override
    public FinishedGoods createFinishedGoods(FinishedGoods finishedGoods) {
        finishedGoods.setDefaultValues();
        return goodsRepository.saveAndFlush(finishedGoods);
    }

    @Override
    public FinishedGoods updateFinishedGoods(FinishedGoods finishedGoods) {
        if(null == finishedGoods.getFinishedGoodsId()){
            throw new MidoxException(MidoxException.EXCEPTION_ENTITY_DOES_NOT_EXIST);
        }
        finishedGoods.setDefaultValues();
        return goodsRepository.saveAndFlush(finishedGoods);
    }

    @Override
    public List<FinishedGoods> getFinishedGoods(DispatchSearchCriteria searchCriteria) {
        return goodsRepository.findFinishedGoodsByCriteria(searchCriteria.getFinishedGoodsId(),
                searchCriteria.getAddaId(), searchCriteria.getPatternId(), searchCriteria.getBrandId(),
                searchCriteria.getAddaNo(), searchCriteria.getDesignNo(), searchCriteria.getProductCd());
    }
}
