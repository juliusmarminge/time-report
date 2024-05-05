CREATE MIGRATION m1jrvf4rcnd2zgruf4c7iaupygsciduajgaqhpk4wbj2pveemeopzq
    ONTO m1xlxkwowwxkhy5updpqi4myt55jnjcrpt7jv34gkvvqw5adt6wi2a
{
  ALTER TYPE default::User {
      ALTER PROPERTY defaultCurrency {
          SET TYPE default::Currency;
      };
  };
};
