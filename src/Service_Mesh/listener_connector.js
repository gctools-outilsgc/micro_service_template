require("dotenv").config();
const config = require("../config");
const amqp = require("amqplib/callback_api");
const { msgHandler } = require("./handler");

// object to hold connection for listeners
var listenerConnection = null;
var listenQueueOptions = {
    durable: true,
};

const listenExchangesAndBindings = {
    account: ["user.new", "user.modification", "user.delete"],
};

function closeOnErr(err, listenerChannel) {
    if (!err) {
        return false;
    }
    // eslint-disable-next-line no-console
    console.error("[SMQ] error", err);
    listenerChannel.close();
    return true;
}

// Create channel per exchange to listen to queue and monitor connection status.  If it closes try to reconnect.
function listenMessageQueue(exchange){

    var retryDelay = 5000;

    listenerConnection.createChannel(function(err, listenerChannel) {

        listenerChannel.on("error", function(err) {
            // eslint-disable-next-line no-console
            console.error("[SMQ] channel error", err.message);
        });
        listenerChannel.on("close", function() {
            // eslint-disable-next-line no-console
            console.info("[SMQ] channel '" + exchange + "' closed");
            setTimeout(function() {
                listenMessageQueue(exchange); 
            },retryDelay);
        }); 
        listenerChannel.checkExchange(exchange, function(err, ok){
            if (ok) {
                listenerChannel.assertQueue("profile", listenQueueOptions, function(err, q) {
                    if (closeOnErr(err, listenerChannel)) {
                        return;
                    }
        
                    listenExchangesAndBindings[exchange].forEach(function(key) {
                        listenerChannel.bindQueue(q.queue, exchange, key);
                    });
        
                    listenerChannel.prefetch(1);
                    listenerChannel.consume(q.queue, function(msg) {
        
                        msgHandler(msg, function(success) {
                            try {
                                if (success){
                                    // Acknowledge processing and remove from queue
                                    listenerChannel.ack(msg);
                                } else {
                                    // Reject processing and return to queue
                                    listenerChannel.nack(msg);
                                }
                            } catch (err) {
                                closeOnErr(err);
                            }
                        });
        
                    }, {noAck: false}); 
                });
            } else {
                // eslint-disable-next-line no-console
                console.warn("Exchange '" + exchange + "' does not exists");
                retryDelay = retryDelay * 2;
                if (retryDelay >= 3601000){
                    retryDelay = 3600000;
                }
            }
        });                 
    });
}

// if the connection is closed or fails to be established at all, we will reconnect
function connectMessageQueueListener(){
  
    amqp.connect("amqp://" + process.env.MQ_USER + ":" + process.env.MQ_PASS + "@" + config.rabbitMQ.host +"?heartbeat=60", function(err, conn) {
        if (err) {
            // eslint-disable-next-line no-console
            console.error("[SMQ]", err.message);
            return setTimeout(connectMessageQueueListener, 5000);
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
                return setTimeout(connectMessageQueueListener, 5000);
        });

        // eslint-disable-next-line no-console      
        console.info("[SMQ] connected");
        listenerConnection = conn;

        for (let exchange in listenExchangesAndBindings){
            if (listenExchangesAndBindings.hasOwnProperty(exchange)){
                listenMessageQueue(exchange);
            }  
        }
    });
}

module.exports = {
    connectMessageQueueListener,
};