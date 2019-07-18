const config = require("../config");
const amqp = require("amqplib/callback_api");

// object to hold connection for publisher
var publisherConnection = null;
var publishChannel = null;

// configurable settings
var exchange = "default";
var retryDelay = 5000;

async function publishMessageQueue(exchange, key, msgBody){

    // If there is no Message Queue Connection then do not try to send a message
    if(!publisherConnection){
        return;
    }
    
    try {
        await publishChannel.publish(exchange, key, Buffer.from(JSON.stringify(msgBody), {persistent:true}));
    } catch(err){
        // eslint-disable-next-line no-console
        console.error("[SMQ] error", err);
        publishChannel.close();
    }
}

function createChannel(connection){
    publishChannel = connection.createChannel();
    publishChannel.assertExchange(exchange, "topic", {
        durable: true
    });

    publishChannel.on("error", function(err) {
        // eslint-disable-next-line no-console
        console.error("[SMQ] channel error", err.message);
    });
    publishChannel.on("close", function() {
        // eslint-disable-next-line no-console
        console.info("[SMQ] channel '" + exchange + "' closed");
        setTimeout(function() {
            createChannel(connection); 
        },retryDelay);
    }); 
}

// if the connection is closed or fails to be established at all, we will reconnect
function connectMessageQueuePublisher(){

    amqp.connect("amqp://" + config.rabbitMQ.user + ":" + config.rabbitMQ.password + "@" + config.rabbitMQ.host +"?heartbeat=60", function(err, conn) {
        if (err) {
            // eslint-disable-next-line no-console
            console.error("[SMQ]", err.message);
            return setTimeout(connectMessageQueuePublisher, retryDelay);
        }
        conn.on("error", function(err) {
            if (err.message !== "Connection closing") {
                // eslint-disable-next-line no-console
                console.error("[SMQ conn error", err.message);
            }
        });
        conn.on("close", function() {
              // eslint-disable-next-line no-console
                console.error("[SMQ] reconnecting");
                return setTimeout(connectMessageQueuePublisher, retryDelay);
        });

        // eslint-disable-next-line no-console      
        console.info("[SMQ] connected");
        publisherConnection = conn;      
        
        createChannel(publisherConnection);
    });
}

module.exports = {
    connectMessageQueuePublisher,
    publishMessageQueue
};