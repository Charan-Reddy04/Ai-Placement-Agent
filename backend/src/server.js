import app from './app.js';
import connectDB from './config/db.js';
import env from './config/env.js';

const startServer = async () => {
  try {
    // 1. Establish Database Connection
    await connectDB();

    // 2. Start HTTP Listener
    const server = app.listen(env.PORT, '0.0.0.0', () => {
      console.log(`
=====================================================
  CampusPilot Backend Services Started
  Port:         ${env.PORT}
  Environment:  ${env.NODE_ENV}
  Database:     ${env.MONGO_URI}
  Health Check: http://localhost:${env.PORT}/api/health
=====================================================
      `);
    });

    // Graceful Shutdown
    const handleShutdown = (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    console.error('Fatal Server Startup Error:', error);
    process.exit(1);
  }
};

startServer();

