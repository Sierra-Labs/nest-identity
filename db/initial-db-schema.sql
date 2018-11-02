--
-- PostgreSQL database dump
--

-- Dumped from database version 10.4 (Debian 10.4-1.pgdg90+1)
-- Dumped by pg_dump version 10.4 (Debian 10.4-1.pgdg90+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: citext; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: organization; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.organization (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    address_line_1 text,
    address_line_2 text,
    city text,
    state_id integer,
    postal_code text,
    created timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer,
    modified timestamp without time zone DEFAULT now() NOT NULL,
    modified_by integer
);


ALTER TABLE public.organization OWNER TO root;

--
-- Name: organization_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.organization_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.organization_id_seq OWNER TO root;

--
-- Name: organization_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.organization_id_seq OWNED BY public.organization.id;


--
-- Name: role; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.role (
    id integer NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.role OWNER TO root;

--
-- Name: role_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.role_id_seq OWNER TO root;

--
-- Name: role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.role_id_seq OWNED BY public.role.id;


--
-- Name: state; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.state (
    id integer NOT NULL,
    name text NOT NULL,
    abbreviation character varying(3) NOT NULL,
    country character varying NOT NULL,
    state_type text NOT NULL,
    assoc_press text NOT NULL,
    standard_federal_region text NOT NULL,
    census_region text NOT NULL,
    census_region_name text NOT NULL,
    census_division text NOT NULL,
    census_division_name text NOT NULL,
    circuit_court text NOT NULL,
    created timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.state OWNER TO root;

--
-- Name: state_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.state_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.state_id_seq OWNER TO root;

--
-- Name: state_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.state_id_seq OWNED BY public.state.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    email public.citext NOT NULL,
    password character varying(256) NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    created timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer,
    modified timestamp without time zone DEFAULT now() NOT NULL,
    modified_by integer
);


ALTER TABLE public."user" OWNER TO root;

--
-- Name: user_address; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.user_address (
    id integer NOT NULL,
    user_id integer,
    address_line_1 text,
    address_line_2 text,
    city text,
    state_id integer,
    postal_code text,
    is_primary boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer,
    modified timestamp without time zone DEFAULT now() NOT NULL,
    modified_by integer
);


ALTER TABLE public.user_address OWNER TO root;

--
-- Name: user_address_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.user_address_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_address_id_seq OWNER TO root;

--
-- Name: user_address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.user_address_id_seq OWNED BY public.user_address.id;


--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO root;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: user_phone; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.user_phone (
    id integer NOT NULL,
    user_id integer,
    type text NOT NULL,
    number text NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    can_text boolean DEFAULT false NOT NULL,
    deleted timestamp without time zone,
    created timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer,
    modified timestamp without time zone DEFAULT now() NOT NULL,
    modified_by integer
);


ALTER TABLE public.user_phone OWNER TO root;

--
-- Name: user_phone_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.user_phone_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_phone_id_seq OWNER TO root;

--
-- Name: user_phone_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.user_phone_id_seq OWNED BY public.user_phone.id;


--
-- Name: user_role; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.user_role (
    user_id integer NOT NULL,
    role_id integer NOT NULL
);


ALTER TABLE public.user_role OWNER TO root;

--
-- Name: organization id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.organization ALTER COLUMN id SET DEFAULT nextval('public.organization_id_seq'::regclass);


--
-- Name: role id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.role ALTER COLUMN id SET DEFAULT nextval('public.role_id_seq'::regclass);


--
-- Name: state id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.state ALTER COLUMN id SET DEFAULT nextval('public.state_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: user_address id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_address ALTER COLUMN id SET DEFAULT nextval('public.user_address_id_seq'::regclass);


--
-- Name: user_phone id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_phone ALTER COLUMN id SET DEFAULT nextval('public.user_phone_id_seq'::regclass);


--
-- Data for Name: organization; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.organization (id, name, description, address_line_1, address_line_2, city, postal_code, created, created_by, modified, modified_by, state_id) FROM stdin;
\.


--
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.role (id, name) FROM stdin;
\.


--
-- Data for Name: state; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.state (id, name, abbreviation, country, state_type, assoc_press, standard_federal_region, census_region, census_region_name, census_division, census_division_name, circuit_court, created) FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public."user" (id, email, password, first_name, last_name, verified, deleted, created, created_by, modified, modified_by) FROM stdin;
\.


--
-- Data for Name: user_address; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.user_address (id, address_line_1, address_line_2, city, postal_code, is_primary, is_active, created, created_by, modified, modified_by, user_id, state_id) FROM stdin;
\.


--
-- Data for Name: user_phone; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.user_phone (id, type, number, is_primary, is_active, can_text, created, created_by, modified, modified_by, deleted, user_id) FROM stdin;
\.


--
-- Data for Name: user_role; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.user_role (user_id, role_id) FROM stdin;
\.


--
-- Name: organization_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.organization_id_seq', 1, false);


--
-- Name: role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.role_id_seq', 1, false);


--
-- Name: state_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.state_id_seq', 1, false);


--
-- Name: user_address_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.user_address_id_seq', 1, false);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.user_id_seq', 1, false);


--
-- Name: user_phone_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.user_phone_id_seq', 1, false);


--
-- Name: organization organization__id__pk; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT organization__id__pk PRIMARY KEY (id);


--
-- Name: role role__id__pk; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role__id__pk PRIMARY KEY (id);


--
-- Name: state state__id__pk; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.state
    ADD CONSTRAINT state__id__pk PRIMARY KEY (id);


--
-- Name: user user__email__uq; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user__email__uq UNIQUE (email);


--
-- Name: user user__id__pk; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user__id__pk PRIMARY KEY (id);


--
-- Name: user_address user_address__id__pk; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_address
    ADD CONSTRAINT user_address__id__pk PRIMARY KEY (id);


--
-- Name: user_phone user_phone__id__pk; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_phone
    ADD CONSTRAINT user_phone__id__pk PRIMARY KEY (id);


--
-- Name: user_role user_role__role_id__user_id__pk; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role__role_id__user_id__pk PRIMARY KEY (user_id, role_id);


--
-- Name: organization organization__state_id__fk; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT organization__state_id__fk FOREIGN KEY (state_id) REFERENCES public.state(id);


--
-- Name: user_address user_address__state_id__fk; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_address
    ADD CONSTRAINT user_address__state_id__fk FOREIGN KEY (state_id) REFERENCES public.state(id);


--
-- Name: user_address user_address__user_id__fk; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_address
    ADD CONSTRAINT user_address__user_id__fk FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: user_phone user_phone__user_id__fk; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_phone
    ADD CONSTRAINT user_phone__user_id__fk FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: user_role user_role__role_id__fk; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role__role_id__fk FOREIGN KEY (role_id) REFERENCES public.role(id) ON DELETE CASCADE;


--
-- Name: user_role user_role__user_id__fk; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role__user_id__fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

