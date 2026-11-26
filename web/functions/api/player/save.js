export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const username = (body.username || "").trim().toLowerCase();

    if (!username) {
      return new Response(JSON.stringify({ success: false, error: "Commander callsign required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!env || !env.KV) {
      return new Response(JSON.stringify({ success: true, notice: "Local mode fallback" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const key = `redshift_player:${username}`;
    await env.KV.put(key, JSON.stringify(body));

    return new Response(JSON.stringify({ success: true, saved: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
