const { SchemaDirectiveVisitor, AuthenticationError } = require("apollo-server");
const { propertyExists } = require("../resolvers/helper/objectHelper");
const { defaultFieldResolver } = require("graphql");
const { blockValue, getOrganizationid } = require("./helpers");

/*
  Declare fragments for Auth directives here.
  These fragments will ensure that the fields that are required to identify relationships for access
  levels will always be returned.
*/





/*
  List auth directive definitions in this section.
  All directives inherit extend from SchemaDirectiveVisitor imported from 'apollo-server' 
*/




// export modules here for import in other files
module.exports = {

};