using extension edgeql_http;

module default {
    scalar type BillingPeriod extending enum<weekly, biweekly, monthly>;
    scalar type Currency extending enum<USD, EUR, GBP, SEK>;
    scalar type PeriodStatus extending enum<open, closed>;

    type Client {
        required name: str;
        image: str;
        required defaultCharge: int64;
        required defaultBillingPeriod: BillingPeriod {
            default := "monthly";
        }
        required currency: Currency;
        required tenantId := .tenant.id;
        required tenant: User {
            on target delete delete source;
        }
        required createdAt: datetime {
            default := datetime_current();
        }

        multi periods := .<client[is Period];
        multi timeslots := .<client[is Timeslot];
    }

    type Timeslot {
        required clientId := .client.id;
        required tenantId := .tenant.id;
        required periodId := .period.id;
        required date: cal::local_date;
        required duration: decimal;
        description: str;
        required chargeRate: int32;
        required currency: Currency;
        
        required client: Client {
            on target delete delete source;
        }
        required tenant: User {
            on target delete delete source;
        }
        required period: Period {
            on target delete delete source;
        }

        required createdAt: datetime {
            default := datetime_current();
        }
    }

    type Period {
        required clientId := .client.id;
        required tenantId := .tenant.id;
        required startDate: cal::local_date;
        required endDate: cal::local_date;
        closedAt: datetime;
        required status: PeriodStatus {
            default := "open";
        }

        required client: Client {
            on target delete delete source;
        }
        required tenant: User {
            on target delete delete source;
        }

        required createdAt: datetime {
            default := datetime_current();
        }

        multi timeslots := .<period[is Timeslot];
    }

    type User {
        name: str;
        required email: str {
            constraint exclusive;
        }
        emailVerified: datetime;
        image: str;
        required defaultCurrency: Currency {
            default := "USD";
        }

        multi periods := .<tenant[is Period];
        multi timeslots := .<tenant[is Timeslot];
        multi accounts := .<user[is Account];
        multi sessions := .<user[is Session];
        multi authenticators := .<user[is Authenticators];

        required createdAt: datetime {
            default := datetime_current();
        }
    }
 
    type Account {
        required userId := .user.id;
        required type: str;
        required provider: str;
        required providerAccountId: str {
            constraint exclusive;
        }
        refresh_token: str;
        access_token: str;
        expires_at: int64;
        token_type: str;
        scope: str;
        id_token: str;
        session_state: str;

        required user: User {
            on target delete delete source;
        };

        required createdAt: datetime {
            default := datetime_current();
        }
 
       constraint exclusive on ((.provider, .providerAccountId))
    }

    type Session {
        required sessionToken: str {
            constraint exclusive;
        }
        required userId := .user.id;
        required expires: datetime;

        required user: User {
            on target delete delete source;
        };

        required createdAt: datetime {
            default := datetime_current();
        }
    }

    type VerificationToken {
        required identifier: str;
        required token: str {
            constraint exclusive;
        }
        required expires: datetime;

        required createdAt: datetime {
            default := datetime_current();
        }

        constraint exclusive on ((.identifier, .token))
    }

    type Authenticators {
        required credentialID: str {
            constraint exclusive;
        }
        required userId := .user.id;
        required providerAccountId: str;
        required credentialPublicKey: str;
        required counter: int64;
        required credentialDeviceType: str;
        required credentialBackedUp: bool;
        transports: str;

        required user: User {
            on target delete delete source;
        }

        required createdAt: datetime {
            default := datetime_current();
        }
    }
}
