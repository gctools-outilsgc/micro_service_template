
// Usefull for checking if a value is defined before using it.
const copyValueToObjectIfDefined = (originalValue) => {
  if(originalValue !== null && typeof originalValue !== "undefined"){
      return originalValue;
  }
};

// Checks to see if an object property exists.
const propertyExists = (args, property) => {
  let value = args[property];
  if(args[property] === null || typeof value === "undefined"){
      return false;
  }  
  return true;  
};

module.exports = {
  copyValueToObjectIfDefined,
  propertyExists
};
