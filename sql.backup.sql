CREATE TABLE public.roles (
	id bigserial NOT NULL,
	"name" varchar(400) NULL,
	"isActive" bool NULL DEFAULT true,
	"createdAt" int8 NULL,
	"updatedAt" int8 NULL,
	CONSTRAINT roles_pkey PRIMARY KEY (id)
);

-- Permissions

ALTER TABLE public.roles OWNER TO postgres;
GRANT ALL ON TABLE public.roles TO postgres;


-- Drop table

-- DROP TABLE public.user_roles;

CREATE TABLE public.user_roles (
	id bigserial NOT NULL,
	"userId" int8 NULL,
	"roleId" int8 NULL,
	"createdAt" int8 NULL,
	"updatedAt" int8 NULL,
	CONSTRAINT user_roles_pkey PRIMARY KEY (id)
);

-- Permissions

ALTER TABLE public.user_roles OWNER TO postgres;
GRANT ALL ON TABLE public.user_roles TO postgres;


-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id bigserial NOT NULL,
	"name" varchar(500) NULL,
	email varchar(1000) NULL,
	"userName" varchar(400) NULL,
	"isActive" bool NULL DEFAULT true,
	"password" varchar(400) NULL,
	"location" varchar(400) NULL,
	gender varchar(400) NULL,
	"mobileNo" varchar(400) NULL,
	"houseId" int8 NULL,
	"verifyToken" varchar(500) NULL,
	"createdBy" int8 NULL,
	"createdAt" int8 NULL,
	"updatedAt" int8 NULL,
	"lastLogin" int8 NULL,
	"verifyTokenExpiryTime" int8 NULL,
	"emailVerified" bool NULL DEFAULT false,
	CONSTRAINT mobile_no UNIQUE ("mobileNo"),
	CONSTRAINT user_name UNIQUE ("userName"),
	CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Permissions

ALTER TABLE public.users OWNER TO postgres;
GRANT ALL ON TABLE public.users TO postgres;

