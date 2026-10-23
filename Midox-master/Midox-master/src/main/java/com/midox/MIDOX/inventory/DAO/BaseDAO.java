package com.midox.MIDOX.inventory.DAO;

import java.util.Collection;
import java.util.List;

public interface BaseDAO<E, PK> {
    <EK, EKPK> EK getRefByPK(final EKPK ekPK, Class<EK> ek);

    void persist(final E entity);

    E merge(final E entity);

    E findByPk(final PK pk);

    <T> List<T> bulkUpdate(Collection<T> entities);

    E getRefByPK(final PK pk);

    E persistEntity(E entity);

    <T> List<T> bulkInsert(Collection<T> entities);

    <T> List<T> bulkRemove(Collection<T> entities);
}
