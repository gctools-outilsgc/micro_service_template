// Handler for messages from different exchanges and keys
const { Prisma } = require("prisma-binding");
const { publishMessageQueue } = require("./publisher_connector");
const config = require("../config");

const context = {
    prisma: new Prisma({
        typeDefs: "./src/generated/prisma.graphql",
        endpoint: "http://"+config.prisma.host+":4466/profile/",
        debug: config.prisma.debug,
      }),
};

async function msgHandler(msg, success) {
    const messageBody = JSON.parse(msg.content.toString());
    switch (msg.fields.routingKey){




        // List cases here for topic keys being listened to.
        // see example folder for more details




        
        // A default case that handles errors and centralizes reporting
        default:
            let rejectMsg = {
                msg: messageBody,
                key: msg.fields.routingKey,
                error: "No handler method available"
            };
            try {
                await publishMessageQueue("errors", "profile.noHandler", rejectMsg);
            } catch(err){
                // Could not forward error - will need to cache these
                // eslint-disable-next-line no-console
                console.error(err);
            }
            // eslint-disable-next-line no-console
            console.error("No handler method available - Default Policy : Drop to error");
            success(true);
            break;        
    }
}

module.exports = {
    msgHandler
};