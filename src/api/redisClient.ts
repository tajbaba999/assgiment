/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/quotes */
import Redis from 'ioredis';


const redis = new Redis("rediss://default:AdzfAAIncDE5NTRhOTBlNmIyOGY0MzNjOWE2ODQzYjhkZDM5YmFmY3AxNTY1NDM@elegant-satyr-56543.upstash.io:6379");


redis.on('error', (err) => {
  console.error('Redis error:', err);
});


(async () => {
  await redis.set('foo', 'bar');
  const value = await redis.get('foo');
  console.log(`Value of 'foo': ${value}`); 
})();

export default redis;
