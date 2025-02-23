import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../../services/AuthencationServices"; 
import Alert from "../../components/Alert";
import useDocumentTitle from "../../hooks/useDocumentTitle";
export default function AuthPage() {

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "", username: "" });
  const [alert, setAlert] = useState<{ type: "success" | "danger"; message: string } | null>(null);
  const navigate = useNavigate();
  useDocumentTitle(isLogin ? "Đăng nhập" : "Đăng ký");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const response = await AuthService.login({ email: formData.email, password: formData.password });
        if (response.token) {
          localStorage.setItem("token", response.token);
          setAlert({ type: "success", message: "Đăng nhập thành công!" });
          setTimeout(() => navigate("/admin"), 1500); // Chuyển hướng sau 1.5s
        }else
            setAlert({ type: "danger", message: "Đăng nhập thất bại!" });
      } else {
        await AuthService.register(formData);
        setAlert({ type: "success", message: "Đăng ký thành công!" });
        setIsLogin(true);
      }
    } catch (error: any) {
      setAlert({ type: "danger", message: error.response?.data?.message || "Có lỗi xảy ra!" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 bg-cover bg-center" style={{ backgroundImage: "url('/images/bg_login.jpg')" }}>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <div className="bg-white bg-opacity-90 p-12 rounded-lg shadow-lg w-2/5">
        <h2 className="text-3xl font-semibold text-center mb-6 text-blue-600">
          {isLogin ? "Đăng nhập" : "Đăng ký"}
        </h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-6">
              <label className="block text-gray-700 font-medium">Tên người dùng</label>
              <input type="text" name="username" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400" placeholder="Nhập tên người dùng" onChange={handleChange} />
            </div>
          )}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium">Email</label>
            <input type="email" name="email" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400" placeholder="Nhập email" onChange={handleChange} />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium">Mật khẩu</label>
            <input type="password" name="password" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400" placeholder="Nhập mật khẩu" onChange={handleChange} />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300 font-medium">
            {isLogin ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>
        <p className="text-center mt-6 text-gray-700">
          {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
          <button className="text-blue-500 hover:underline ml-1 font-medium" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Đăng ký" : "Đăng nhập"}
          </button>
        </p>
      </div>
    </div>
  );
}
