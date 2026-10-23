package com.midox.MIDOX.inventory.Exception;

public class MidoxException extends RuntimeException {

    public static String EXCEPTION_ENTITY_DOES_NOT_EXIST = "Entity doesn't exist in system";
    public static String NOT_ENOUGH_QUANTITY = "Not enough quantity present in inventory";
    public static String TOTAL_PATTERN_QUANTITY_EXCEEDS_ADDA_QTY = "Total pattern quantity exceeds adda quantity";
    public static String AMOUNT_PAID_MORE_THAN_OUTSTANDING = "Amount being paid is more than outstanding. Please check";
    public static String NO_OR_MORE_THAN_ONE_JOB_HISTORY_FOUND = "No or more than one job history found for the finished process";
    public static String NO_PROCESS_ASSOCIATED = "No process is associated with selected design";
    public static String BUNDLE_NOT_IN_TBS = "Bundle should be in To Be Started status for Employee assignment";
    public static String EXCEPTION_IN_JSON_CONVERSION = "Exception encountered when converting to JSON";






    public MidoxException(String message) {
        super(message);
    }

}
