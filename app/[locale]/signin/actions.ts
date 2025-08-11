"use server"

import { signIn } from "@/auth"

export async function authenticate(callbackUrl?: string) {
  await signIn("google", { 
    redirectTo: callbackUrl || "/"
  })
}