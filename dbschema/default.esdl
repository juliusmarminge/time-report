using extension edgeql_http;

module default {
    type User {
        name: str;
        required email: str {
            constraint exclusive;
        }
        emailVerified: datetime;
        image:str;
        required defaultCurrency: str {
            default := "USD";
        }

        multi accounts := .<user[is Account];
        multi sessions := .<user[is Session];
        multi authenticators := .<user[is Authenticators];

        createdAt: datetime {
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

        createdAt: datetime {
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

        createdAt: datetime {
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
    }
}
