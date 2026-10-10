import express from "express";
import cors, { type CorsOptions } from "cors"
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { errorHandler } from "./middlewares/GlobalErrorhandler.js";
import { env } from "./config/env.js";

const app = express()

// ”Setting some origin means only that domain can access my server” ?
// No.It means browsers will only let JavaScript from that origin read responses.The server still responds to all requests.
const corsOptions: CorsOptions = {
    origin: (origin, cb) => {
        if (!origin || env.ALLOWED_ORIGINS.includes(origin)) {
            cb(null, true)
        } else {
            cb(new Error(`${origin} is not allowed`))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}

// middlewares in here
app.use(cors(corsOptions))
app.use(helmet()) // Content Security Policy (CSP): Helps prevent Cross-Site Scripting (XSS) attacks by controlling resources the browser can load.
app.use(express.json())
app.use(compression()) // helps in compressing text based(HTML, CSS, JSON, JS) payloads using Gzip.
app.use(morgan(env.MORGAN_LOG_FORMAT)) //logging setup


app.get("/api/health-check", (_, res) => {
    return res.status(200).send({message: "Healthy", env: env.ENV})
})

app.get("/", (req, res) => {
    return res.send({message: "Hi"})
})

// Why is this registered after all the routes ?
// Express sets middlewares top to bottom.
app.use(errorHandler)

app.listen(env.PORT, () => {
    console.log(`Listening at ${env.PORT}`)
})