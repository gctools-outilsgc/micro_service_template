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


// export modules here for import in other files
module.exports = {
  AuthenticatedDirective
};