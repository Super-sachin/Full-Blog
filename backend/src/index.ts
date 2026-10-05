import { Hono } from 'hono'
import { blogRouter } from "./routes/blog";
import { userRouter } from "./routes/user";
import { sign,verify } from 'hono/jwt'
import {cors} from 'hono/cors'
type Bindings = {
  DATABASE_URL: string,
  JWT_SECRET: string,
}

const app = new Hono<{ Bindings: Bindings }>();

app.use('/*', cors());
app.route("/api/v1/user/",userRouter);
app.route("/api/v1/blog/",blogRouter);





export default app
