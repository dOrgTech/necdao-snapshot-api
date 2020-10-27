create table period (
  id bigserial not null,
  nec_to_distribute bigint,
  primary key(id)
);
create table week (
  id bigserial not null,
  nec_to_distribute bigint,
  snapshot_date timestamp with time zone,
  publish_date timestamp with time zone,
  unlock_date timestamp with time zone,
  contract_address varchar,
  closed boolean,
  fk_period_id bigint,
  constraint fk_week_period foreign key(fk_period_id) references period(id),
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  primary key(id)
);
create table multiplier_group (
  id bigserial not null,
  date_created timestamp with time zone,
  primary key(id)
);
create table multipliers (
  id bigserial not null,
  lower_limit numeric not null,
  multiplier numeric not null,
  fk_multiplier_group bigint,
  constraint fk_multiplier foreign key(fk_multiplier_group) references multiplier_group(id),
  primary key(id)
);
create table reward (
  fk_week_id bigint,
  id bigserial not null,
  primary key(id),
  address varchar,
  bpt_balance numeric,
  nec_earned numeric,
  trading_volume numeric,
  fk_multipliers_id bigint,
  constraint fk_reward_week foreign key(fk_week_id) references week(id),
  constraint fk_reward_multiplier foreign key(fk_multipliers_id) references multipliers(id)
);
create table users (
  id bigserial not null,
  email varchar,
  password varchar
);
insert into users (email, password)
values (
    'admin',
    '$2b$10$wl2dXkpX9jjykpfgT4kGbOVtL6/WExLsZ/q9IxapmPClT4UZbjU9.'
  );