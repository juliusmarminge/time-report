CREATE MIGRATION m1yrukhuq3r5xmibaegvufwxx7mxrogiqafr225cpybyot6ascjxlq
    ONTO m1jfoc6bosvbnsif42a5hn3hx3kkg53puldriptpxdhn6i5p4fcxeq
{
  ALTER TYPE default::Client {
      ALTER PROPERTY image {
          RESET OPTIONALITY;
      };
  };
};
