require("dotenv").config();
const path = require("path");
const fastify = require("fastify")({ logger: true });

// Plugins
fastify.register(require("@fastify/cors"));
fastify.register(require("@fastify/sensible"));
fastify.register(require("@fastify/multipart"));
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "uploads"),
  prefix: "/uploads/", // static files will be served at /uploads/*
});

// Environment variables schema validation
fastify.register(require("@fastify/env"), {
  dotenv: true,
  schema: {
    type: "object",
    required: ["PORT", "MONGODB_URI", "JWT_TOKEN"],
    properties: {
      PORT: { type: "string", default: "3000" },
      MONGODB_URI: { type: "string" },
      JWT_TOKEN: { type: "string" },
    },
  },
});

// Custom plugins
fastify.register(require("./plugins/mongodb"));
fastify.register(require("./plugins/jwt"));

// Routes
fastify.register(require("./routes/auth"), { prefix: "/api/auth" });
fastify.register(require("./routes/thumbnail"), { prefix: "/api/thumbnails" });

// Root route
fastify.get("/", async (request, reply) => {
  return { hello: "world" };
});

// Test DB connection route
fastify.get("/test-db", async (request, reply) => {
  try {
    const mongoose = fastify.mongoose;
    const connectionState = mongoose.connection.readyState;

    let status = "";
    switch (connectionState) {
      case 0:
        status = "Disconnected";
        break;
      case 1:
        status = "Connected";
        break;
      case 2:
        status = "Connecting";
        break;
      case 3:
        status = "Disconnecting";
        break;
      default:
        status = "Unknown";
        break;
    }

    reply.send({ database: status });
  } catch (err) {
    fastify.log.error(err);
    reply.status(500).send({ error: "Failed to test database" });
  }
});

// Start server
const start = async () => {
  try {
    const PORT = process.env.PORT || 3000;

    await fastify.listen({
      port: PORT,
      host: "0.0.0.0", // ✅ required for Render
    });

    fastify.log.info(`✅ Server running at http://0.0.0.0:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
