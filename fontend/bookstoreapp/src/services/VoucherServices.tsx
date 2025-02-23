import axios from "axios";
import VoucherData from "../interfaces/VoucherData";

const URL_API = "http://localhost:3000/api/vouchers";
const token = localStorage.getItem("token");
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
const VoucherServices = {
    getAllVouchers: async (
        page: number = 1,
        limit: number = 10,
        active: string = 'active',
    ) => {
        return axios.get(URL_API, {
            params: { page, limit , active  },
            // headers: {
            //     Authorization: `Bearer ${token}`,
            // },
        });
    },
    searchVouchers: async (
        search: string,
        page: number = 1,
        limit: number = 10,
        status: string,
    ) => {
        return axios.get(URL_API + "/search", {
            params: { search, page, limit, status },
            // headers: {
            //     Authorization: `Bearer ${token}`,
            // },
        });
    },

    getAllVouncersByStatus: async (status: string) => {
        return axios.get(URL_API, {
            params: { status: status },
            // headers: {
            //     Authorization: `Bearer ${token}`,
            // },
        });
    },


    getVoucherById: async (id: string) => {
        return axios.get(`${URL_API}/${id}`);
    },

    createVoucher: async (voucher: VoucherData) => {
        return axios.post(URL_API, voucher);
    },

    updateVoucher: async (id: string, voucher: VoucherData) => {
        return axios.put(`${URL_API}/${id}`, voucher);
    },

    deleteVoucher: async (id: string) => {
        return axios.delete(`${URL_API}/${id}`);
    },
    getVoucherByCode: async (code: string) => {
        return axios.get(`${URL_API}/code/${code}`);
    },
};

export default VoucherServices;