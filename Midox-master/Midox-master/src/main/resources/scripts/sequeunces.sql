-- public.group_master_sequence definition

-- DROP SEQUENCE public.group_master_sequence;

CREATE SEQUENCE public.group_master_sequence
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
	
-- public.entity_sequence definition

-- DROP SEQUENCE public.entity_sequence;

CREATE SEQUENCE public.entity_sequence
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;


-- public.stock_sequence definition

-- DROP SEQUENCE public.stock_sequence;

CREATE SEQUENCE public.stock_sequence
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
	
-- public.stock_history_sequence definition

-- DROP SEQUENCE public.stock_history_sequence;

CREATE SEQUENCE public.stock_history_sequence
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
	
-- public.emp_seq definition

-- DROP SEQUENCE public.emp_seq;

CREATE SEQUENCE public.emp_seq
	INCREMENT BY 1
	MINVALUE 2
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;


------------------------------------------------FIRST DRAFT -----------------------------------

CREATE SEQUENCE public.brand_sequence
	INCREMENT BY 1
	MINVALUE 2
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;


-- public.supplier_sequence definition

-- DROP SEQUENCE public.supplier_sequence;

CREATE SEQUENCE public.supplier_sequence
	INCREMENT BY 2
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;


CREATE SEQUENCE public.design_sequence
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

CREATE SEQUENCE public.design_process_sequence
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;


------------------------------------------------SECOND DRAFT -----------------------------------

------------------------------------------------THIRD DRAFT -----------------------------------

CREATE SEQUENCE public.adda_sequence
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

	CREATE SEQUENCE public.adda_mat_sequence
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

	CREATE SEQUENCE public.adda_pattern_sequence
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

------------------------------------------------FOURTH DRAFT -----------------------------------

CREATE SEQUENCE public.bundle_sequence
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

CREATE SEQUENCE public.bundle_history_sequence
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;


CREATE SEQUENCE public.job_history_sequence
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

CREATE SEQUENCE public.payment_sequence
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

CREATE SEQUENCE public.payment_history_sequence
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

------------------------------------------------FOURTH DRAFT -----------------------------------

CREATE SEQUENCE public.finished_goods_sequence
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

CREATE SEQUENCE public.dispatch_sequence
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

------------------------------------------------FIFTH DRAFT -----------------------------------

CREATE SEQUENCE public.employee_role_seq
	INCREMENT BY 1
	MINVALUE 2
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

CREATE SEQUENCE public.adda_info_sequence
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;