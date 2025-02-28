import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import StatisticsServices from "../../../services/StatiticsServices";

const StatisticsPage = () => {
  const today = new Date().toISOString().split("T")[0];
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [startDate, setStartDate] = useState(today);
  const [barData, setBarData] = useState([]);
  const [endDate, setEndDate] = useState(today);
  const [activeFilter, setActiveFilter] = useState("today");

  useEffect(() => {
    fetchDailyStatistics(startDate, endDate);
  }, []);

  const fetchDailyStatistics = async (start: any, end: any) => {
    try {
      const response = await StatisticsServices.revenueByDate(start, end);
      setTotalOrders(
        response.stats.reduce((sum: any, day: any) => sum + day.orderCount, 0)
      );
      setTotalRevenue(
        response.stats.reduce((sum: any, day: any) => sum + day.totalRevenue, 0)
      );
      setDailyRevenue(
        response.stats.map((day: any) => ({ date: day._id, revenue: day.totalRevenue }))
      );
      setBarData(response.stats.map((day: any) => ({
        date: day._id,
        orders: day.orderCount,
        revenue: day.totalRevenue,
        booksSold: day.totalQuantity
      })));
    } catch (error) {
      console.error("Lỗi khi lấy thống kê hàng ngày", error);
    }
  };

  const handleFilter = (range: any) => {
    setActiveFilter(range);
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (range) {
      case "today":
        break;
      case "yesterday":
        start.setDate(today.getDate() - 1);
        end.setDate(today.getDate() - 1);
        break;
      case "last7days":
        start.setDate(today.getDate() - 7);
        break;
      case "thisMonth":
        start.setDate(1);
        break;
      default:
        return;
    }

    const formattedStart = start.toISOString().split("T")[0];
    const formattedEnd = end.toISOString().split("T")[0];
    setStartDate(formattedStart);
    setEndDate(formattedEnd);
    fetchDailyStatistics(formattedStart, formattedEnd);
  };
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
  };
  
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="text-gray-700 font-semibold">{`Ngày: ${label}`}</p>
          {payload.map((entry) => (
            <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.dataKey === "revenue" ? formatCurrency(entry.value as number) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Thống kê doanh thu</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        {[{ label: "Hôm nay", value: "today" },
        { label: "Hôm qua", value: "yesterday" },
        { label: "7 ngày qua", value: "last7days" },
        { label: "Tháng này", value: "thisMonth" }].map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleFilter(value)}
            className={`px-4 py-2 rounded-lg transition duration-300 ${activeFilter === value
              ? "bg-blue-700 text-white"
              : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-6">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded-lg shadow-sm"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded-lg shadow-sm"
        />
        <button
          onClick={() => fetchDailyStatistics(startDate, endDate)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
        >
          Áp dụng
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Tổng doanh thu</h2>
          <p className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString()} VND</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Tổng đơn hàng</h2>
          <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Doanh thu theo ngày</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Đơn hàng & Sách bán theo ngày</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
              <Bar dataKey="orders" fill="#3B82F6" textAnchor="middle"  />
              <Bar dataKey="booksSold" fill="#8B5CF6" textAnchor="middle" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatisticsPage;
