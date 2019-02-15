const {copyValueToObjectIfDefined} = require("./helper/objectHelper");
const { addFragmentToInfo } = require("graphql-binding");

// The profile fragment is required to ensure that all required fields
// for the profile auth directives are returned on every client request.  See documentation
// for greater explanation.
const { profileFragment } = require("../Auth/Directives");

// A sample query to return a profile based on input arguments
// that also returns any additional fields as defined in the fragment
function profiles(_, args, context, info) {

  // Set the query criteria for the Prisma API
  return context.prisma.query.profiles(
    {
      // This is where we pass the input arguments Prisma.
      // For a listing of what Prisma can take see the docs on the Prisma API
      // endpoint.. http://localhost:4466/
      where:{
        gcID: copyValueToObjectIfDefined(args.gcID),
        // eslint-disable-next-line camelcase
        name_contains: copyValueToObjectIfDefined(args.name),
        email: copyValueToObjectIfDefined(args.email),
        // eslint-disable-next-line camelcase
        mobilePhone_contains: copyValueToObjectIfDefined(args.mobilePhone),
        // eslint-disable-next-line camelcase
        officePhone_contains: copyValueToObjectIfDefined(args.officePhone),
        // eslint-disable-next-line camelcase
        titleEn_contains: copyValueToObjectIfDefined(args.titleEn),
        // eslint-disable-next-line camelcase
        titleFr_contains: copyValueToObjectIfDefined(args.titleFr),                        
      },
      skip: copyValueToObjectIfDefined(args.skip),
      first: copyValueToObjectIfDefined(args.first),        
    },
    // Here is where we add the fragment to the info object to ensure our
    // auth directives have the information they need irregardless of what
    // the original query asked to be returned. 
    addFragmentToInfo(info, profileFragment)
  );
}
// A sample query to return an array of Addresses based on input arguments
function addresses(_, args, context, info) {
  return context.prisma.query.addresses(
    {
      where:{
        id: args.id,
        // eslint-disable-next-line camelcase
        streetAddress_contains: args.streetAddress,
        // eslint-disable-next-line camelcase
        city_contains: args.city,
        // eslint-disable-next-line camelcase
        province_contains: args.province,
        // eslint-disable-next-line camelcase
        postalCode_contains: args.postalCode,
        // eslint-disable-next-line camelcase
        country_contains: args.country,
      },
      skip: args.skip,
      first: args.first,      
    },
    info
  );
}


module.exports = {
    profiles,
    addresses,
};