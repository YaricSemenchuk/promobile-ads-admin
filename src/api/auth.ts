import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URI,
  withCredentials: true,
});

export const login = async (email: string, password: string): Promise<boolean> => {
  const response = await client.post(
    "auth/login",
    { email, password },
    { headers: { Accept: "application/json, text/plain, */*", "Content-Type": "application/json" } },
  );
  return response.status === 200 || response.status === 201;
};

export const checkAuth = async (): Promise<boolean> => {
  try {
    const response = await client.get("auth/check");
    return response.status === 200;
  } catch {
    return false;
  }
};

export const logout = async (): Promise<void> => {
  await client.get("auth/logout").catch(() => undefined);
};

/**
 * Войти в основное приложение владельцем воркспейса.
 *
 * Эндпоинт был написан задолго до этой админки и до сих пор не использовался.
 * Он подменяет куку сессии на клиентскую, поэтому админская сессия в этой
 * вкладке после вызова заканчивается — здесь это осознанно: возврат обратно
 * делает кнопка ReturnToAdmin в основном приложении, а не эта.
 */
export const loginAsClient = async (userId: number): Promise<boolean> => {
  const response = await client.post(
    "auth/admin-login-to-client",
    { userId },
    { headers: { "Content-Type": "application/json" } },
  );
  return response.status === 200 || response.status === 201;
};
