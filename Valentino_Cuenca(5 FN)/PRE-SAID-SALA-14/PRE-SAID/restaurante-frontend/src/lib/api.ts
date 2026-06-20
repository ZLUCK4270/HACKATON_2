const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function api<T = any>(
  endpoint: string,
  options?: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: any;
  }
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const method = options?.method || "GET";

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (options?.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = `API Error: ${response.status} ${response.statusText}`;
    throw new Error(error);
  }

  // Para DELETE que retorna 204 No Content
  if (response.status === 204) {
    return null as any;
  }

  return response.json();
}
