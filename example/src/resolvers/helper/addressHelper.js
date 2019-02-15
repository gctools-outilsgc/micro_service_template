const {propertyRequired, copyValueToObjectIfDefined, propertyExists} = require("./objectHelper");
const { UserInputError } = require("apollo-server");

const getNewAddressFromArgs = (args) => {

  var errors = [
      propertyRequired(args.address, "streetAddress"),
      propertyRequired(args.address, "city"),
      propertyRequired(args.address, "postalCode"),
      propertyRequired(args.address, "country"),
      propertyRequired(args.address, "province"),
  ];

  errors = errors.filter(function (el) {
    return el !== null && typeof el !== "undefined" && el !== "";
  });

  if (errors.length > 0) {
      throw new UserInputError("Missing Fields Required", {
          missingFields: errors
        });
  }

    return args.address;
};

function updateExistingAddress(args){
    var updateAddressData = {
        streetAddress: copyValueToObjectIfDefined(args.data.address.streetAddress),
        city: copyValueToObjectIfDefined(args.data.address.city),
        postalCode: copyValueToObjectIfDefined(args.data.address.postalCode),
        province: copyValueToObjectIfDefined(args.data.address.province),
        country: copyValueToObjectIfDefined(args.data.address.country)
    };
    return { update: updateAddressData };
}


function updateOrCreateAddressOnProfile(args, profile){

        if (profile.address !== null && typeof profile.address !== "undefined"){
            return updateExistingAddress(args);
        }
        var newAddress = getNewAddressFromArgs(args.data);
        return { create:newAddress };
    
}

module.exports ={
  getNewAddressFromArgs,
  updateOrCreateAddressOnProfile
};