require("dotenv").config();

const env = process.env.NODE_ENV; // 'development' or 'production'
const clientId = process.env.client_id;
const clientSecret = process.env.client_secret;

const development = {
 app: {
   port: 4000,
   multicore: false
 },
 prisma: {
     host:"localhost",
     debug: true
 },
 image:{
   url:"http://localhost:8007/backend.php",
   format:"jpeg",
   size:300
 },
 rabbitMQ:{
   host:"localhost"
 },
 openId:{
   url:"http://localhost:8000"
 },
 client:{
   id:clientId,
   secret:clientSecret
 }
};

const production = {
 app: {
   port: 4000,
   multicore: true
 },
 prisma: {
     host: "prisma",
     debug: false
 },
 image:{
  url:"http://image/backend.php",
  format:"jpeg",
  size:300
},
rabbitMQ:{
  host:"mq.gccollab.ca"
},
openId:{
  url:"https://account.gccollab.ca"
},
client:{
  id:clientId,
  secret:clientSecret
}
};

const config = {
 development,
 production
};

module.exports = config[env];
