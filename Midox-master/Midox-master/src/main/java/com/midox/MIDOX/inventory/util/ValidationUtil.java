package com.midox.MIDOX.inventory.util;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
//Nice
public class ValidationUtil {

    public static Sort sortBy = Sort.by(Sort.Direction.DESC, "createdAt");

    public static boolean isNotNull(Integer integer) {
        if (integer != null) {
            return true;
        }
        return false;
    }

    public static <T> boolean isNotNull(Optional<T> optional) {
        if (optional != null && optional.isPresent()) {
            return true;
        }
        return false;
    }

    public static <T> boolean isEmpty(List<T> list) {
        return list == null || list.isEmpty();
    }

    public static <T> boolean isNotEmpty(List<T> list) {
        return null != list && list.size() > 0;
    }

    public static boolean isNotNull(String string) {
        if (string != null) {
            return true;
        }
        return false;
    }

    public static <T> boolean isNotNull(List<T> optionsList) {
        if (optionsList.size() > 0) {
            return true;
        }
        return false;
    }

    public static <T> boolean allFieldsEmpty(Object criteria) {
        if(null != criteria){
            return Arrays.stream(criteria.getClass().getDeclaredFields()).peek(field -> field.setAccessible(true)).allMatch(field -> {
                try {
                    return field.get(criteria) == null;
                } catch (Exception e) {
                    // swallowing error
                    return false;
                }
            });
        }
        return true;
    }
}
