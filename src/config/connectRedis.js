import redis from 'redis';

let REDIS_HOST = process.env.REDIS_ADDRESS || "127.0.0.1";
let REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;

const redisClient = redis.createClient({
    socket: {
        host: REDIS_HOST,
        port: REDIS_PORT
    }
});

(async () =>{
    await redisClient.connect();
})();

redisClient.on('error', (err) => {
    console.log('Error: Redis not connected!', err)
})

redisClient.on('ready', () => {
    console.log('Success: Redis connected!')
})

export default redisClient;