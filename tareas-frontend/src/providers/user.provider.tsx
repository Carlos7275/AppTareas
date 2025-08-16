import { createContext, useContext, useState, type ReactNode } from "react";
import type { Usuarios } from "../models/usuarios.model";

interface UserContextType {
  usuario: Usuarios | null;
  setUsuario: (usuario: Usuarios) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuarios | null>(null);

  return (
    <UserContext.Provider value={{ usuario, setUsuario }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
