import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

const logger = new Logger("Bootstrap");

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log"],
  });

  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Backend running on: http://localhost:${port}`);
}

async function connectWithRetry(
  retries = 10,
  delay = 3000,
  backoffMultiplier = 1.5
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.log(
        `Attempting to start application (attempt ${attempt}/${retries})...`
      );
      await bootstrap();
      logger.log("✅ Application started successfully!");
      return;
    } catch (error) {
      const isLastAttempt = attempt === retries;
      
      if (isLastAttempt) {
        logger.error(
          `❌ Failed to start application after ${retries} attempts`
        );
        logger.error(error);
        process.exit(1);
      }

      const waitTime = delay * Math.pow(backoffMultiplier, attempt - 1);
      logger.warn(
        `⚠️  Connection failed (attempt ${attempt}/${retries}). Retrying in ${Math.round(waitTime / 1000)}s...`
      );
      logger.error(`Error: ${error.message}`);

      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

// Start application with retry logic
connectWithRetry();
