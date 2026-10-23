package com.midox.MIDOX.inventory.repository;

import com.midox.MIDOX.inventory.entity.AbstractDataEntity;
import jakarta.persistence.EntityManager;
import org.springframework.data.jpa.repository.support.JpaEntityInformation;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;

import java.util.List;

public class MidoxRepositoryImpl {//<T extends AbstractDataEntity> extends SimpleJpaRepository<T, Long> implements MidoxRepository<T, Long> {

    /*public MidoxRepositoryImpl(JpaEntityInformation<T, ?> entityInformation, EntityManager entityManager) {
        super(entityInformation, entityManager);
    }

    @Override
    public <S extends T> S saveAndFlush(S entity){
        entity.setDefaultValues();
        return saveAndFlush(entity);
    }

    @Override
    public<S extends T> List<S> saveAllAndFlush(Iterable<S> entities){
        entities.forEach(entity -> entity.setDefaultValues());
        return saveAllAndFlush(entities);
    }
*/
}
