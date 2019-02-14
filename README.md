# GraphQL & Prisma Micro Service Template 

## Installation & Configuration

This application/solution is built to be run in 2 different environments (Development / Production)
The `development` flag will enable debugging for the Prisma API which outputs all requests and responses to console.  It will also enable the graphQL playground and introspection for your micro service.  It is best practice to disable these features in a production environment and as such they are disabled with the `production` flag.  These flags can be set either on the command line or in docker-compose.

### Secrets Configuration

To configure this application there are 2 files that require modification.

1. `./src/config.js`

    This file contains the majority of the variables that define the difference between your production, development, and test environments that are not secrets.

2. `./.env`

    This file contains the secrets required for the application and can be set eitehr through ENV variables or through this file.
* `MQ_USER` = Username for RabbitMQ instance set in `./src/config.js`
* `MQ_PASS` = Password for RabbitMQ instance
* `CLIENT_ID` = The client_ID from the client created in Concierge for this micro service
* `CLIENT_SECRET` = The client secret for the Client ID listed above.

### Development

To setup this application in development run the following commands:

* `sudo docker-compose -f docker-compose-dev.yml up`
* `sudo npm install`
* `npm start dev`

The profile as a service playground endpoint can now be reached at http://localhost:4000/playground and the graphql endpoint at http://localhost:4000/graphql
The prisma service can be reached at http://localhost:4466/profile

### Production

To setup this application for production:

* `osudo docker-compose up --build -d`

The profile as a service playground endpoint can now be reached at http://localhost:4000/playground and the graphql endpoint at http://localhost:4000/graphql

## Micro Service Components

This micro service template is comprised of the following different components:

* Authorization schema directives
* Prisma API
* RabbitMQ connector
* GraphQL schema and resolvers

The micro service template modules provide for the ability to validate an OpenID access token against an OpenID provider's introspection endpoint,  actively listen and publish to a RabbitMQ messaging queue for event driven triggers, and apply authorization on incoming queries and mutations.

### Prisma API 

This micro services relies on a Prisma API as a back end to house and store data.  Why Prisma instead of a traditional ORM (Object-relational mapping)?   

1. High-performance **query engine** that runs on the Prisma server and generates actual database queries
2. A **realtime event system** that lets you subscribe to database events
3. **Type safe database access** thanks to the custom and auto-generated Prisma client.
4. Simple and powerful API for working with **relational data and transactions**.

#### Getting Started

* Modify the `{project root}/prisma/datamodel.graphql	` to declare your services data model
* This model will be pushed to the Prisma server when launching both the `development` and `production` docker environments.  Upon successful completion a generated API schema file will be copied to  `{project root}/src/generated/prisma.graphql`

### GraphQL Schema and Resolvers

This is the heart of your micro service.  This section extends the data model that was created for the Prisma API and implements the various queries, resolvers, and authorization directives required to fetch the data from the Prisma API.

#### Getting Started

* Define your extended data model in `{project root}/src/schema.graphql`
  * Any models that need to be reused can be imported in their entirety by importing them from the generated Prisma file `# import Address from './generated/prisma.graphql'`.  Only import types where you want to expose all existing fields from the type through your micro service.  
  * Type Query
    * Holds all your queries.  Ex. `type Query {profiles(id: ID, name: String): [Profile!]!, addresses(id: ID, streetAddress:String):[Address!]!}`
  * Type Mutation
    * Holds all your mutations Ex. `type Mutation {createProfile(name: String!, email: String!):Profile!, modifyProfile(id: ID!, data:ModifyProfileInput):Profile!}`
  * Custom object and input types
    * These objects extend your Prisma object definitions.  Essentially they mimic the same data model but provide the ability to hide fields that should never be visible outside of your micro service.
    * Input types enable the ability to accept data for your Mutations types.
* Define your Queries in `{project root}/src/resolvers/Query.js`
  * 

#### Resources

* https://graphql.org/learn/schema/
* https://www.apollographql.com/docs/graphql-tools/generate-schema.html
* https://www.apollographql.com/docs/graphql-tools/resolvers.html
* https://www.howtographql.com/graphql-js/0-introduction/

### RabbitMQ connector

