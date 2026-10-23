package com.midox.MIDOX.inventory.constants;

public class TextileEnum {
//TODO enums are not supported with Master entity framework. Need to work on it so that values in dropdown can be fetched from DB
    public enum EmployeeStatus{
        EMP_ACTIVE("EMP_ACTIVE"),
        EMP_INACTIVE("EMP_INACTIVE");

        private final String status;
        private EmployeeStatus(String status){
            this.status = status;
        }

        public String getStatus(){
            return status;
        }
    }

    public enum Status{
        ACTIVE,
        INACTIVE
    }

    public enum SearchResultType{
        EMPLOYEE,
        ADDA,
        BUNDLE
    }

    public enum ProcStatus{
        // These entries are static and should be present in DB
        PROC_STAT_TBS,
        PROC_STAT_INP,
        PROC_STAT_HOLD,
        PROC_STAT_FIN
    }

    public enum DispatchStatus{
        // These entries are static and should be present in DB
        DISP_STATUS_PREP,
        DISP_STATUS_READY,
        DISP_STATUS_PART,
        DISP_STATUS_FULL
    }

    public enum Designation{
        WORKER,
        SUPERVISOR,
        MANAGER,
        ADMIN
    }

    public enum PaymentMode{
        PAY_CASH,
        PAY_CHEQUE,
        PAY_ONLINE,
        PAY_UPI
    }

    public enum PaymentStatus{
        PAID_FULL,
        PAID_PARTIAL,
        PAID_UNPAID
    }

    public enum Gender{
        MALE,
        FEMALE,
        OTHER
    }

    public enum Roles{
        ROLE_ADMIN,
        ROLE_INVENTORY,
        ROLE_ADDA,
        ROLE_JOB,
        ROLE_DISPATCH,
        ROLE_ACCOUNT
    }
}
