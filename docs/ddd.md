# Domain Driven Design

A formal document that defines the entities and value-objects -- their
properties, events, commands, and queries -- that make up this domain
(see
[Full Stack Dev](https://gi60s.github.io/full-stack-dev/fundamentals/domain-driven-design/)
for more details).

### Account

Considered an **entity** because each account must be uniquely
identified, and may be updated over time.

##### Properties

| Property  | Type   | Description                                                                                                                |
|:----------|:-------|:---------------------------------------------------------------------------------------------------------------------------|
| id        | string | A private and unique identifier for referencing account information.                                                       |
| email     | string | An email address can be used to uniquely identify an account, but is modifiable. Can be no longer than 64 characters.      |
| password  | string | A password must be between 8-32 characters long and contain upper and lower case letters, numbers, and special characters. |
| surname   | string | Can be no longer than 32 characters.                                                                                       |
| givenName | string | Can be no longer than 64 characters.                                                                                       |

##### Events

- account created
- account updated
- account deactivated

- account password reset initiated
- account password reset acknowledged

##### Commands

- create an account
- update account settings
- deactivate account

- reset password
- acknowledge password reset

- login
- logout

##### Queries

- get account information

### Access Token

Considered a **value object** because it can only be created and
removed. It is identified by a user and a public id.

##### Properties

| Property    | Type   | Description                                                          |
|:------------|:-------|:---------------------------------------------------------------------|
| id          | string | A public, unique identifier for each access token.                   |
| description | string | A description for the access token.                                  |
| token       | string | A secret key that is used to interact with the api programmatically. |
| lastUsed    | Object | A JSON object: ```{ location: String, datetime: Date }```            |

##### Events

- access token generated
- access token revoked

##### Commands

- generate access token
- revoke access token

##### Queries

- list access tokens in use

### Document

Considered a **value object** because a document cannot be updated. Each
document is uniquely identified by the name and version. Thus,
"updating" a document must always create a new document.

##### Properties

The properties of a document are found on the
[Swagger Website](https://swagger.io/specification/). The database will
support [v2 of the specification](https://swagger.io/specification/v2/).

A unique constraint will be enforced on the name and version of the
document.

##### Events

- document uploaded
- document deprecated

##### Commands

- upload new document
- deprecate document

##### Queries

- download document
- download document chunk
- get document dependencies

### Document Settings

Considered an **entity** because it may be accessed by the name of the
document and all other fields are modifiable.

##### Properties

| Property      | Type    | Description                                                                             |
|:--------------|:--------|:----------------------------------------------------------------------------------------|
| documentTitle | string  | A reference to the document.info.title property.                                        |
| public        | boolean | Determines the visibility of the document (public = 1, private = 0).                    |
| mockEnabled   | boolean | Allows the web server to return mock responses according to the document specification. |

##### Events

- document settings created
- document settings updated

##### Commands

- create new document settings
- update document settings

##### Queries

- get document settings

### Document Maintainer

Considered a **value object** because adding a maintainer sends an
invitation with a specific role. That role should not be changed
dynamically without consent from both parties. Thus, to change the
maintainer role, they must be re-invited with the new role.

##### Properties

| Property      | Type   | Description                                                                                                                                                                                                                                                      |
|:--------------|:-------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| documentTitle | string | A reference to the document.info.title property.                                                                                                                                                                                                                 |
| maintainerId  | string | A reference to the maintainer's account id.                                                                                                                                                                                                                      |
| role          | string | Should be one of the following values: *admin*, *write*, *read*. If the document is public, then all visitors are granted read access to the document. Those with write access can update the document. Admins can change the document settings and maintainers. |

##### Events

- document maintainer invited
- document maintainer invite acknowledged
- document maintainer role updated
- document maintainer removed

##### Commands

- invite maintainer
- acknowledge maintainer invite
- change maintainer role
- remove maintainer

##### Queries

- list document maintainers

