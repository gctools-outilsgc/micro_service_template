const mutations = require("../src/resolvers/Mutations");
const { getPrismaTestInstance } = require("./init/prismaTestInstance");

const parent = {};
const ctx = {
    prisma: getPrismaTestInstance()
};


test("create a basic profile with mandatory fields",  async() => {
    const args = {
            gcID: "09ujilkjlkiid",
            name: "Awesome User",
            email: "awesome.user@somewhere.com"
    };

    const info = "{ gcID, name, email }";

    expect(
        await mutations.createProfile(parent, args, ctx, info),
    ).toMatchSnapshot();

    await getPrismaTestInstance().mutation.deleteProfile({where:{gcID:"09ujilkjlkiid"}});
});

test("fail profile creation due to missing gcID", async() => {
    const args = {
        name: "Awesome User",
        email: "awesome.user@somewhere.com"
    };
     
    const info = "{ gcID, name, email }";
    
    await expect(
        mutations.createProfile(parent, args, ctx, info)
    ).rejects.toThrowErrorMatchingSnapshot();

});

test("fail profile creation due to missing name", async() => {

    const args = {
            gcID: "09ujilkjlkiid",
            email: "awesome.user@somewhere.com"
        };
               
        const info = "{ gcID, name, email }";

    await expect(
        mutations.createProfile(parent, args, ctx, info)
    ).rejects.toThrowErrorMatchingSnapshot();
});

test("fail profile creation due to missing email", async() => {

        const args = {
            gcID: "09ujilkjlkiid",
            name: "Awesome User",
        };
        
        const info = "{ gcID, name, email }";
        
    await expect(
        mutations.createProfile(parent, args, ctx, info)
    ).rejects.toThrowErrorMatchingSnapshot();

});