export async function onRequest(context: any) {
  return new Response(JSON.stringify({ status: 'ok', message: 'Native Function works' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}