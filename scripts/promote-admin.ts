import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2];
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email) {
    throw new Error("Uso: npm run promote-admin -- admin@example.com");
}

if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

const { data, error } = await supabase.auth.admin.listUsers();
if (error) throw error;

const user = data.users.find((item) => item.email === email);
if (!user) throw new Error(`Usuario no encontrado: ${email}`);

const result = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: {
        ...user.app_metadata,
        role: "admin",
    },
});

if (result.error) throw result.error;

console.log(`Usuario promovido a admin: ${email}`);
