CREATE MIGRATION m1lmlhuo7keartrifflceewdegeead2agphnz6snrghgr6lxiqh55a
    ONTO m1yrukhuq3r5xmibaegvufwxx7mxrogiqafr225cpybyot6ascjxlq
{
  ALTER TYPE default::User {
      CREATE MULTI LINK periods: default::Period;
      CREATE MULTI LINK timeslots: default::Timeslot;
  };
};
