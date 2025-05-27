import Fastify from 'fastify';
const fastify = Fastify({
 logger: true
});

fastify.get('/', async (request, reply) => {
  const name = process.env.NAME || 'World';
  return `Hello ${name}!`
});

const port = parseInt(process.env.PORT || '3000');
fastify.listen({ port: port }, (err, address) => {
 if (err) throw err
});
