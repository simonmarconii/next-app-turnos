import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { userLoginSchema } from "@/schemas/user";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const result = userLoginSchema.safeParse({ email, password });

  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error.flatten().fieldErrors }), {
      status: 400,
    });
  }

  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore);

  try {
    const { data: dataAuth, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.status === 400) {
        return new Response(JSON.stringify({ error: "Email o contraseña incorrectos" }), {
          status: 400,
        })
      } else if (error.status === 500) {
        return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
          status: 500,
        })
      }
    }

    return new Response(
      JSON.stringify({
        message: "Login successful",
        data: {
            user: dataAuth.user,
            session: dataAuth.session,
        }
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al loguear usuario:", error);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
      status: 500,
    });
  }
}
