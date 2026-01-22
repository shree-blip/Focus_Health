import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CommunityRequestData {
  name: string;
  organization: string;
  email: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, organization, email, message }: CommunityRequestData = await req.json();

    console.log("Received community partnership request:", { name, organization, email });

    // Send email to Focus Health team using Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Focus Health <noreply@getfocushealth.com>",
        to: ["info@getfocushealth.com"],
        subject: `Community Partnership Request from ${name}`,
        html: `
          <h1>New Community Partnership Request</h1>
          <p>A new community partnership inquiry has been submitted:</p>
          <table style="border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Name:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Organization:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${organization}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email:</td>
              <td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            ${message ? `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Message:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${message}</td>
            </tr>
            ` : ''}
          </table>
          <p style="color: #666; font-size: 14px;">This request was submitted through the Focus Health website.</p>
        `,
      }),
    });

    const data = await emailResponse.json();

    console.log("Community request email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-community-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
