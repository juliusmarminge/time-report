CREATE MIGRATION m1k7e2gcvbnwtv3jmrt33e3hijk5mwmpzod4xa26bmxistwncjgd5q
    ONTO m1jrvf4rcnd2zgruf4c7iaupygsciduajgaqhpk4wbj2pveemeopzq
{
  ALTER TYPE default::Client {
      DROP PROPERTY appId;
  };
  ALTER TYPE default::Period {
      DROP PROPERTY appId;
  };
  ALTER TYPE default::Timeslot {
      DROP PROPERTY appId;
  };
};
