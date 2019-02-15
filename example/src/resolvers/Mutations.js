const {copyValueToObjectIfDefined, propertyExists} = require("./helper/objectHelper");
const { throwExceptionIfProfileIsNotDefined, getSupervisorFromArgs} = require("./helper/profileHelper");
const { getNewAddressFromArgs, updateOrCreateAddressOnProfile} = require("./helper/addressHelper");
const { UserInputError } = require("apollo-server");


// Mutation that creates a profile
async function createProfile(_, args, context, info){

    // Get the new profile data from the passed args
    var createProfileData = {
        gcID: args.gcID,
        name: args.name,
        email: args.email,
        mobilePhone: copyValueToObjectIfDefined(args.mobilePhone),
        officePhone: copyValueToObjectIfDefined(args.officePhone),
        titleEn: copyValueToObjectIfDefined(args.titleEn),
        titleFr: copyValueToObjectIfDefined(args.titleFr)
    };


    // Create new address that will be associated with the profile
    // if addressed info was passed in through the args.
    if (propertyExists(args, "address")){
        var address = getNewAddressFromArgs(args);
        if(address != null) {
            createProfileData.address = {create:address};
        }
    }

    // Link the profile to an existing profile as a supervisor
    // by using either the gcID or the email of the supervisor.
    if (propertyExists(args, "supervisor")) {
        var updateSupervisorData = {
            gcID: copyValueToObjectIfDefined(args.supervisor.gcID),
            email: copyValueToObjectIfDefined(args.supervisor.email)
        };

        createProfileData.supervisor = {
                connect: updateSupervisorData
        };
    }
   
    // Send the sanitized data to Prisma to create the profile
    // and return the fields that were defined in info 

    return await context.prisma.mutation.createProfile({
        data: createProfileData,
        }, info);
}

// Modification of an existing profile

async function modifyProfile(_, args, context, info){
    // Check to see if the requested profile exists and
    // load it into a local variable

    // eslint-disable-next-line new-cap
    const currentProfile = await context.prisma.query.profile(
        {
            where: {
                gcID: args.gcID
            }            
        },"{gcID, address{id}}");

    // If the profile doesn't exist throw an error
    // and stop execution
    throwExceptionIfProfileIsNotDefined(currentProfile);

    // Get values from passed in args
    var updateProfileData = {
        name: copyValueToObjectIfDefined(args.data.name),
        email: copyValueToObjectIfDefined(args.data.email),
        mobilePhone: copyValueToObjectIfDefined(args.data.mobilePhone),
        officePhone: copyValueToObjectIfDefined(args.data.officePhone),
        titleEn: copyValueToObjectIfDefined(args.data.titleEn),
        titleFr: copyValueToObjectIfDefined(args.data.titleFr),
    };
    // Update the address object on the profile if it exists or create a new one
    if (propertyExists(args.data, "address")){
        var address = updateOrCreateAddressOnProfile(args, currentProfile);
        if(address != null){
            updateProfileData.address = address;
        }        
    }

    // Update the supervisor object on the profile or link a new one
    if (propertyExists(args.data, "supervisor")) {
        var updateSupervisorData = {
            gcID: copyValueToObjectIfDefined(args.data.supervisor.gcID),
            email: copyValueToObjectIfDefined(args.data.supervisor.email)
        };

        updateProfileData.supervisor = {
                connect: updateSupervisorData
        };
    }

    // Send the sanitized data to Prisma to modify the users profile

    return await context.prisma.mutation.updateProfile({
        where:{
        gcID: args.gcID
        },
        data: updateProfileData   
    }, info);    
}

// Delete a profile from the system

async function deleteProfile(_, args, context){

    // eslint-disable-next-line new-cap
    if (await context.prisma.exists.Profile({gcID:args.gcID})){
        try {
            await context.prisma.mutation.deleteProfile({
                where:{
                gcID: args.gcID
                }
            });

        } catch(e){
            return false;
        }
        return true;
    }
    throw new UserInputError("Profile does not exist")
;
}





module.exports = {
    createProfile,
    modifyProfile,
    deleteProfile,
};
