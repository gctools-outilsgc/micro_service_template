require("dotenv").config();

const env = process.env.NODE_ENV; // 'development' or 'production'
const clientId = process.env.client_id;
const clientSecret = process.env.client_secret;

const development = {
 app: {
   port: 4000,
   multicore: false,
   tracing: true
 },
 prisma: {
     host:"localhost",
     debug: true
 },
 rabbitMQ:{
   host:"localhost"
 },
 openId:{
   url:"http://localhost:8000",
   id:clientId,
   secret:clientSecret
 },
};

const production = {
 app: {
   port: 4000,
   multicore: true,
   tracing: false
 },
 prisma: {
     host: "prisma",
     debug: false
 },
rabbitMQ:{
  host:"mq.gccollab.ca"
},
openId:{
  url:"https://account.gccollab.ca",
  id:clientId,
  secret:clientSecret
},
};

const config = {
 development,
 production
};

module.exports = config[env];
