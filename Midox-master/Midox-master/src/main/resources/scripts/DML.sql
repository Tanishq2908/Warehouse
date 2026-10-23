INSERT INTO public.group_master
(master_id, created_at, created_by, updated_at, updated_by, display_value, master_cd, master_prefix)
VALUES(nextval('group_master_sequence'), current_timestamp, 1, current_timestamp, 1, 'Material', 'MID_MAT', 'MAT_');

INSERT INTO public.group_master
(master_id, created_at, created_by, updated_at, updated_by, display_value, master_cd, master_prefix)
VALUES(nextval('group_master_sequence'), current_timestamp, 1, current_timestamp, 1, 'Sub Category', 'MID_SUB', 'SUB_');

INSERT INTO public.group_master
(master_id, created_at, created_by, updated_at, updated_by, display_value, master_cd, master_prefix)
VALUES(nextval('group_master_sequence'), current_timestamp, 1, current_timestamp, 1, 'Color Fabric Code', 'MID_CFC', 'CFC_');

INSERT INTO public.group_master
(master_id, created_at, created_by, updated_at, updated_by, display_value, master_cd, master_prefix)
VALUES(nextval('group_master_sequence'), current_timestamp, 1, current_timestamp, 1, 'Measurement Unit', 'MID_UNIT', 'UNIT_');

INSERT INTO public.group_master
(master_id, created_at, created_by, updated_at, updated_by, display_value, master_cd, master_prefix)
VALUES(nextval('group_master_sequence'), current_timestamp, 1, current_timestamp, 1, 'Product', 'MID_PROD', 'PROD_');

INSERT INTO public.group_master
(master_id, created_at, created_by, updated_at, updated_by, display_value, master_cd, master_prefix)
VALUES(nextval('group_master_sequence'), current_timestamp, 1, current_timestamp, 1, 'Process', 'MID_PROC', 'PROC_');

INSERT INTO public.group_master
(master_id, created_at, created_by, updated_at, updated_by, display_value, master_cd, master_prefix)
VALUES(nextval('group_master_sequence'), current_timestamp, 1, current_timestamp, 1, 'Size', 'MID_SIZE', 'SIZE_');

INSERT INTO public.group_master
(master_id, created_at, created_by, updated_at, updated_by, display_value, master_cd, master_prefix)
VALUES(nextval('group_master_sequence'), current_timestamp, 1, current_timestamp, 1, 'Colors', 'MID_COL', 'COL_');

-- Insert Process Status in master and entity
INSERT INTO public.group_master
(master_id, created_at, created_by, updated_at, updated_by, display_value, master_cd, master_prefix)
VALUES(nextval('group_master_sequence'), current_timestamp, 1, current_timestamp, 1, 'Process Status', 'MID_PROC_STAT', 'PROC_STAT_');

INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'To be started', 'PROC_STAT_TBS', 'MID_PROC_STAT', NULL);
INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'In Progress', 'PROC_STAT_INP', 'MID_PROC_STAT', NULL);
INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Hold', 'PROC_STAT_HOLD', 'MID_PROC_STAT', NULL);
INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Finished', 'PROC_STAT_FIN', 'MID_PROC_STAT', NULL);

-- Insert Payment modes in master and entity
INSERT INTO public.group_master
(master_id, created_at, created_by, updated_at, updated_by, display_value, master_cd, master_prefix)
VALUES(nextval('group_master_sequence'), current_timestamp, 1, current_timestamp, 1, 'Payment Mode', 'MID_PAY', 'PAY_');

INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'UPI', 'PAY_UPI', 'MID_PAY', NULL);
INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'CASH', 'PAY_CASH', 'MID_PAY', NULL);
INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Cheque', 'PAY_CHEQUE', 'MID_PAY', NULL);
INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Online Payment', 'PAY_ONLINE', 'MID_PAY', NULL);

-- Insert Payment status in master and entity
INSERT INTO public.group_master
(master_id, created_at, created_by, updated_at, updated_by, display_value, master_cd, master_prefix)
VALUES(nextval('group_master_sequence'), current_timestamp, 1, current_timestamp, 1, 'Payment Status', 'MID_PAID', 'PAID_');

INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Fully Paid', 'PAID_FULL', 'MID_PAID', NULL);
INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Unpaid', 'PAID_UNPAID', 'MID_PAID', NULL);
INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Partially Paid', 'PAID_PARTIAL', 'MID_PAID', NULL);

-- Insert Dispatch status in master and entity
INSERT INTO public.group_master
(master_id, created_at, created_by, updated_at, updated_by, display_value, master_cd, master_prefix)
VALUES(nextval('group_master_sequence'), current_timestamp, 1, current_timestamp, 1, 'Dispatch Status', 'MID_DISP_STATUS', 'DISP_STATUS_');

INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Ready For Dispatch', 'DISP_STATUS_READY', 'MID_DISP_STATUS', NULL);
INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Preparing For Dispatch', 'DISP_STATUS_PREP', 'MID_DISP_STATUS', NULL);
INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Partially Dispatched', 'DISP_STATUS_PART', 'MID_DISP_STATUS', NULL);
INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Fully Dispatched', 'DISP_STATUS_FULL', 'MID_DISP_STATUS', NULL);


-- Insert Roles in master and entity
INSERT INTO public.group_master
(master_id, created_at, created_by, updated_at, updated_by, display_value, master_cd, master_prefix)
VALUES(nextval('group_master_sequence'), current_timestamp, 1, current_timestamp, 1, 'Roles', 'MID_ROLE', 'ROLE_');

INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Accounts Manager', 'ROLE_ACCOUNT', 'MID_ROLE', NULL);
INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Dispatch Manager', 'ROLE_DISPATCH', 'MID_ROLE', NULL);
INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Job Card Manager', 'ROLE_JOB', 'MID_ROLE', NULL);
INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Adda Manager', 'ROLE_ADDA', 'MID_ROLE', NULL);
INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Inventory Manager', 'ROLE_INVENTORY', 'MID_ROLE', NULL);
INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Admin', 'ROLE_ADMIN', 'MID_ROLE', NULL);

-- Insert Employee status
INSERT INTO public.group_master
(master_id, created_at, created_by, updated_at, updated_by, display_value, master_cd, master_prefix)
VALUES(nextval('group_master_sequence'), current_timestamp, 1, current_timestamp, 1, 'Employee Status', 'MID_EMP', 'EMP_');

INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Employee Active', 'EMP_ACTIVE', 'MID_EMP', NULL);
INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Employee Inactive', 'EMP_INCTIVE', 'MID_EMP', NULL);


-- Insert Employee designation
INSERT INTO public.group_master
(master_id, created_at, created_by, updated_at, updated_by, display_value, master_cd, master_prefix)
VALUES(nextval('group_master_sequence'), current_timestamp, 1, current_timestamp, 1, 'Employee Designation', 'MID_DES', 'DES_');

INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Supervisor', 'DES_SUPER', 'MID_DES', NULL);
INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Manager', 'DES_MANGER', 'MID_DES', NULL);
INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Admin', 'DES_ADMIN', 'MID_DES', NULL);
INSERT INTO public.group_entity
(entity_id, created_at, created_by, updated_at, updated_by, display_value, entity_cd, master_cd, parent_entity_cd)
VALUES(nextval('entity_sequence'), current_timestamp, 1, current_timestamp, 1, 'Worker', 'DES_WORKER', 'MID_DES', NULL);


---------------------------------------------------------------------------------------------------
-- Default entries for entities

INSERT INTO public.brand
(brand_id, created_at, created_by, updated_at, updated_by, brand_name, address, brand_uid, contact_no, contact_person, status, email, description)
VALUES(1, current_timestamp, 1, current_timestamp, 1, 'System', 'India', 'XXXXXXXXXX', '', '', 'ACTIVE', '', 'System');

INSERT INTO public.supplier
(supplier_id, created_at, created_by, updated_at, updated_by, supplier_name, address, supplier_uid, contact_no, contact_person, status, email, description)
VALUES(1, current_timestamp, 1, current_timestamp, 1, 'System', 'India', 'XXXXXXXXXX', NULL, NULL, 'ACTIVE', NULL, NULL);

INSERT INTO public.employee
(emp_id, created_at, created_by, updated_at, updated_by, emp_name, contact_no, address, joining_date, emp_dob, gender, status, identification_no, designation, email, description, "password")
VALUES(1, current_timestamp, 1, current_timestamp, 1, 'System', NULL, 'India', '2000-01-01', NULL, 'OTHER', 'EMP_ACTIVE', NULL, 'ADMIN', NULL, NULL, '$2a$10$eOL3lPt0OprsaGlSYfEYouXbIPaEZaQAIUdoNzjuqKhdox5LcVp9O');

INSERT INTO public.employee_roles
(employee_role_id, employee_id, "role", created_at, created_by, updated_at, updated_by)
VALUES(11, 1, 'ROLE_ADMIN', current_timestamp, 1, current_timestamp , 1);