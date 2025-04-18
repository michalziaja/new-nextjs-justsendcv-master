SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: key; Type: TABLE DATA; Schema: pgsodium; Owner: supabase_admin
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("user_id", "created_at", "first_name", "last_name", "birth_date", "email", "avatar", "about_me", "city", "social_links", "calendar_note", "subscription", "goal", "checklist") VALUES
	('user_2tcewVp8cm02yLwKedGSmJcbtcq', '2025-02-27 11:33:49.261+00', 'Micha┼é', 'Ziaja', NULL, 'michalziaja88@gmail.com', 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ydGNld1VPWElkaGtBWmR1czJFTVpaZ0RxQXcifQ', NULL, NULL, NULL, NULL, false, NULL, NULL),
	('user_2tchPFEaj81Br2S3wq8JMLXRdVq', '2025-02-27 11:54:03.171+00', 'Micha┼é', 'Nowacki', NULL, 'technature699@gmail.com', 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ydGNoUEVGcm1SQzNMMFZ1WGlYcGNhQVJkOVQifQ', NULL, NULL, NULL, NULL, false, NULL, NULL),
	('user_2tdHmvvcuRRdWsdfxW3QrJzAMMa', '2025-02-27 16:53:12.938+00', 'Micha┼é', 'Z.', NULL, 'mzfconsulting@gmail.com', 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ydGRIbXVvVFVQTmd0cmdIUUNKWmRzdlVaY1QifQ', NULL, NULL, NULL, NULL, false, NULL, NULL);


--
-- Data for Name: job_offers; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."subscriptions" ("id", "user_id", "plan", "status", "start_date", "end_date", "stripe_subscription_id", "current_offers", "total_offers", "current_limit", "total_limit", "cv_creator_limit", "cv_creator_used", "created_at", "updated_at") VALUES
	('d7c99938-d97a-41f9-b002-90fe4ac481fd', 'user_2tcewVp8cm02yLwKedGSmJcbtcq', 'premium', 'active', '2025-02-27 19:14:14+00', '2025-02-28 19:14:14+00', 'sub_1QxCXCEIpSl1xTDJljOdCCNl', 0, 0, NULL, NULL, 50, 0, '2025-02-27 19:10:13.571+00', '2025-02-27 19:14:19.64644+00'),
	('aa3fee00-1b84-4f70-b85f-573bd0738b89', 'user_2tchPFEaj81Br2S3wq8JMLXRdVq', 'free', 'active', '2025-02-27 19:24:14.899+00', NULL, NULL, 0, 0, 10, 20, 3, 0, '2025-02-27 19:24:14.899+00', '2025-02-27 19:24:14.899+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: key_key_id_seq; Type: SEQUENCE SET; Schema: pgsodium; Owner: supabase_admin
--

SELECT pg_catalog.setval('"pgsodium"."key_key_id_seq"', 66, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
