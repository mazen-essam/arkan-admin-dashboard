import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem("token"); // replace with your actual logic

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="w-full min-h-screen">
      {/* Optional layout components like Header can go here */}
      <Outlet />
    </div>
  );
};

export default ProtectedRoute;
