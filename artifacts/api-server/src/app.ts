import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";
import session from "express-session";
import jwt from "jsonwebtoken";
import router from "./routes";
import { logger } from "./lib/logger";

const JWT_SECRET = process.env.SESSION_SECRET ?? "investment-platform-secret-key";

function jwtSessionMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if ((req.session as any).userId) { next(); return; }
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(auth.slice(7), JWT_SECRET) as any;
      if (payload?.userId) {
        (req.session as any).userId = payload.userId;
        (req.session as any).pinVerified = !!payload.pinVerified;
      }
    } catch {}
  }
  next();
}

const app: Express = express();
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET ?? "investment-platform-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "none",
  },
}));
app.use(jwtSessionMiddleware);

app.use("/api", router);

export default app;
