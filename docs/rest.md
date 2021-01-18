# Rest API Design

A rough outline of the REST API using the [DDD document](ddd.md) as a
reference (see
[Full Stack Dev](https://gi60s.github.io/full-stack-dev/fundamentals/rest/)
for more details).

### Accounts

| Method | Path                   | Description             |
|:-------|:-----------------------|:------------------------|
| POST   | `/accounts`            | create an account       |
| PUT    | `/accounts/:accountId` | update account settings |
| DELETE | `/accounts/:accountId` | deactivate account      |

### Account Auxiliary

| Method | Path         | Description    |
|:-------|:-------------|:---------------|
| POST   | `/sessions`  | login          |
| POST   | `/passwords` | reset password |

:grey_question: How to accomplish RESTful password reset?

### Access Tokens

| Method | Path                                   | Description           |
|:-------|:---------------------------------------|:----------------------|
| POST   | `/accounts/:accountId/tokens`          | generate access token |
| GET    | `/accounts/:accountId/tokens`          | list access tokens    |
| DELETE | `/accounts/:accountId/tokens/:tokenId` | revoke access token   |

### Documents

| Method | Path                                                    | Description           |
|:-------|:--------------------------------------------------------|:----------------------|
| POST   | `/documents`                                            | upload new document   |
| GET    | `/documents`                                            | list documents        |
| GET    | `/documents/:documentId/versions`                       | list document history |
| GET    | `/documents/:documentId/versions/:version`              | get document          |
| GET    | `/documents/:documentId/versions/:version/dependencies` | list dependencies     |

### Document Settings

| Method | Path                                | Description              |
|:-------|:------------------------------------|:-------------------------|
| PUT    | `/documents/:documentId/attributes` | update document settings |
| GET    | `/documents/:documentId/attributes` | get document settings    |

### Document Maintainers

| Method | Path                                               | Description                   |
|:-------|:---------------------------------------------------|:------------------------------|
| POST   | `/documents/:documentId/maintainers`               | invite maintainer             |
| GET    | `/documents/:documentId/maintainers`               | list maintainers              |
| PUT    | `/documents/:documentId/maintainers/:maintainerId` | acknowledge maintainer invite |
| DELETE | `/documents/:documentId/maintainers/:maintainerId` | remove maintainer             |

## Additional Reference

Idempotent operations are those that can be called more than once with
the same inputs without having any additional side effects beyond what
happened with the first call.

| HTTP Method | Meaning / Usage                                                 | Idempotent | Body |
|:------------|:----------------------------------------------------------------|:-----------|:-----|
| GET         | Retrieve the resource or resource collection.                   | Yes        | No   |
| POST        | Create a new resource or resource collection.                   | No         | Yes  |
| PUT         | Put a resource or resource collection into the specified state. | Yes        | Yes  |
| DELETE      | Delete a resource or resource collection.                       | Yes        | No   |

