import { createContext, useContext } from "react";

/** The signed-in staff member, loaded once by RequireStaff for the whole admin. */
export interface Staff {
  id: number;
  email: string | null;
  platformRole: string;
}

export const StaffContext = createContext<Staff | null>(null);

export const useStaff = (): Staff | null => useContext(StaffContext);
