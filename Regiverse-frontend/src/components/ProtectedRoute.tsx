import {
Navigate,
Outlet,
} from "react-router-dom";

const ProtectedRoute = () => {

const isAuth =
localStorage.getItem("isAuth") === "true";

return isAuth
? <Outlet />
: <Navigate to="/login" />;
};

export default ProtectedRoute;
