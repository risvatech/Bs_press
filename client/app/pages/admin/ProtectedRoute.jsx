import { Outlet } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

export default function ProtectedRoutes() {
  return (
    <PrivateRoute>
      <Outlet /> {/* Render all nested protected routes */}
    </PrivateRoute>
  );
}
