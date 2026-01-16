import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-revenuecat-secret',
};

// RevenueCat event types that grant premium access
const PREMIUM_GRANT_EVENTS = [
  'INITIAL_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'NON_RENEWING_PURCHASE',
];

// RevenueCat event types that revoke premium access
const PREMIUM_REVOKE_EVENTS = [
  'EXPIRATION',
  'CANCELLATION',
  'BILLING_ISSUE',
];

interface RevenueCatEvent {
  type: string;
  app_user_id: string;
  entitlement_id?: string;
  product_id?: string;
}

interface RevenueCatWebhookBody {
  event: RevenueCatEvent;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('[RevenueCat Webhook] Method not allowed:', req.method);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Verify webhook secret
    const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
    const providedSecret = req.headers.get('x-revenuecat-secret');

    if (!webhookSecret) {
      console.error('[RevenueCat Webhook] REVENUECAT_WEBHOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!providedSecret || providedSecret !== webhookSecret) {
      console.error('[RevenueCat Webhook] Invalid or missing webhook secret');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the webhook body
    const body: RevenueCatWebhookBody = await req.json();
    const event = body.event;

    console.log('[RevenueCat Webhook] Received event:', {
      type: event.type,
      app_user_id: event.app_user_id,
      entitlement_id: event.entitlement_id,
      product_id: event.product_id,
    });

    // Validate required fields
    if (!event.type || !event.app_user_id) {
      console.error('[RevenueCat Webhook] Missing required fields:', { event });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type or app_user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine if we should grant or revoke premium
    let isPremium: boolean | null = null;
    
    if (PREMIUM_GRANT_EVENTS.includes(event.type)) {
      isPremium = true;
      console.log('[RevenueCat Webhook] Granting premium to user:', event.app_user_id);
    } else if (PREMIUM_REVOKE_EVENTS.includes(event.type)) {
      isPremium = false;
      console.log('[RevenueCat Webhook] Revoking premium from user:', event.app_user_id);
    } else {
      console.log('[RevenueCat Webhook] Unhandled event type:', event.type);
      return new Response(
        JSON.stringify({ message: 'Event type not handled', event_type: event.type }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the user's profile
    const { data, error } = await supabase
      .from('profiles')
      .update({
        is_premium: isPremium,
        revenuecat_entitlement: isPremium ? (event.entitlement_id || 'premium') : null,
      })
      .eq('id', event.app_user_id)
      .select();

    if (error) {
      console.error('[RevenueCat Webhook] Database update error:', error);
      return new Response(
        JSON.stringify({ error: 'Database update failed', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data || data.length === 0) {
      console.warn('[RevenueCat Webhook] User not found in profiles:', event.app_user_id);
      return new Response(
        JSON.stringify({ warning: 'User not found', app_user_id: event.app_user_id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[RevenueCat Webhook] Successfully updated user:', {
      user_id: event.app_user_id,
      is_premium: isPremium,
      entitlement: event.entitlement_id,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User ${isPremium ? 'granted' : 'revoked'} premium access`,
        user_id: event.app_user_id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[RevenueCat Webhook] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
