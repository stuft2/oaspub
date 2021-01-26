<img align="right" src=media/logo.png height="150px">

# [OpenAPI Specification](https://github.com/OAI/OpenAPI-Specification/) Manager

### Problem

Developers lack the ability to easily store and recall a specific
version of a JSON schema within an OAS document. Oftentimes, the version
field found in the
[Info Object](https://swagger.io/specification/#info-object) goes
ignored and unchanged. Another related problem is that
[Reference Objects](https://swagger.io/specification/#reference-object)
are underused. OAS is perfect for complex REST API systems in enterprise
scenarios but the missing link that would make it even more widely used
is version management and recall of the JSON schemas found in an OAS
document.

### Objective

Fulfill the need for semantic versioning of OAS documents and rapid
recall of specific versions of a JSON schema found in an OAS document.

### Packages

1. A web server that validates and manages OAS documents and provides a
   historical lookup of schemas.
2. A frontend portal for discovering and visualizing OAS documents and
   their change history.

### Contributions

No contributions to this project will be allowed until after the v1
milestone.

### Future Considerations

I'm considering building a NodeJS client and CLI interface to facilitate
the use of this product in CI/CD environments. However, this enhancement
will likely fall outside of the v1 deadline (if at all).


## Appendix

1. [Domain Driven Design Document](packages/api/docs/ddd.md)
2. [REST API Design Document](packages/api/docs/rest.md)
