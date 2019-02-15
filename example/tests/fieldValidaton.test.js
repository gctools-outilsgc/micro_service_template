const mutations = require("../src/resolvers/Mutations");
const { getPrismaTestInstance } = require("./init/prismaTestInstance");

const parent = {};
const ctx = {
    prisma: getPrismaTestInstance()
};

beforeAll(async() => {
    // Create base profile
        const args = {
                gcID: "asdf123456",
                name: "Awesome User",
                email: "awesome.user@somewhere.com"
        };

        const info = "{ gcID, name, email }";
        await mutations.createProfile(parent, args, ctx, info);    

});

afterAll(async() => {
    await getPrismaTestInstance().mutation.deleteProfile({where:{gcID:"asdf123456"}});
});

test("Address field valdiation - streetAddress", async() => {
    const args = {
        gcID:"asdf123456",
        data:{
            address:{
                city:"Ottawa",
                province:"Ontario",
                postalCode:"H0H 0H0",
                country:"Canada"
            }
        }
    };

    const info = "{gcID,name,address{streetAddress, city, province, postalCode, country}";

    await expect(mutations.modifyProfile(parent, args, ctx, info)
    ).rejects.toThrowErrorMatchingSnapshot();
});

test("Address field valdiation - city", async() => {
    const args = {
        gcID:"asdf123456",
        data:{
            address:{
                streetAddress:"450 Blue Nose",
                province:"Ontario",
                postalCode:"H0H 0H0",
                country:"Canada"
            }
        }
    };

    const info = "{gcID,name,address{streetAddress, city, province, postalCode, country}";

    await expect(mutations.modifyProfile(parent, args, ctx, info)
    ).rejects.toThrowErrorMatchingSnapshot();
});

test("Address field valdiation - province", async() => {
    const args = {
        gcID:"asdf123456",
        data:{
            address:{
                streetAddress:"450 Blue Nose",
                city:"Ottawa",
                postalCode:"H0H 0H0",
                country:"Canada"
            }
        }
    };

    const info = "{gcID,name,address{streetAddress, city, province, postalCode, country}";

    await expect(mutations.modifyProfile(parent, args, ctx, info)
    ).rejects.toThrowErrorMatchingSnapshot();
});

test("Address field valdiation - postal code", async() => {
    const args = {
        gcID:"asdf123456",
        data:{
            address:{
                streetAddress:"450 Blue Nose",
                city:"Ottawa",
                province:"Ontario",
                country:"Canada"
            }
        }
    };

    const info = "{gcID,name,address{streetAddress, city, province, postalCode, country}";

    await expect(mutations.modifyProfile(parent, args, ctx, info)
    ).rejects.toThrowErrorMatchingSnapshot();
});

test("Address field valdiation - country", async() => {
    const args = {
        gcID:"asdf123456",
        data:{
            address:{
                streetAddress:"450 Blue Nose",
                city:"Ottawa",
                province:"Ontario",
                postalCode:"H0H 0H0",
            }
        }
    };

    const info = "{gcID,name,address{streetAddress, city, province, postalCode, country}";

    await expect(mutations.modifyProfile(parent, args, ctx, info)
    ).rejects.toThrowErrorMatchingSnapshot();
});

test("Non-existant profile for Modification", async() => {
    const args = {
        gcID: "098ohinjawef",
        data:{
            name:"Face Plant"
        }
    };

    const info = "{gcID, name}";

    await expect(mutations.modifyProfile(parent, args, ctx, info)
    ).rejects.toThrowErrorMatchingSnapshot();
});

test("Non-existant team for Modifcation", async() => {

    const args = {
        id: "098oihalknfdsaasdf",
        data:{
            nameEN:"Faker"
        }
    };

    const info = "{id, nameEN}";

    await expect(mutations.modifyTeam(parent, args, ctx, info)
    ).rejects.toThrowErrorMatchingSnapshot();

});
