import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qedxpygkkwybrvxludjx.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZHhweWdra3d5YnJ2eGx1ZGp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDAzODQ0OSwiZXhwIjoyMDg1NjE0NDQ5fQ.xefVpPNcdVpBADfTbx2VK5vvw6M5dMMs_FpkEL0L09k";
const statusMap = {
  "email.sent": { field: "sent_at", status: "sent" },
  "email.delivered": { field: "delivered_at", status: "delivered" },
  "email.bounced": { field: "bounced_at", status: "bounced" },
  "email.complained": { field: "bounced_at", status: "complained" },
  "email.opened": { field: "opened_at", status: "opened" },
  "email.clicked": { field: "clicked_at", status: "clicked" }
};
const POST = async ({ request }) => {
  try {
    const event = await request.json();
    const eventType = event.type;
    const emailId = event.data?.email_id;
    if (!emailId || !statusMap[eventType]) {
      return new Response("OK", { status: 200 });
    }
    const mapping = statusMap[eventType];
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const updateData = {
      status: mapping.status,
      [mapping.field]: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (eventType === "email.bounced") {
      updateData.error_message = event.data?.bounce?.message || "Bounce";
    }
    await supabaseAdmin.from("email_logs").update(updateData).eq("resend_email_id", emailId);
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("OK", { status: 200 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
