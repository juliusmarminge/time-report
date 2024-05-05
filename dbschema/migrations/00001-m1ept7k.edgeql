CREATE MIGRATION m1ept7kdfdpnpmeoggdey2wbo3qa3dig2afjhtru2ihpvihmdeolpa
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
      CREATE PROPERTY createdAt: std::datetime {
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
      CREATE PROPERTY createdAt: std::datetime {
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
  ALTER TYPE default::User {
      CREATE MULTI LINK accounts := (.<user[IS default::Account]);
  };
  CREATE TYPE default::Authenticators {
      CREATE REQUIRED LINK user: default::User {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY userId := (.user.id);
      CREATE REQUIRED PROPERTY counter: std::int64;
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
      CREATE MULTI LINK authenticators := (.<user[IS default::Authenticators]);
  };
  CREATE TYPE default::Session {
      CREATE REQUIRED LINK user: default::User {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY userId := (.user.id);
      CREATE PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY expires: std::datetime;
      CREATE REQUIRED PROPERTY sessionToken: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK sessions := (.<user[IS default::Session]);
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
