"use client";

import Button from "./button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error during logout:", error.message);
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Unexpected error during logout:", error);
    }
  }

  return (
    <Button variant="secondary" size="small" onClick={handleLogout}>
      Cerrar sesión
    </Button>
  );
}

export default LogoutButton;
