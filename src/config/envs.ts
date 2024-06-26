import 'dotenv/config'
import * as joi from 'joi'

interface IEnv {
  PORT: number
  NATS_SERVERS: string[]
  DATABASE_URL: string
  JWT_SECRET: string
}

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
    DATABASE_URL: joi.string().required(),
    JWT_SECRET: joi.string().required()
  })
  .unknown(true)

const { error, value } = envSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
})

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const envVars: IEnv = value

export const envs = {
  port: envVars.PORT,
  natsServers: envVars.NATS_SERVERS,
  databaseUrl: envVars.DATABASE_URL,
  jwtSecret: envVars.JWT_SECRET
}
