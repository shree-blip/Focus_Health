import { createClient } from "@supabase/supabase-js";

const url = "https://dgmkjjwmnjiefsvbhujq.supabase.co";

// Try to get service role key from env or .env.local
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publishableKey = "sb_publishable_FvuSPk5KfBlj-1EZKnmvgg_e8mznTYD";

if (!serviceKey) {
  console.log("");
  console.log("=== No SUPABASE_SERVICE_ROLE_KEY found ===");
  console.log("");
  console.log("You need to run this SQL in your Supabase Dashboard SQL Editor:");
  console.log("  Go to: https://supabase.com/dashboard/project/dgmkjjwmnjiefsvbhujq/sql/new");
  console.log("");
  console.log("--- STEP 1: Find your auth user ID ---");
  console.log(`
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'shree@focusyourfinance.com';
`);
  console.log("--- STEP 2: Insert admin user (replace YOUR_AUTH_USER_ID) ---");
  console.log(`
INSERT INTO public.lop_users (auth_user_id, email, full_name, role, is_active)
VALUES (
  'YOUR_AUTH_USER_ID',
  'shree@focusyourfinance.com',
  'Shree',
  'admin',
  true
);
`);
  console.log("--- STEP 3: Assign all facilities ---");
  console.log(`
INSERT INTO public.lop_user_facilities (user_id, facility_id)
SELECT 
  u.id, 
  f.id
FROM public.lop_users u
CROSS JOIN public.lop_facilities f
WHERE u.email = 'shree@focusyourfinance.com';
`);
  console.log("");
  console.log("Or, set SUPABASE_SERVICE_ROLE_KEY and re-run this script to do it automatically.");
  console.log("  Find it at: https://supabase.com/dashboard/project/dgmkjjwmnjiefsvbhujq/settings/api");
  console.log("");
  process.exit(0);
}

// If we have the service role key, do it automatically
const sb = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  // Find auth user
  const { data: { users } } = await sb.auth.admin.listUsers();
  const authUser = users.find(u => u.email === "info@getfocushealth.com");

  if (!authUser) {
    console.error("No auth user found with email info@getfocushealth.com");
    console.log("Available users:", users.map(u => u.email));
    process.exit(1);
  }

  console.log("Found auth user:", authUser.id, authUser.email);

  // Insert lop_user
  const { data: lopUser, error } = await sb
    .from("lop_users")
    .upsert({
      auth_user_id: authUser.id,
      email: "info@getfocushealth.com",
      full_name: "Focus Health",
      role: "admin",
      is_active: true,
    }, { onConflict: "auth_user_id" })
    .select()
    .single();

  if (error) {
    console.error("Error creating lop_user:", error.message);
    process.exit(1);
  }

  console.log("Created/updated lop_user:", lopUser.id);

  // Assign all facilities
  const { data: facilities } = await sb.from("lop_facilities").select("id, name");
  for (const fac of facilities) {
    await sb
      .from("lop_user_facilities")
      .upsert({ user_id: lopUser.id, facility_id: fac.id }, { onConflict: "user_id,facility_id" })
      .then(() => console.log("  Assigned facility:", fac.name));
  }

  console.log("\nDone! You can now refresh /lop and you should be logged in as admin.");
}

main().catch(console.error);
