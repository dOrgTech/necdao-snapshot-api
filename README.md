# necdao-snapshot-api

1. Log into psql and create a Postgres database:

```
sudo -u postgres psql
create database necdao;
\c necdao;
```

2. Run the following scripts in psql after connecting to the PostgresSQL database:

create table period (id bigserial not null, nec_to_distribute bigint, primary key(id));

create table week (id bigserial not null, nec_to_distribute bigint, snapshot_date timestamp with time zone, publish_date timestamp with time zone, unlock_date timestamp with time zone, contract_address varchar, closed boolean, fk_period_id bigint, constraint fk_week_period foreign key(fk_period_id) references period(id), start_date timestamp with time zone, end_date timestamp with time zone, primary key(id));

create table reward (fk_week_id bigint, id bigserial not null, primary key(id), address varchar, bpt_balance numeric, nec_earned numeric, constraint fk_reward_week foreign key(fk_week_id) references week(id));

create table users (id bigserial not null, email varchar, password varchar);
insert into users (email, password) values ('admin', '$2y$10$cGRHNMDjWQI8SQMeOgsCcelDQySVa0JN8DG3WIbrUkvUMPk7e1lye');

create user admin with password 'password';
grant all privileges on database necdao to admin;
grant all privileges on table period to admin;
grant all privileges on table week to admin;
grant all privileges on table reward to admin;
grant all privileges on table users to admin;

This will create all appropriate tables and columns and will seed the users table with an admin account (email: 'admin', password: 'password')

2. Create a .env file with the following:

BALANCER_SUBGRAPH_API=https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-beta
DATABASE_URL= -- url of the deployed postgres database --
SECRET_KEY=secret
PRIVATE_KEY= -- Private key of the wallet that has gas for contract deployment --
INFURA_API_KEY= -- infura api key --
DEVELOPMENT=true

3. Run the following:

```
yarn install
yarn start
```
