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

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get("GMAIL_CLIENT_ID");
  const clientSecret = Deno.env.get("GMAIL_CLIENT_SECRET");
  const refreshToken = Deno.env.get("GMAIL_REFRESH_TOKEN");

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google credentials not configured");
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }).toString(),
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json();
    const errorCode = errorData.error || "unknown";
    const errorDescription = errorData.error_description || "No description provided";

    console.error(`Google OAuth Token Refresh Failed:
Status: ${tokenResponse.status} ${tokenResponse.statusText}
Error Code: ${errorCode}
Error Description: ${errorDescription}
Hint: Check if GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, or GMAIL_REFRESH_TOKEN is incorrect`);

    throw new Error(
      `Failed to refresh access token: [${errorCode}] ${errorDescription}`
    );
  }

  const { access_token } = await tokenResponse.json();
  return access_token;
}

async function createCalendarEvent(
  booking: BookingPayload,
  accessToken: string
): Promise<void> {
  const [year, month, day] = booking.date.split("-");
  const [hour, minute] = booking.time.split(":");

  const startTime = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour),
    parseInt(minute)
  );

  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

  const event = {
    summary: `[${booking.service}] ${booking.customer}`,
    description: booking.address ? `주소: ${booking.address}` : "주소 없음",
    start: {
      dateTime: startTime.toISOString(),
      timeZone: "Asia/Seoul",
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: "Asia/Seoul",
    },
  };

  const calendarResponse = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(event),
    }
  );

  if (!calendarResponse.ok) {
    const errorData = await calendarResponse.json();
    throw new Error(
      `Failed to create calendar event: ${errorData.error?.message}`
    );
  }
}

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

    const accessToken = await getAccessToken();
    await createCalendarEvent(booking, accessToken);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Calendar Edge Function error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
