import { s as supabase } from './supabase_C4p1dVZL.mjs';

const GET = async ({ request }) => {
  try {
    const { data, error } = await supabase.from("email_campaigns").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, trigger_event, html_content, status } = body;
    const { data, error } = await supabase.from("email_campaigns").insert({ name, trigger_event, html_content, status }).select().single();
    if (error) throw error;
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
const PUT = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, name, trigger_event, html_content, status } = body;
    if (!id) throw new Error("ID obrigatório");
    const { data, error } = await supabase.from("email_campaigns").update({ name, trigger_event, html_content, status, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
    if (error) throw error;
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET,
    POST,
    PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
