-- DROP TABLE public.group_master;

CREATE TABLE public.group_master (
	master_id int4 NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by int4 NULL DEFAULT 1,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by int4 NULL DEFAULT 1,
	display_value varchar(255) NULL,
	master_cd varchar(255) NULL,
	master_prefix varchar(255) NULL,
	CONSTRAINT group_master_pkey PRIMARY KEY (master_id),
	CONSTRAINT uk_master UNIQUE (master_cd),
	CONSTRAINT uk_display UNIQUE (display_value),
	CONSTRAINT uk_prefix UNIQUE (master_prefix)
);


-- public.group_entity definition

-- Drop table

-- DROP TABLE public.group_entity;

CREATE TABLE public.group_entity (
	entity_id int4 NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by int4 NULL DEFAULT 1,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by int4 NULL DEFAULT 1,
	display_value varchar(255) NULL,
	entity_cd varchar(255) NULL,
	master_cd varchar(255) NULL,
	parent_entity_cd varchar(255) NULL,
	CONSTRAINT group_entity_pkey PRIMARY KEY (entity_id),
	CONSTRAINT uk_entity UNIQUE (entity_cd),
	-- To be amended at server - Done
	CONSTRAINT group_entity_un_dis UNIQUE (display_value, master_cd, parent_entity_cd)
);

-- public.stock definition

-- Drop table

-- DROP TABLE public.stock;

CREATE TABLE public.stock (
	stock_id int4 NOT NULL,
	created_at timestamp NULL,
	created_by int4 NULL,
	updated_at timestamp NULL,
	updated_by int4 NULL,
	color_fabric_cd varchar(255) NULL,
	material_cd varchar(255) NULL,
	subcategory_cd varchar(255) NULL,
	unit varchar(255) NULL,
	available_quantity float8 NULL,
	CONSTRAINT stock_pkey PRIMARY KEY (stock_id),
	CONSTRAINT stock_un UNIQUE (material_cd, color_fabric_cd, subcategory_cd),
	-- To be amended in server DB -- Done
	CONSTRAINT stock_fk FOREIGN KEY (color_fabric_cd) REFERENCES public.group_entity(entity_cd),
    	CONSTRAINT stock_fk_1 FOREIGN KEY (material_cd) REFERENCES public.group_entity(entity_cd),
    	CONSTRAINT stock_fk_2 FOREIGN KEY (subcategory_cd) REFERENCES public.group_entity(entity_cd),
    	CONSTRAINT stock_fk_3 FOREIGN KEY (unit) REFERENCES public.group_entity(entity_cd)
);

-- DROP TABLE public.stock_history;

CREATE TABLE public.stock_history (
	stock_history_id int4 NOT NULL,
	created_at timestamp NULL,
	created_by int4 NULL,
	updated_at timestamp NULL,
	updated_by int4 NULL,
	bill_date timestamp(6) NULL,
	bill_no varchar(255) NULL,
	quantity float8 NULL,
	supplier_id int4 NULL,
	stock_id int4 NULL,
	amount float8 NULL,
	CONSTRAINT stock_history_pkey PRIMARY KEY (stock_history_id),
	CONSTRAINT fk_stock FOREIGN KEY (stock_id) REFERENCES public.stock(stock_id)
);
-- To be amended in server DB -- Done
ALTER TABLE public.stock_history ALTER COLUMN bill_date TYPE date USING bill_date::date;

------------------------------------------------------- First Draft -----------------------------
-- DROP TABLE public.employee;

CREATE TABLE public.employee (
	emp_id int4 NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by int4 NULL DEFAULT 1,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by int4 NULL DEFAULT 1,
	emp_name varchar(255) NULL,
	contact_no varchar(255) NULL,
	address varchar(255) NULL,
	joining_date date NULL DEFAULT CURRENT_DATE,
	emp_dob date NULL,
	gender varchar NOT NULL,
	status varchar NOT NULL,
	identification_no varchar NULL,
	designation varchar NOT NULL,
	CONSTRAINT employee_pkey PRIMARY KEY (emp_id),
	CONSTRAINT uk_id UNIQUE (identification_no)
);

CREATE TABLE public.brand (
	brand_id int4 NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by int4 NULL DEFAULT 1,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by int4 NULL DEFAULT 1,
	brand_name varchar(255) NULL,
	address varchar(255) NULL,
	brand_uid varchar(255) NULL,
	contact_no varchar(255) null,
	contact_person varchar(255) null,
	status varchar not null,
	CONSTRAINT brand_pkey PRIMARY KEY (brand_id),
	CONSTRAINT uk_uid UNIQUE (brand_uid)
);

-- public.supplier definition

-- Drop table

-- DROP TABLE public.supplier;

CREATE TABLE public.supplier (
	supplier_id int4 NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by int4 NULL DEFAULT 1,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by int4 NULL DEFAULT 1,
	supplier_name varchar(255) not NULL,
	address varchar(255) not NULL,
	supplier_uid varchar(255) not NULL,
	contact_no varchar(255) null,
	contact_person varchar(255) null,
	status varchar not null,
	CONSTRAINT supplier_pkey PRIMARY KEY (supplier_id),
	CONSTRAINT uk_suid UNIQUE (supplier_uid)
);

------------------------------------------------------- First Draft -----------------------------

ALTER TABLE public.supplier ADD email varchar NULL;
ALTER TABLE public.supplier ADD description varchar(255) NULL;


ALTER TABLE public.brand ADD email varchar NULL;
ALTER TABLE public.brand ADD description varchar(255) NULL;

ALTER TABLE public.employee ADD email varchar NULL;
ALTER TABLE public.employee ADD description varchar(255) NULL;

------------------------------------------------------- Second Draft -----------------------------

CREATE TABLE public.design (
	design_id int4 NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by int4 NULL DEFAULT 1,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by int4 NULL DEFAULT 1,
	brand_id int4 NOT NULL,
	design_no varchar(255) not NULL,
	product_cd varchar(255) NOT NULL,
	details varchar(255) null,
	status varchar NOT NULL,
	CONSTRAINT design_pkey PRIMARY KEY (design_id),
	CONSTRAINT design_un UNIQUE (brand_id, design_no)
	);

CREATE TABLE public.design_process (
	process_id int4 NOT NULL,
	design_id int4 NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by int4 NULL DEFAULT 1,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by int4 NULL DEFAULT 1,
	process_cd varchar(255) NOT NULL,
	priority int4 not null,
	rate_per_peice float8 not null,
	details varchar(255) null,
	status varchar NOT NULL,
	CONSTRAINT design_process_pkey PRIMARY KEY (process_id),
    CONSTRAINT design_process_un UNIQUE (design_id, process_cd),
    CONSTRAINT design_process_un2 UNIQUE (design_id, priority, status),
    CONSTRAINT design_process_fk FOREIGN KEY (process_cd) REFERENCES public.group_entity(entity_cd)
);

------------------------------------------------------- Third Draft -----------------------------

CREATE TABLE public.adda (
	design_id int4 NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by int4 NULL DEFAULT 1,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by int4 NULL DEFAULT 1,
	adda_id int4 NOT NULL,
	adda_no varchar(255) NOT NULL,
	completion_date date NULL,
	quantity float8 NOT NULL,
	remarks varchar(255) NULL,
	status varchar NOT NULL,
	brand_id int4 NOT NULL,
	CONSTRAINT adda_pkey PRIMARY KEY (adda_id),
	CONSTRAINT adda_un UNIQUE (adda_no),
	CONSTRAINT adda_fk FOREIGN KEY (brand_id) REFERENCES public.brand(brand_id),
	CONSTRAINT adda_fk_1 FOREIGN KEY (design_id) REFERENCES public.design(design_id),
	CONSTRAINT adda_fk_2 FOREIGN KEY (status) REFERENCES public.group_entity(entity_cd)
);

CREATE TABLE public.adda_material (
	adda_material_id int4 NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by int4 NULL DEFAULT 1,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by int4 NULL DEFAULT 1,
	adda_id int4 NOT NULL,
	stock_id int4 NOT NULL,
	quantity float8 NOT NULL,
	CONSTRAINT material_pkey PRIMARY KEY (adda_material_id),
	CONSTRAINT material_un UNIQUE (adda_id, stock_id),
	CONSTRAINT adda_material_fk FOREIGN KEY (adda_id) REFERENCES public.adda(adda_id),
	CONSTRAINT adda_material_fk_1 FOREIGN KEY (stock_id) REFERENCES public.stock(stock_id)
);

CREATE TABLE public.adda_pattern (
	pattern_id int4 NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by int4 NULL DEFAULT 1,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by int4 NULL DEFAULT 1,
	"size" varchar(255) NULL,
	color varchar(255) NULL,
	adda_id int4 NOT NULL,
	bundle_size int4 NOT NULL,
	quantity float8 NOT NULL,
	CONSTRAINT pattern_pkey PRIMARY KEY (pattern_id),
	CONSTRAINT pattern_un UNIQUE (adda_id, size, color),
	CONSTRAINT adda_pattern_fk FOREIGN KEY (adda_id) REFERENCES public.adda(adda_id),
	CONSTRAINT adda_pattern_fk_1 FOREIGN KEY ("size") REFERENCES public.group_entity(entity_cd),
	CONSTRAINT adda_pattern_fk_2 FOREIGN KEY (color) REFERENCES public.group_entity(entity_cd)
);

ALTER TABLE public.stock_history ADD adda_id int4 NULL;
ALTER TABLE public.stock_history ADD credit_debit_ind char NOT NULL DEFAULT 'C';

ALTER TABLE public.design ADD CONSTRAINT design_fk FOREIGN KEY (brand_id) REFERENCES public.brand(brand_id);
ALTER TABLE public.design ADD CONSTRAINT design_fk_1 FOREIGN KEY (product_cd) REFERENCES public.group_entity(entity_cd);

------------------------------------------------------- Fourth Draft -----------------------------

ALTER TABLE public.stock ADD stock_name varchar(255) NULL;

------------------------------------------------------- Fourth Draft -----------------------------
ALTER TABLE public.adda ADD finished_quantity float8 NULL;
ALTER TABLE public.adda_pattern ADD finished_quantity float8 NULL;


CREATE TABLE public.adda_bundle (
	bundle_id int4 NOT NULL,
	bundle_name varchar(255) NULL,
	pattern_id int4 NOT NULL,
	status varchar NOT NULL,
	current_process_cd varchar ,
	current_process_status varchar ,
	current_employee_id int4,
	quantity float8 NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by int4 NULL DEFAULT 1,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by int4 NULL DEFAULT 1,
	CONSTRAINT bundle_pkey PRIMARY KEY (bundle_id),
	CONSTRAINT bundle_un UNIQUE (bundle_name)
);

CREATE TABLE public.adda_bundle_history (
	bundle_history_id int4 NOT NULL,
	bundle_id int4 NOT NULL,
	process_cd varchar NOT NULL,
	process_status varchar(255) NULL,
	employee_id int4,
	quantity float8 NOT NULL,
	start_date date NULL,
	end_date date NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by int4 NULL DEFAULT 1,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by int4 NULL DEFAULT 1,
	CONSTRAINT bundle_history_pkey PRIMARY KEY (bundle_history_id)
);


CREATE TABLE public.job_history (
	job_history_id int4 NOT NULL,
	employee_id int4 NOT NULL,
	bundle_history_id int4 NOT NULL,
	completion_date date NULL,
	quantity float8 NOT NULL,
	total_wage float8 NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by int4 NULL DEFAULT 1,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by int4 NULL DEFAULT 1,
	details varchar NULL,
	payment_status varchar NOT NULL,
	paid_wage float8 NOT NULL,
	process_cd varchar(255) NULL,
	CONSTRAINT job_history_pkey PRIMARY KEY (job_history_id),
	CONSTRAINT job_history_un UNIQUE (employee_id, bundle_history_id)
);

CREATE TABLE public.employee_payment (
	payment_id int4 NOT NULL,
	employee_id int4 NOT NULL,
	outstanding float8 NOT NULL,
	total_paid float8 NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by int4 NULL DEFAULT 1,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by int4 NULL DEFAULT 1,
	CONSTRAINT payment_pkey PRIMARY KEY (payment_id),
	CONSTRAINT payment_un UNIQUE (employee_id)

);

CREATE TABLE public.employee_payment_history (
	payment_history_id int4 NOT NULL,
	employee_id int4 NOT NULL,
	payment_mode varchar NOT NULL,
	paid_by int4 NOT NULL,
	amount_paid float8 NOT NULL,
	payment_date date NULL,
	details varchar null,

	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by int4 NULL DEFAULT 1,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by int4 NULL DEFAULT 1,
	CONSTRAINT pay_history_pkey PRIMARY KEY (payment_history_id)
);


ALTER TABLE public.job_history ADD CONSTRAINT job_history_fk FOREIGN KEY (employee_id) REFERENCES public.employee(emp_id);
ALTER TABLE public.job_history ADD CONSTRAINT job_history_fk_1 FOREIGN KEY (bundle_history_id) REFERENCES public.adda_bundle_history(bundle_history_id);
ALTER TABLE public.job_history ADD CONSTRAINT job_history_fk_2 FOREIGN KEY (payment_status) REFERENCES public.group_entity(entity_cd);
ALTER TABLE public.job_history ADD CONSTRAINT job_history_fk_3 FOREIGN KEY (process_cd) REFERENCES public.group_entity(entity_cd);

ALTER TABLE public.employee_payment ADD CONSTRAINT employee_payment_fk FOREIGN KEY (employee_id) REFERENCES public.employee(emp_id);

ALTER TABLE public.employee_payment_history ADD CONSTRAINT employee_payment_history_fk FOREIGN KEY (employee_id) REFERENCES public.employee(emp_id);
ALTER TABLE public.employee_payment_history ADD CONSTRAINT employee_payment_history_fk_1 FOREIGN KEY (paid_by) REFERENCES public.employee(emp_id);
ALTER TABLE public.employee_payment_history ADD CONSTRAINT employee_payment_history_fk_2 FOREIGN KEY (payment_mode) REFERENCES public.group_entity(entity_cd);

ALTER TABLE public.job_history ADD assign_date date NULL;
ALTER TABLE public.job_history ADD status varchar(255) NULL;

------------------------------------------------------- Fifth Draft -----------------------------


ALTER TABLE public.adda_pattern ADD pattern_name varchar(255) NULL;

------------------------------------------------------- Sixth Draft -----------------------------
CREATE TABLE public.finished_goods (
	finished_goods_id int4 NOT NULL,
	adda_id int4 NOT NULL,
	pattern_id int4 NOT NULL,
	status varchar NOT NULL,
	dispatched_quantity float8 NOT NULL,
	finished_quantity float8 NOT NULL,
	available_quantity float8 NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by int4 NULL DEFAULT 1,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by int4 NULL DEFAULT 1,
	CONSTRAINT goods_pkey PRIMARY KEY (finished_goods_id),
	CONSTRAINT goods_un UNIQUE (adda_id, pattern_id),
    CONSTRAINT finished_goods_fk FOREIGN KEY (status) REFERENCES public.group_entity(entity_cd)
);

CREATE TABLE public.dispatch (
	dispatch_id int4 NOT NULL,
	finished_goods_id int4 NOT NULL,
	quantity float8 NOT NULL,
	dispatch_date date NOT NULL,
	remarks varchar null,
	vehicle_no varchar(255) NULL,
	dispatch_no varchar(255) NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by int4 NULL DEFAULT 1,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by int4 NULL DEFAULT 1,
	CONSTRAINT dispatch_pkey PRIMARY KEY (dispatch_id),
    CONSTRAINT dispatch_fk FOREIGN KEY (finished_goods_id) REFERENCES public.finished_goods(finished_goods_id)
);

------------------------------------------------------- Sixth Draft -----------------------------
ALTER TABLE public.employee ADD "password" varchar NULL;

CREATE TABLE public.employee_roles (
	employee_role_id int4 NOT NULL,
	employee_id int4 NOT NULL,
	role varchar(255) NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by int4 NULL DEFAULT 1,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by int4 NULL DEFAULT 1,
	CONSTRAINT roles_pkey PRIMARY KEY (employee_role_id),
    CONSTRAINT roles_fk FOREIGN KEY (employee_id) REFERENCES public.employee(emp_id)
);

------------------------------------------------------- Seventh Draft -----------------------------

CREATE TABLE public.adda_info (
	adda_info_id int4 NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_by int4 NULL DEFAULT 1,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by int4 NULL DEFAULT 1,
	adda_id int4 NULL,
	drying_by int4 NULL,
	cutting_by int4 NOT NULL,
	tie_by int4 NULL,
	custom int4 NULL,
	gross_weight float8 NULL,
	net_weight float8 NULL,
	wastage_weight float8 NULL,
	wastage_percent float8 NULL,
	rib_weight float8 NULL,
	paipin_weight float8 NULL,
	rib_net_weight float8 NULL,
	CONSTRAINT info_pkey PRIMARY KEY (adda_info_id),
	CONSTRAINT adda_info_fk FOREIGN KEY (adda_id) REFERENCES public.adda(adda_id)
);
-------------------------------------- indexes added for performance
CREATE INDEX bundle_ptrn ON public.adda_bundle USING btree (pattern_id);
CREATE INDEX bundle_history_srch ON public.adda_bundle_history USING btree (bundle_id, process_cd);
CREATE INDEX job_history_srch ON public.job_history USING btree (bundle_history_id, status);

CREATE INDEX employee_srch ON public.employee USING btree (emp_name);

analyze;

VACUUM(FULL, ANALYZE, VERBOSE);