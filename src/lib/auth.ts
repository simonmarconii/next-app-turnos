import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    return user;
}

export async function requireAuthenticatedUser() {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("No autorizado");
    return user;
}

export async function requireAdmin() {
    const user = await requireAuthenticatedUser();

    if (user.app_metadata?.role !== "admin") {
        throw new Error("No autorizado");
    }

    return user;
}

export function isAdmin(user: Awaited<ReturnType<typeof getAuthenticatedUser>>) {
    return user?.app_metadata?.role === "admin";
}
