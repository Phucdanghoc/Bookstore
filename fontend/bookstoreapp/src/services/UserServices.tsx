import axios from "axios";
import User from "../interfaces/UserData";

const API_URL = "http://localhost:3000/api";
axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;

const UsereServices = {
    getProfile : async () => {
        return axios.get(`${API_URL}/users/profile`);
    },
    updateProfile : async (user: User) => {
        return axios.put(`${API_URL}/users/update-profile`, user);
    },
    changePassword : async (password: string) => {
        return axios.put(`${API_URL}/users/profile/change-password`, {password});
    }
};

export default UsereServices;