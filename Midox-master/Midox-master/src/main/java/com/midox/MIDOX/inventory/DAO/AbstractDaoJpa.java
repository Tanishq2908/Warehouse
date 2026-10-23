package com.midox.MIDOX.inventory.DAO;

import com.midox.MIDOX.inventory.entity.Stock;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import jakarta.persistence.TypedQuery;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public abstract class AbstractDaoJpa<E, PK>  implements BaseDAO<E, PK> {

    @PersistenceContext
    private EntityManager em;

    private final Class<? extends E> entityClass;

    public AbstractDaoJpa(final Class<? extends E> aEntityClass) {
        super();
        this.entityClass = aEntityClass;
    }

    @Override
    public E findByPk(final PK pk) {
        return getEntityManager().find(this.entityClass, pk);
    }

    protected EntityManager getEntityManager() {
        return em;
    }

    @Override
    @Transactional
    public E merge(final E entity) {
        return getEntityManager().merge(entity);
    }

    @Override
    @Transactional
    public void persist(final E entity) {
        getEntityManager().persist(entity);
    }

    @Override
    public E persistEntity(E entity) {
        getEntityManager().persist(entity);
        return entity;
    }

    public static <T> T getSingleResult(Query query) {
        query.setMaxResults(1);
        List<T> list = query.getResultList();
        if (list == null || list.isEmpty()) {
            return null;
        }
        return list.get(0);
    }

    public static <T> T getSingleResult(TypedQuery<T> query) {
        query.setMaxResults(1);
        List<T> list = query.getResultList();
        if (list == null || list.isEmpty()) {
            return null;
        }
        return list.get(0);
    }


    public void prepareForTest(EntityManager entityManager) {
        this.em = entityManager;
    }

    @Transactional
    public <T> List<T> bulkInsert(Collection<T> entities) {
        int batchSize = 50;
        final List<T> savedEntities = new ArrayList<T>(entities.size());
        int i = 0;
        for (T t : entities) {
            em.persist(t);
            i++;
            if (i % batchSize == 0) {
                em.flush();
                em.clear();
            }
        }
        return savedEntities;
    }

    @Transactional
    public <T> List<T> bulkUpdate(Collection<T> entities) {
        int batchSize = 50;
        final List<T> savedEntities = new ArrayList<T>(entities.size());
        int i = 0;
        for (T t : entities) {
            em.merge(t);
            i++;
            if (i % batchSize == 0) {
                em.flush();
                em.clear();
            }
        }
        return savedEntities;
    }

    @Transactional
    public <T> List<T> bulkRemove(Collection<T> entities) {
        int batchSize = 50;
        final List<T> savedEntities = new ArrayList<T>(entities.size());
        int i = 0;
        for (T t : entities) {
            em.remove(t);
            i++;
            if (i % batchSize == 0) {
                em.flush();
                em.clear();
            }
        }
        return savedEntities;
    }

    public E getRefByPK(final PK pk) {
        return getEntityManager().getReference(this.entityClass, pk);
    }

    public <EK, EKPK> EK getRefByPK(final EKPK ekPK, Class<EK> ek) {
        return getEntityManager().getReference(ek, ekPK);
    }

}
