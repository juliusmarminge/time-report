CREATE MIGRATION m1jfoc6bosvbnsif42a5hn3hx3kkg53puldriptpxdhn6i5p4fcxeq
    ONTO initial
{
  CREATE EXTENSION edgeql_http VERSION '1.0';
  CREATE TYPE default::Account {
      CREATE REQUIRED PROPERTY provider: std::str;
      CREATE REQUIRED PROPERTY providerAccountId: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE CONSTRAINT std::exclusive ON ((.provider, .providerAccountId));
      CREATE PROPERTY access_token: std::str;
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE PROPERTY expires_at: std::int64;
      CREATE PROPERTY id_token: std::str;
      CREATE PROPERTY refresh_token: std::str;
      CREATE PROPERTY scope: std::str;
      CREATE PROPERTY session_state: std::str;
      CREATE PROPERTY token_type: std::str;
      CREATE REQUIRED PROPERTY type: std::str;
  };
  CREATE TYPE default::User {
      CREATE MULTI LINK accounts: default::Account;
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY defaultCurrency: std::str {
          SET default := 'USD';
      };
      CREATE REQUIRED PROPERTY email: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY emailVerified: std::datetime;
      CREATE PROPERTY image: std::str;
      CREATE PROPERTY name: std::str;
  };
  ALTER TYPE default::Account {
      CREATE REQUIRED LINK user: default::User {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY userId := (.user.id);
  };
  CREATE TYPE default::Authenticators {
      CREATE REQUIRED LINK user: default::User {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY userId := (.user.id);
      CREATE REQUIRED PROPERTY counter: std::int64;
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY credentialBackedUp: std::bool;
      CREATE REQUIRED PROPERTY credentialDeviceType: std::str;
      CREATE REQUIRED PROPERTY credentialID: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY credentialPublicKey: std::str;
      CREATE REQUIRED PROPERTY providerAccountId: std::str;
      CREATE PROPERTY transports: std::str;
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK authenticators: default::Authenticators;
  };
  CREATE SCALAR TYPE default::BillingPeriod EXTENDING enum<weekly, biweekly, monthly>;
  CREATE SCALAR TYPE default::Currency EXTENDING enum<USD, EUR, GBP, SEK>;
  CREATE TYPE default::Client {
      CREATE REQUIRED LINK tenant: default::User {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY tenantId := (.tenant.id);
      CREATE REQUIRED PROPERTY appId: std::int64;
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY currency: default::Currency;
      CREATE REQUIRED PROPERTY defaultBillingPeriod: default::BillingPeriod {
          SET default := 'monthly';
      };
      CREATE REQUIRED PROPERTY defaultCharge: std::int64;
      CREATE REQUIRED PROPERTY image: std::str;
      CREATE REQUIRED PROPERTY name: std::str;
  };
  CREATE SCALAR TYPE default::PeriodStatus EXTENDING enum<open, closed>;
  CREATE TYPE default::Period {
      CREATE REQUIRED LINK client: default::Client {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY clientId := (.client.id);
      CREATE REQUIRED LINK tenant: default::User {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY tenantId := (.tenant.id);
      CREATE REQUIRED PROPERTY appId: std::int64;
      CREATE PROPERTY closedAt: std::datetime;
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY endDate: std::datetime;
      CREATE REQUIRED PROPERTY startDate: std::datetime;
      CREATE REQUIRED PROPERTY status: default::PeriodStatus {
          SET default := 'open';
      };
  };
  ALTER TYPE default::Client {
      CREATE MULTI LINK periods: default::Period;
  };
  CREATE TYPE default::Timeslot {
      CREATE REQUIRED LINK client: default::Client {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY clientId := (.client.id);
      CREATE REQUIRED LINK period: default::Period {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY periodId := (.period.id);
      CREATE REQUIRED LINK tenant: default::User {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY tenantId := (.tenant.id);
      CREATE REQUIRED PROPERTY appId: std::int64;
      CREATE REQUIRED PROPERTY chargeRate: std::int32;
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY currency: default::Currency;
      CREATE REQUIRED PROPERTY date: std::datetime;
      CREATE PROPERTY description: std::str;
      CREATE REQUIRED PROPERTY duration: std::decimal;
  };
  ALTER TYPE default::Client {
      CREATE MULTI LINK timeslots: default::Timeslot;
  };
  ALTER TYPE default::Period {
      CREATE MULTI LINK timeslots: default::Timeslot;
  };
  CREATE TYPE default::Session {
      CREATE REQUIRED LINK user: default::User {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY userId := (.user.id);
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY expires: std::datetime;
      CREATE REQUIRED PROPERTY sessionToken: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK sessions: default::Session;
  };
  CREATE TYPE default::VerificationToken {
      CREATE REQUIRED PROPERTY identifier: std::str;
      CREATE REQUIRED PROPERTY token: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE CONSTRAINT std::exclusive ON ((.identifier, .token));
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY expires: std::datetime;
  };
};
