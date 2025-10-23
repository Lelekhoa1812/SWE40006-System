declare module 'fastify' {
  interface Session {
    userId?: string;
    userRole?: string;
  }
}
