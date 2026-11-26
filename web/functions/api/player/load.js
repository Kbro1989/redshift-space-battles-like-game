export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const username = (url.searchParams.get("username") || "").trim().toLowerCase();

    if (!username) {
      return new Response(JSON.stringify({ success: false, error: "Commander callsign required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!env || !env.KV) {
      return new Response(JSON.stringify({ success: false, error: "KV not configured (using local storage fallback)" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const key = `redshift_player:${username}`;
    const dataJson = await env.KV.get(key);

    if (!dataJson) {
      return new Response(JSON.stringify({ success: false, error: "Commander profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(dataJson, {
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
