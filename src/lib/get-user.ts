import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getUser() {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}