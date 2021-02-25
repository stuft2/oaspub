# OpenAPI Specification Publisher API

A web server that validates and manages OAS documents and provides a
historical lookup of schemas.

### Dependencies
* NodeJS >=15
* NPM >= 7.x.x
* Docker
* (optional) Docker Compose

### Setup

#### Using Docker Compose:
This method is recommended for running integration tests.

1. Install dependencies: `npm install`
3. If present, remove previous versions of the dist folder: `npm run clean`
4. Build distribution files: `npm run build`
5. Start Container: `docker-compose up ./packages/api/docker-compose.yml`

#### Using Host OS:
This method is recommended for debugging the application and development.

1. Install dependencies: `npm install`
2. Ensure local mongo instance is running
3. Start dev server: `npm run dev`

The following environment variables are used to configure the web
server:

| Variable Name     | Default | Description                                                                                                                                                                                          |
|:------------------|:--------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| *DB_USERNAME      |         | The username to authenticate with the mongo database.                                                                                                                                                |
| *DB_PASSWORD      |         | The password to authenticate with the mongo database.                                                                                                                                                |
| *DB_DATABASE_NAME |         | The name of the database to store collections.                                                                                                                                                       |
| *DB_ADDRESS       |         | The database host to connect with.                                                                                                                                                                   |
| *DB_PORT          |         | The database port to connect with.                                                                                                                                                                   |
| PORT              | 8080    | The port the server listens from. Defaults to port 8080.                                                                                                                                             |
| *HOST             |         | The host address where the server is located. It must be a valid URL as defined by the native NodeJS URL module.                                                                                     |
| DEBUG             |         | Used to control the level of logging. To enable all server logging, use `api*`. A more detailed explanation can be found on the [debug package readme](https://github.com/visionmedia/debug#readme). |

> \* = Required

### Development

The server can be tested, linted, built, and started by invoking the
various npm scripts.

> Note: Request validation is based on the OpenAPI document in conjunction with
the OpenAPI Enforcer.

| Script                   | Description                                                                                                                                                                                                                              |
|:-------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| build                    | Compile the source code into ECMAScript. Output files are located in the dist folder, which is generated when this command is run.                                                                                                       |
| clean                    | Removes the dist folder so that the output can be built from scratch.                                                                                                                                                                    |
| coverage                 | Runs the test script with code coverage reporting using Istanbul (nyc).                                                                                                                                                                  |
| dev                      | Starts a server that uses the `src` folder as the code base instead of the dist folder. Environment variables located in the `.env` (dotenv) file will are loaded using the dotenv module.                                               |
| lint                     | Reports code style errors. Most errors can be fixed by passing in the `--fix` flag (i.e. `npm run lint -- --fix`).                                                                                                                       |
| start                    | Starts the server in production mode. It runs the javascript files located in the dist folder.                                                                                                                                           |
| test                     | Runs the unit tests.                                                                                                                                                                                                                     |
| test:integration:account | This script is temporary. There needs to be a "test:integration" script that starts the server, runs all the postman collections, and then stops the server. For now, start the server using docker-compose and then invoke this script. |

### Maintenance Considerations

- Update the OpenAPI Enforcer when the rewrite into TypeScript is
  complete.

- Update the OpenAPI document to take advantage of the new features
  offered in
  [v3.1.0 of the OpenAPI Specification](https://github.com/OAI/OpenAPI-Specification/pull/2462)
  . This change depends on the OpenAPI Enforcer supporting version 3.1.0.
