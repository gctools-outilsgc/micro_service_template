
const {  AuthenticationError } = require("apollo-server");
const { propertyExists } = require("../resolvers/helper/objectHelper");
const { GraphQLNonNull, GraphQLList } = require("graphql");


/*
  The blockValue() function will ensure that a null value is never returned for a blocked field
  that is non-nullable.  In the case of when the a directive is placed at the query or mutation
  level an Authentication error is thrown. 
*/
async function blockValue(field){

    var result = null;
  
    if (field.type instanceof GraphQLNonNull){
      switch(field.type.ofType.name){
        case "EmailAddress":
          result = "-@-.ca";
          break;
        case "PostalCode":
          result = "H0H 0H0";
          break;
        default:
          result = "";
      }
      
      if (field.type.ofType instanceof GraphQLList){
        throw new AuthenticationError("Not Authorized");
      }
    }
  
    return result;
  
  }

  function getOrganizationid(profileObject){
    if (typeof profileObject !== "undefined" && propertyExists(profileObject.team, "organization")){
        if (propertyExists(profileObject.team, "organization")){
        return profileObject.team.organization.id;
        }
    } else {
        return null;
    }
  }

  module.exports= {
      blockValue,
      getOrganizationid
  };