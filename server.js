require('dotenv').config();
const path = require('path');
const fastify = require('fastify')({ logger: true });
const fastifyEnv = require('@fastify/env');


//register plugins
fastify.register(require('@fastify/cors'));
fastify.register(require('@fastify/sensible'));
fastify.register(require('@fastify/multipart'));
fastify.register(require('@fastify/static'),{
    root: path.join(__dirname, 'uploads'),
   prefix: '/uploads/', // optional: default '/'
 }
);

fastify.register(require('@fastify/env'),{
    dotenv: true,
    schema: {
        type: 'object',
        required: ["PORT", "MONGODB_URI", "JWT_TOKEN"],
        properties: {
            PORT: {type: "string", default: "3000"},
            MONGODB_URI: {type: "string"},
            JWT_TOKEN: {type: "string"},
        },
    },
});

//Register custom plugin
fastify.register(require("./plugins/mongodb"));
fastify.register(require("./plugins/jwt"));

//Register routes
fastify.register(require('./routes/auth'), { prefix: '/api/auth' });
fastify.register(require('./routes/thumbnail'), { prefix: '/api/thumbnails' });


// Declare a route
fastify.get('/', function (request, reply) {
  reply.send({ hello: 'world' })
});

//test database connection
fastify.get("/test-db", async(request, reply) =>{
    try{
     const mongoose = fastify.mongoose 
     const connectionState = mongoose.connection.readyState
     
    let status = ""
    switch(connectionState) {
        case 0:
            status = "Disconnected";
            break;
        case 1:
            status = "connected";
            break;
        case 2:
            status = "connecting";
            break;
        case 3:
            status = "disconnecting";
            break;

        default:
            status = "unknown";
            break;

    }

    reply.send({database: status})

    }catch(err){
      fastify.log.error(err);
      reply.status(500).send({error: "Failed to test database"})
      process.exit(1);
    }
})




const start = async () => {
    try {
        await fastify.listen({port : process.env.PORT })
        fastify.log.info(
            `Server is running at http://localhost:${process.env.PORT}`
        );
        
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
        
    }
}

start();