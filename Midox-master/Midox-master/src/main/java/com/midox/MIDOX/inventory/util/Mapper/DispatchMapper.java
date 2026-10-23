package com.midox.MIDOX.inventory.util.Mapper;

import com.midox.MIDOX.inventory.entity.Adda;
import com.midox.MIDOX.inventory.entity.AddaPattern;
import com.midox.MIDOX.inventory.entity.Dispatch;
import com.midox.MIDOX.inventory.entity.FinishedGoods;
import com.midox.MIDOX.inventory.models.RequestModels.AddaSearchCriteria;
import com.midox.MIDOX.inventory.models.RequestModels.DispatchSearchCriteria;
import com.midox.MIDOX.inventory.models.ResponseModels.DispatchResponse;
import com.midox.MIDOX.inventory.models.ResponseModels.FinishedGoodsResponse;
import com.midox.MIDOX.inventory.service.spi.IAddaService;
import com.midox.MIDOX.inventory.service.spi.IFinishedGoodsService;
import com.midox.MIDOX.inventory.util.ValidationUtil;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Mapper( componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {EntityCodeMapper.class, EmployeeNameMapper.class, FinishedGoodsMapper.class})
public abstract class DispatchMapper {

    @Mapping(source = "finishedGoodsId", target = "finishedGoods", qualifiedByName = "mapFinishedGoods")
    public abstract DispatchResponse toDispatchResponse(Dispatch dispatch);

    @Autowired
    private IFinishedGoodsService goodsService;

    @Named(value = "mapFinishedGoods")
    FinishedGoods mapFinishedGoods(Integer finishedGoodsId) {
        DispatchSearchCriteria searchCriteria = new DispatchSearchCriteria();
        searchCriteria.setFinishedGoodsId(finishedGoodsId);
        List<FinishedGoods> goods = goodsService.getFinishedGoods(searchCriteria);
        if(ValidationUtil.isNotEmpty(goods) && goods.size() == 1){
            return goods.get(0);
        }
        return null;
    }
}
