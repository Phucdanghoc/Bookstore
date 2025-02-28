import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AuthService from "./services/AuthencationServices";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import BookManager from "./admin/pages/books/BooksManager";
import AuthPage from "./auth/pages/LoginPage";
import ProtectedRoute from "./router/ProtectedRoute";
import ClientLayout from "./client/ClientLayout";
import HomePage from "./client/home/HomePage";
import BooksPage from "./client/books/BookPage";
import CartPage from "./client/cart/CartPage";
import BookDetailPage from "./client/books/DetailBook";
import CheckoutPage from "./client/checkout/CheckoutPage";
import OrderDetailPage from "./client/order/DetailOrderPage";
import PaymentPage from "./client/checkout/PaymentPage";
import ProfilePage from "./client/profile/ProfilePage";
import VoucherManager from "./admin/pages/voucher/VoucherManager";
import OrderManager from "./admin/pages/orders/OrderManager";
import AdminOrderDetailPage from "./admin/pages/orders/AdminOrderDetailPage";
import UserManager from "./admin/pages/users/UserManagerPage";
import UserDetailPage from "./admin/pages/users/UserDetailPage";
import StatisticsPage from "./admin/pages/statitics/StatiticsPage";

const CheckRoleRedirect = () => {
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const result = await AuthService.verifyToken();
                setRole(result?.user?.role || null);
            } catch (error) {
                console.error("Error fetching role:", error);
                setRole(null);
            } finally {
                setLoading(false);
            }
        };

        fetchRole();
    }, []);

    if (loading) return <p>Loading...</p>;

    if (!role) return <Navigate to="/auth" replace />;
    return <Navigate to={`/${role}`} replace />;
};

const router = createBrowserRouter([
    { path: "/", element: <CheckRoleRedirect /> },
    { path: "/auth", element: <AuthPage /> },
    {
        path: "/admin",
        element: <ProtectedRoute allowedRoles={["admin"]} />,
        children: [
            {
                path: "",
                element: <AdminLayout />,
                children: [
                    { index: true, element: <Navigate to="dashboard" replace /> },
                    { path: "dashboard", element: <Dashboard /> },
                    { path: "books", element: <BookManager /> },
                    { path: "vouchers", element: <VoucherManager /> },
                    { path: "orders", element: <OrderManager /> },
                    { path: "orders/:orderId", element: <AdminOrderDetailPage /> },
                    { path: "users", element: <UserManager /> },
                    { path: "users/:id", element: <UserDetailPage /> },
                    { path: "statistics", element: <StatisticsPage /> },
                ],
            },
        ],
    },
    {
        path: "/client",
        element: <ClientLayout />,
        children: [
            { index: true, element: <Navigate to="home" replace /> },
            { path: "home", element: <HomePage /> },
            { path: "books", element: <BooksPage /> },
            { path: "books/:id", element: <BookDetailPage /> },
            {
                element: <ProtectedRoute allowedRoles={["client"]} />,
                children: [
                    { path: "cart", element: <CartPage /> },
                    { path: "orders/:orderId", element: <OrderDetailPage /> },
                    { path: "payment-result", element: <PaymentPage /> },
                    { path: "checkouts", element: <CheckoutPage /> },
                    { path: "profile", element: <ProfilePage /> },
                ],
            },
        ],
    },
]);


export default function Routes() {
    return <RouterProvider router={router} />;
}
