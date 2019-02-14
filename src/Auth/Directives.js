const { SchemaDirectiveVisitor, AuthenticationError } = require("apollo-server");
const { propertyExists } = require("../resolvers/helper/objectHelper");
const { defaultFieldResolver } = require("graphql");
const { blockValue, getOrganizationid } = require("./helpers");

/*
  Fragments for Auth:
  These fragments will ensure that the fields that are required to identify relationships for access
  levels will always be returned.
*/
const profileFragment = "fragment authProfile on Profile {gcID, name, email, supervisor{gcID}, team{id, organization{id}}}";


// inOrganization directive can only be used on the Profile object fields.
// This diretive automatically implements the isAuthenticated directive

class OrganizationDirective extends SchemaDirectiveVisitor {

  visitObject(type){
    this.wrapOrgAuth(type);
    type._requiresOrgAuth = true;
  }

  visitFieldDefinition(field, parent) {
    this.wrapOrgAuth(parent.objectType);
    field._requiresOrgAuth = true;

  }

  wrapOrgAuth(objectType){
    if (objectType._fieldsWrapped) {
      return;
    }

    objectType._fieldsWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName];
      const { resolve = defaultFieldResolver } = field;

      field.resolve = async function (record, args, context, info){

        const requireOrgAuth = field._requiresOrgAuth || objectType._requiresOrgAuth;

        if (!requireOrgAuth){
          return await resolve.apply(this, [record, args, context, info]);
        }

        const requesterOrg = await getOrganizationid(context.token.owner);
        const recordOrg = await getOrganizationid(record);

        if(requesterOrg !== null && recordOrg !== null){
          if (requesterOrg === recordOrg){
            return await resolve.apply(this, [record, args, context, info]);
          } 
        } 
        return await blockValue(field);     
      };

    });


  }
}

class AuthenticatedDirective extends SchemaDirectiveVisitor {

  visitObject(type){
    this.wrapAuth(type);
    type._requiresAuth = true;
  }

  visitFieldDefinition(field, details){
    this.wrapAuth(details.objectType);
    field._requiresAuth = true;
  }

  wrapAuth(objectType){
    if (objectType._fieldsWrapped) {
      return;
    }

    objectType._fieldsWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName];
      const { resolve = defaultFieldResolver } = field;

      field.resolve = async function (record, args, context, info){
        const requireAuth = field._requiresAuth || objectType._requiresAuth;
        if (!requireAuth){
          return await resolve.apply(this, [record, args, context, info]);
        }
        if (propertyExists(context.token,"sub")){
          return resolve.apply(this, [record, args, context, info]);
        } else {
            return await blockValue(field);
        }
        
      };

    });

  }
}




module.exports = {
  OrganizationDirective,
  AuthenticatedDirective,
  profileFragment
};