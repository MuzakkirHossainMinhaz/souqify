import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request } from 'express';
import proxy from 'express-http-proxy';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import * as path from 'path';

const app = express();

// middlewares
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);

// cors config
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// rate limit config
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: Request) => {
    return req.headers.authorization ? 100 : 10;
  },
  message: {
    status: 429,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  keyGenerator: (req: any) => req.ip ?? req.headers['x-forwarded-for'] ?? req.connection.remoteAddress ?? 'unknown',
}));

// app.use('/api/docs', swaggerui.serve, swaggerui.setup(swaggerDocument));

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/gateway-api', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

app.use('/auth', proxy('http://localhost:5001'));

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`[ ready ] http://localhost:${port}`);
});
server.on('error', console.error);
