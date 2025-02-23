import { Outlet, Navigate, useLocation } from "react-router-dom";
import AuthService from "../services/AuthencationServices";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
    allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const result = await AuthService.verifyToken();
                if (result?.user?.role) {
                    setUserRole(result.user.role);
                } else {
                    setUserRole(null);
                }
            } catch (error) {
                console.error("Auth error:", error);
                setUserRole(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Hiển thị loading khi đang kiểm tra xác thực
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-lg font-semibold">Loading...</p>
            </div>
        );
    }

    console.log("User Role:", userRole);

    if (!userRole) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }
    if (!allowedRoles.includes(userRole)) {
        return <Navigate to={location.state?.from?.pathname || "/"} replace />;
    }


    return <Outlet />;
};

export default ProtectedRoute;
