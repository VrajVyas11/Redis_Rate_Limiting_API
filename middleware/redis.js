import { redis } from "../Redis/redisClient.js";

export const getCashedData = (key) => async (req, res, next) => {
    let data = await redis.get(key)

    if (data) {
        return res.json({
            products: JSON.parse(data)
        })
    }
    next();
}


export const rateLimiter = ({limit=20, timer=60,keys}) => async (req, res, next) => {
    const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress
    const key = `${clientIP}:${keys}:request_count`
    const request_count = await redis.incr(key);
    const TimeRemaining = await redis.ttl(key)
    if (request_count === 1) {
        await redis.expire(key, timer)
    }
    if (request_count > limit) {
        return res.json({status:429,message:`Too Many requests,Please slow down... try again after ${TimeRemaining} seconds `})
    }
   next()
}