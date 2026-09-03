import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface BookingPayload {
  customer: string;
  service: string;
  date: string;
  time: string;
  address?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const booking: BookingPayload = await req.json();

    const webhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");
    if (!webhookUrl) {
      console.error("SLACK_WEBHOOK_URL not configured");
      return new Response(
        JSON.stringify({ error: "Webhook URL not configured" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const message = {
      text: "📅 새 예약이 등록되었습니다",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "📅 *새 예약이 등록되었습니다*",
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*고객사:*\n${booking.customer}`,
            },
            {
              type: "mrkdwn",
              text: `*서비스:*\n${booking.service}`,
            },
            {
              type: "mrkdwn",
              text: `*날짜:*\n${booking.date}`,
            },
            {
              type: "mrkdwn",
              text: `*시간:*\n${booking.time}`,
            },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*주소:*\n${booking.address || "주소 없음"}`,
          },
        },
      ],
    };

    const slackResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    if (!slackResponse.ok) {
      console.error(
        `Slack webhook failed: ${slackResponse.status} ${slackResponse.statusText}`
      );
      return new Response(
        JSON.stringify({
          error: `Slack notification failed: ${slackResponse.statusText}`,
        }),
        { status: slackResponse.status, headers: corsHeaders }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Edge Function error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
