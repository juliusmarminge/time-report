CREATE MIGRATION m15msdfzf2tewn5rq4ialqpld3thypov5lf6iyaffqcw73ghulanga
    ONTO m1k7e2gcvbnwtv3jmrt33e3hijk5mwmpzod4xa26bmxistwncjgd5q
{
  ALTER TYPE default::Period {
      ALTER PROPERTY endDate {
          SET TYPE cal::local_date USING (cal::to_local_date(.endDate, 'UTC'));
      };
      ALTER PROPERTY startDate {
          SET TYPE cal::local_date USING (cal::to_local_date(.startDate, 'UTC'));
      };
  };
  ALTER TYPE default::Timeslot {
      ALTER PROPERTY date {
          SET TYPE cal::local_date USING (cal::to_local_date(.date, 'UTC'));
      };
  };
};
