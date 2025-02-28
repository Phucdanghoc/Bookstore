import axios from 'axios';
const URL_API = "http://localhost:3000/api/statistics";
axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
const StatisticsServices = {
    totalRevenue: async () => {
        const response = await axios.get(`${URL_API}/total-revenue`);
        return response.data;
    },
    orderStatusStats: async () => {
        const response = await axios.get(`${URL_API}/order-status-stats`);
        return response.data;
    },
    dailyStatistics: async (month: number, year: number) => {
        return await axios.get(`${URL_API}/daily-statistics?month=${month}&year=${year}`);
    },
    totalBooksSold: async () => {
        const response = await axios.get(`${URL_API}/total-products-sold`);
        return response.data;
    },
    revenueByDate: async (start : any, end : any) => {
        const response = await axios.get(`${URL_API}/revenue-by-date?startDate=${start}&endDate=${end}`);
        return response.data;
    },
    
};
export default StatisticsServices;