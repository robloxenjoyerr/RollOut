const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

import Cookies from 'js-cookie';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  let token: string | undefined

  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()

    token = cookieStore.get("login_token")?.value
  } else {
    token = Cookies.get("login_token")
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      Cookies.remove("login_token");
      window.location.href = "/login";
    }
    throw new Error("Session timed out.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error: ${response.status}`);
  }

  return response.json();
}