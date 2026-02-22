import { errorMiddleware } from '@souqify/errorHandler/errorMiddleware.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import authRoutes from './routes/auth.routes.js';

const app = express();

// middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cors config
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// routes
app.use('/', authRoutes);

app.get('/welcome', (_req, res) => {
  res.send({ message: 'Welcome to auth-service!' });
});

app.use(errorMiddleware);

const port = process.env.PORT ? Number(process.env.PORT) : 5001;
const server = app.listen(port, () => {
  console.log(`[ ready ] http://localhost:${port}`);
});

server.on('error', console.error);
