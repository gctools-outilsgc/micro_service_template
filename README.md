# GraphQL & Prisma Micro Service Template 

## Solution Architecture

This micro service template fits into a solution architecture that has an OpenID Connect provider and a Messaging Queue.  In the Open Accessible Digital Workspace (OADW) solution architecture these requirements are filled by using [Concierge](https://github.com/gctools-outilsgc/concierge) (GCaccount) and [RabbitMQ](https://www.rabbitmq.com/).  This template is used to create the various micro services within this architecture like the Profile as a Service, Collaboration Service, and Notification service mocked out below.  In the `./examples` folder you will find some of the files that require modification for the setup of your micro service that include detailed examples.

![OADW Solution Architecture example](./example/assets/OADW_Architecture-Walkthrough.png)

## Installation & Configuration

This application/solution is built to be run in 2 different environments (Development / Production)
The `development` flag will enable debugging for the Prisma API which outputs all requests and responses to console.  It will also enable the graphQL playground and introspection for your micro service.  It is best practice to disable these features in a production environment and as such they are disabled with the `production` flag.  These flags can be set either on the command line or in docker-compose.

### Secrets Configuration

To configure this application there are 2 files that require modification.

1. `./src/config.js`

    This file contains the majority of the variables that define the difference between your production, development, and test environments that are not secrets.

2. `./.env`

    This file contains the secrets required for the application and can be set either through ENV variables or through this file.
* `MQ_USER` = Username for RabbitMQ instance set in `./src/config.js`
* `MQ_PASS` = Password for RabbitMQ instance
* `client_id` = The clientID from the client created in Concierge for this micro service
* `client_secret` = The client secret for the Client ID listed above.

### Development

To setup this application in development run the following commands:

* `sudo docker-compose -f docker-compose-dev.yml up`
* `sudo npm install`
* `npm start dev`

The Apollo GraphQL service endpoint and playground can now be reached at http://localhost:4000/
The Prisma service playground can be reached at http://localhost:4466/profile

### Production

To setup this application for production:

* `sudo docker-compose up --build -d`

The service endpoint can now be reached at http://localhost:4000.  The Prisma endpoint is not available outside of the docker-compose container.  The container can now be proxied through an Nginx or Apache instance.  SSL/TLS encryption should be handled by Nginx/Apache and not the micro service.

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

* Modify the `./prisma/datamodel.graphql	` to declare your services data model
* This model will be pushed to the Prisma server when launching both the development and production docker environments.  Upon successful completion a generated API schema file will be copied to  `./src/generated/prisma.graphql`

### GraphQL Schema and Resolvers

This is the heart of your micro service.  This section extends the data model that was created for the Prisma API and implements the various queries, resolvers, and authorization directives required to fetch the data from the Prisma API.

#### Getting Started

* Define your extended data model in `./src/schema.graphql`
  * Any models that need to be reused can be imported in their entirety by importing them from the generated Prisma file `# import Address from './generated/prisma.graphql'`.  Only import types where you want to expose all existing fields from the type through your micro service.  
  * Type Query

    * Holds all your queries.  Ex.

      ```js
      type Query {
      	profiles(id: ID, name: String): [Profile!]!,
      	addresses(id: ID, streetAddress:String):[Address!]!
      }
      ```

  * Type Mutation

    * Holds all your mutations Ex.

      ```js
      type Mutation {
      	createProfile(name: String!, email: String!):Profile!,
      	modifyProfile(id: ID!, data:ModifyProfileInput):Profile!
      }
      ```
  * Custom object and input types
    * These objects extend your Prisma object definitions.  Essentially they mimic the same data model but provide the ability to hide fields that should never be visible outside of your micro service.
    * Input types enable the ability to accept data for your Mutations types.
* Define your Queries in `./src/resolvers/Query.js`

  * This is where the micro service handles the graphQL query requests that it receives and fills those requests by calling the Prisma API.  See in line comments in the code itself for our example of a profiles query in `./example/src/resolvers/Query.js`.
* Define your Mutations in `./src/resolvers/Mutations.js`

  * This is where the micro service handles the graphQL mutation requests that it receives and fulfills those requests by calling the Prisma API.  See in line comments in the code itself for our example of mutations that could be performed on a profile object in `./example/src/resolvers/Mutations.js`.

#### Resources

* https://graphql.org/learn/schema/
* https://www.apollographql.com/docs/graphql-tools/generate-schema.html
* https://www.apollographql.com/docs/graphql-tools/resolvers.html
* https://www.howtographql.com/graphql-js/0-introduction/

### RabbitMQ connector

RabbitMQ is leveraged in the solution architecture to handle event driven changes that need to be reflected across the environment.  For example when a user registers with GCaccount their profile information should be instantiated in the profile service so that when a user goes to log into their first application the basic profile data used during registration is already available.

#### Getting Started

* The various secrets (host, user, and password) for rabbitMQ are set in the `.env` and `./src/config.js` files. 

* In `./src/Service_Mesh/listener_connector.js` an object exists at the top of the file `listenExchangesAndBindings` that takes an array of exchanges and topic keys your service should listen for.  For example in profile as a service we would want to listen to the account exchange for any new users.  This could be accomplished by inserting an object key with the following array: `account: ["user.new"]`.  A more complex service could be listening to multiple exchanges and the object would look more like: 

  ```js
  listenExchangesAndBindings = {
  	account:["user.new", "user.delete"],
  	profile:["organization.new", "team.new", "profile.new.supervisor"]
  }
  ```

* to publish a message to an exchange import `connectMessageQueuePublisher` from `./Service_Mesh/publisher_connector`.  The function takes the following 3 arguments; exchange name, topic binding key, and the message to send.  Example:

  ```js
  try {
  	await publishMessageQueue("errors", "profile.creation", rejectMsg);
  } catch(err){
  	console.error(err);
  }
  ```

* The events that arrive through the listener are handled in `./src/Service_Mesh/hander.js`.  The `msgHandler` function accepts all incoming messages and matches the topic binding key in a switch case.  The triggered case then applies the appropriate logic that you define for that event.  For example the below case triggers when a message is received with the "user.new" topic binding and creates a new profile.  On an error the error message is published back to an error exchange on RabbitMQ for central logging and analysis.

  ```js
  
  const { publishMessageQueue } = require("./publisher_connector");
  ///	///
  case "user.new":
  	var args = {
          gcID: messageBody.gcID,
          name: messageBody.name,
          email: messageBody.name
      };
  	try {
      	await createProfile(null, args, context, "{gcID, name, email}");
          success(true);
      } catch(err){
          if (err instanceof GraphQLError){
          	let rejectMsg = {
              	args,
                  error: err
              };
              try{
                  await publishMessageQueue("errors", "profile.creation", rejectMsg);
              } catch(err){
                  // eslint-disable-next-line no-console
                  console.error(err);
              }
              // The error has been handled and no longer need to be in queue
              success(true);
          } else{
              // If it's not a GraphQL Error then requeue it.
              success(false);
            }
          }
          break;
  ```

  

### Authorization Directives

Authorization directives are schema directives that can check against different conditions that if true will return the value originally requested or if false can either block a field from being returned or throw an error.  Eventually the current form of Authorization Directives will become much more robust however it is still a proof of concept.

#### Getting Started

* Declaring your directives in `./src/schema.graphql`  is very straight forward.  For example:

  ```js
  directive @isAuthenticated on OBJECT | FIELD_DEFINITION
  directive @isSupervisor on FIELD_DEFINITION
  ```

  The above declares a directive called `isAuthentiated` that can be applied to an object Type or a field on an Object.

  ```js
  type Query {
    addresses(id: ID, streetAddress: String, city: String, province: String, postalCode: String, country: String, skip: Int, first: Int): [Address!]! @isAuthenticated
  }
  
  type Profile @isAuthenticated {
    gcID: String! 
    name: String! 
    email: Email! 
    mobilePhone: PhoneNumber @isSupervisor
    officePhone: PhoneNumber @isSupervisor
    address: Address
    titleEn: String 
    titleFr: String 
    supervisor: Profile 
    team: Team     
  }
  ```

  

* Defining your directives occurs in `./src/Auth/Directives.js` and the first section at the top is where we can define our fragments if required.  A fragment can be applied to a query to ensure that the fields that are required by your authorization logic are always returned even if the original request did not specify them.

  ```js
  const nameOfFragment = "fragment nameOfFragment on nameOfType {field, field, relation{field, field}}"
  ```

  Next a directive can be declared by extending `SchemaDirectiveVisitor` and over rides declared for the `visitObject()` and `visitFieldDefinition` functions.  In the example below a directive is defined that will be used on object fields that verifies if the request sender is the supervisor of the returned request.  If the requester is the supervisor the field is passed through however if the logic fails the value is blocked by returning a null  value for the field through the `blockValue()` function.

  ```js
  class SupervisorDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field) {
      const { resolve = defaultFieldResolver } = field;
      field.resolve = async function(...args) {
        const [record, requestArgs , ctx] = args;
  
        const requester = ctx.token.sub;
        const requestedSuper = await getSupervisorid(record);
  
        if(requester !== null && requestedSuper !== null){
          if(requester === requestedSuper){
              return resolve.apply(this, args);
          }
        }
  
        return await blockValue(field);
    },
  })
      };
    }
  }
  ```

* Including your directives occurs in the `./index.js` in the schema constant.

  ```js
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
    schemaDirectives: {
      isAuthenticated: AuthDirectives.AuthenticatedDirective,
      // list directives here
    },
  });
  ```





------



Happy Coding!

![Happy coding](./example/assets/happy_coding.png)
