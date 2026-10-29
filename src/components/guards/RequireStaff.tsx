import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_CURRENT_USER } from "../../api/queries";
import { StaffContext } from "./staffContext";

/**
 * UI-only gate. Настоящая проверка — на бэке, в admin-panel.resolvers.ts
 * (requireStaff): скрытая ссылка сюда не защита, отказ всё равно придёт из
 * сервиса при любом запросе.
 */
export function RequireStaff() {
  const { data, loading, error } = useQuery(GET_CURRENT_USER);

  if (loading) return null;

  const platformRole = data?.user?.platformRole;
  if (error || !platformRole) {
    return <Navigate to="/login" replace />;
  }

  // Сотрудник уже загружен — шапка берёт его отсюда, а не вторым запросом.
  return (
    <StaffContext.Provider value={data.user}>
      <Outlet />
    </StaffContext.Provider>
  );
}
