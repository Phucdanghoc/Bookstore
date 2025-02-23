import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import { ToastContainer } from "react-toastify";

export default function ClientLayout() {
    return (
        <div className="flex h-screen">
            <ToastContainer />

            <div className="flex flex-col flex-1 h-full overflow-hidden no-scrollbar relative">
                <div className="absolute inset-0 bg-[url(/images/bg_blue.png)] bg-cover bg-center bg-no-repeat filter blur-sm z-0" />
                <Header />
                <div className="relative z-5 flex-1 overflow-auto p-6 no-scrollbar">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
