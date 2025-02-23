import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { ToastContainer } from "react-toastify";

export default function AdminLayout() {
  return (
    <div className="flex h-screen">
      <ToastContainer />

      <Sidebar />
      <div className="flex flex-col flex-1 h-full  no-scrollbar ">
        <Header />
        <div className="flex-1 overflow-auto p-6 no-scrollbar bg-cover bg-center">
          <Outlet />
        </div>

      </div>
    </div>
  );
}