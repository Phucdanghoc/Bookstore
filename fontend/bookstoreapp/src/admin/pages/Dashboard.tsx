import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import StatisticsServices from "../../services/StatiticsServices";
import OrderServices from "../../services/OrderServices";
import { useNavigate } from "react-router-dom";
import { OrderData } from "../../interfaces/OrderData";
import { set } from "date-fns";
const DashboardPage = () => {
  const [totalProductsSold, setTotalProductsSold] = useState(0);
  const [weeklyRevenue, setWeeklyRevenue] = useState([]);
  const [weeklyOrders, setWeeklyOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState<OrderData[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    fetchWeeklyStatistics();
    fetchRecentOrders();
  }, []);



  const fetchWeeklyStatistics = async () => {
    try {
      const today = new Date();
      const start = new Date();
      start.setDate(today.getDate() - 6);

      const formattedStart = start.toISOString().split("T")[0];
      const formattedEnd = today.toISOString().split("T")[0];

      const response = await StatisticsServices.revenueByDate(formattedStart, formattedEnd);
      setWeeklyRevenue(response.stats.map((day: any) => ({ date: day._id, revenue: day.totalRevenue })));
      setWeeklyOrders(response.stats.map((day: any) => ({ date: day._id, orders: day.orderCount })));
    } catch (error) {
      console.error("Lỗi khi lấy thống kê theo tuần", error);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await OrderServices.orderCurrentDay(5, 1);
      console.log("Dữ liệu đơn hàng từ API:", response); // Kiểm tra dữ liệu trả về
      setRecentOrders(response.orders || []); // Đảm bảo recentOrders luôn là mảng
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng gần đây", error);
      setRecentOrders([]); 
    }
  };
  const totalQuantityOrder = (order : OrderData) => {
    return order.order_items.reduce((sum, item) => sum + item.quantity, 0);
  } 
  const totalPriceToDay = recentOrders.reduce((total, order) => total + order.total - order.discount, 0);
  useEffect(() => {
    setTotalProductsSold(recentOrders.reduce((total, order) => total + totalQuantityOrder(order), 0));
  }, [recentOrders]); 
    return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📊 Bảng điều khiển</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard title="📋 Tổng đơn hàng" value={recentOrders.length} color="text-blue-600" />
        <StatCard title="💰 Doanh thu hôm nay" value={`${totalPriceToDay.toLocaleString()} VND`} color="text-green-600" />
        <StatCard title="📦 Sản phẩm đã bán" value={totalProductsSold} color="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ChartCard title="📅 Doanh thu theo tuần">
          <LineChartComponent data={weeklyRevenue} dataKey="revenue" stroke="#4F46E5" />
        </ChartCard>
        <ChartCard title="📊 Đơn hàng theo tuần">
          <BarChartComponent data={weeklyOrders} dataKey="orders" fill="#3B82F6" />
        </ChartCard>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Đơn hàng hôm nay</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">Mã đơn</th>
              <th className="p-2">Khách hàng</th>
              <th className="p-2">Sản phẩm</th>
              <th className="p-2">Tổng tiền</th>
              <th className="p-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.map((order: any) => (
                <tr key={order.id} className="border-b hover:bg-gray-100">
                  <td onClick={() => navigate(`/admin/orders/${order._id}`)} className="p-2 font-semibold text-blue-600 hover:underline">#{order._id}</td>
                  <td className="p-2">{order.customerName}</td>
                  <td className="p-2">{totalQuantityOrder(order)} sản phẩm</td>
                  <td className="p-2">{order.total ? (order.total - order.discount).toLocaleString()  : "0"} VND</td>
                  <td className={`p-2 font-semibold ${order.status === "delivered" ? "text-green-600" : "text-red-600"}`}>
                    {order.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-500">Không có đơn hàng nào hôm nay.</td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }: { title: string; value: string | number; color: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
    <h2 className={`text-lg font-semibold text-gray-700`}>{title}</h2>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const LineChartComponent = ({ data, dataKey, stroke }: any) => (
  <ResponsiveContainer width="100%" height={250}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
);

// Component hiển thị biểu đồ BarChart
const BarChartComponent = ({ data, dataKey, fill }: any) => (
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Bar dataKey={dataKey} fill={fill} />
    </BarChart>
  </ResponsiveContainer>
);

// Component Card chứa biểu đồ
const ChartCard = ({ title, children }: any) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-lg font-semibold mb-4 text-gray-700">{title}</h2>
    {children}
  </div>
);

export default DashboardPage;
