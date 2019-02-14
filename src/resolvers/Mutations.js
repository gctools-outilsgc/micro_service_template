const {copyValueToObjectIfDefined, propertyExists} = require("./helper/objectHelper");
const { throwExceptionIfProfileIsNotDefined, getSupervisorFromArgs} = require("./helper/profileHelper");
const { getNewAddressFromArgs, updateOrCreateAddressOnProfile} = require("./helper/addressHelper");
const { UserInputError } = require("apollo-server");

async function createProfile(_, args, context, info){
    var createProfileData = {
        gcID: args.gcID,
        name: args.name,
        email: args.email,
        mobilePhone: copyValueToObjectIfDefined(args.mobilePhone),
        officePhone: copyValueToObjectIfDefined(args.officePhone),
        titleEn: copyValueToObjectIfDefined(args.titleEn),
        titleFr: copyValueToObjectIfDefined(args.titleFr)
    };
    
    if (propertyExists(args, "address")){
        var address = getNewAddressFromArgs(args);
        if(address != null) {
            createProfileData.address = {create:address};
        }
    }



    if (propertyExists(args, "supervisor")) {
        var updateSupervisorData = {
            gcID: copyValueToObjectIfDefined(args.supervisor.gcID),
            email: copyValueToObjectIfDefined(args.supervisor.email)
        };

        createProfileData.supervisor = {
                connect: updateSupervisorData
        };
    }

    if (propertyExists(args, "team")){
        createProfileData.team = {
                connect: {
                    id: args.team.id
                }
        };
    }
      

    return await context.prisma.mutation.createProfile({
        data: createProfileData,
        }, info);
}

async function modifyProfile(_, args, context, info){
    // eslint-disable-next-line new-cap
    const currentProfile = await context.prisma.query.profile(
        {
            where: {
                gcID: args.gcID
            }            
        },"{gcID, address{id}}");

    throwExceptionIfProfileIsNotDefined(currentProfile);
    var updateProfileData = {
        name: copyValueToObjectIfDefined(args.data.name),
        email: copyValueToObjectIfDefined(args.data.email),
        mobilePhone: copyValueToObjectIfDefined(args.data.mobilePhone),
        officePhone: copyValueToObjectIfDefined(args.data.officePhone),
        titleEn: copyValueToObjectIfDefined(args.data.titleEn),
        titleFr: copyValueToObjectIfDefined(args.data.titleFr),
    };
  
    if (propertyExists(args.data, "address")){
        var address = updateOrCreateAddressOnProfile(args, currentProfile);
        if(address != null){
            updateProfileData.address = address;
        }        
    }

       
    if (propertyExists(args.data, "supervisor")) {
        var updateSupervisorData = {
            gcID: copyValueToObjectIfDefined(args.data.supervisor.gcID),
            email: copyValueToObjectIfDefined(args.data.supervisor.email)
        };

        updateProfileData.supervisor = {
                connect: updateSupervisorData
        };
    }
    
    if (propertyExists(args.data, "team")){
        updateProfileData.team = {
                connect: {
                    id: args.data.team.id
                }
        };
    }

    return await context.prisma.mutation.updateProfile({
        where:{
        gcID: args.gcID
        },
        data: updateProfileData   
    }, info);    
}

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
