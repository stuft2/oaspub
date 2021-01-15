# Domain Driven Design
A formal document that details the events, commands, entities, and value-objects that make up this domain (see [Full 
Stack Dev](https://gi60s.github.io/full-stack-dev/fundamentals/domain-driven-design/) for more details).

## Domain events

- account created
- account updated
- account deactivated


- account password reset initiated
- account password reset acknowledged


- session created (logged in)
- session deleted (logged out)


- document uploaded
- document deprecated


- document settings updated


- document maintainer invited
- document maintainer invite acknowledged
- document maintainer role updated
- document maintainer removed


## Domain commands

- create an account
- update account settings
- deactivate account


- reset password
- acknowledge password reset


- login
- logout


- upload new document
- deprecate document


- update document settings


- invite maintainer
- acknowledge maintainer invite
- change maintainer role
- remove maintainer


## Entities

> Account
> 
> Considered an entity because each account must be uniquely identified, and may be updated over time.

## Value Objects

> Session
> 
> Considered a Value Object because a session can only be created and destroyed. It can also be identified by its 
> unique and simple structure.

> Document
> 
> Considered a Value Object because a document cannot be updated. Each document is uniquely identified by the name 
> and version. Thus, "updating" a document must always create a new document.
