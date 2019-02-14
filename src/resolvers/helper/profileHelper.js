const {propertyRequired} = require("./objectHelper");
const { UserInputError } = require("apollo-server");

const throwExceptionIfProfileIsNotDefined = (profile) => {
    if (profile === null || typeof profile === "undefined"){
        throw new UserInputError("Profile does not exist");
    }
};

module.exports ={
  throwExceptionIfProfileIsNotDefined
};