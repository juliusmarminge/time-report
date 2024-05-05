CREATE MIGRATION m1xlxkwowwxkhy5updpqi4myt55jnjcrpt7jv34gkvvqw5adt6wi2a
    ONTO m1lmlhuo7keartrifflceewdegeead2agphnz6snrghgr6lxiqh55a
{
  ALTER TYPE default::Client {
      ALTER LINK periods {
          USING (.<client[IS default::Period]);
      };
      ALTER LINK timeslots {
          USING (.<client[IS default::Timeslot]);
      };
  };
  ALTER TYPE default::Period {
      ALTER LINK timeslots {
          USING (.<period[IS default::Timeslot]);
      };
  };
  ALTER TYPE default::User {
      ALTER LINK accounts {
          USING (.<user[IS default::Account]);
      };
      ALTER LINK authenticators {
          USING (.<user[IS default::Authenticators]);
      };
      ALTER LINK periods {
          USING (.<tenant[IS default::Period]);
      };
      ALTER LINK sessions {
          USING (.<user[IS default::Session]);
      };
      ALTER LINK timeslots {
          USING (.<tenant[IS default::Timeslot]);
      };
  };
};
