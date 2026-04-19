export default {
  async fetch(request: Request): Promise<Response> {
    return new Response(JSON.stringify({ status: 'ok', message: 'Worker is working' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};