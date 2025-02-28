import axios from "axios";
import { he } from "date-fns/locale";


const URL_API = "http://localhost:3000/api";

const CommentService = {
    addComment: async (bookId: string, content: string) => {
        return await axios.post(`${URL_API}/comments`, { bookId, content } ,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }); 
    },
    getCommentsByBookId: async (bookId: string) => {
        return await axios.get(`${URL_API}/comments/${bookId}`, 

        );  
    },
    deleteComment: async (commentId: string) => {
        return await axios.delete(`${URL_API}/comments/${commentId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }); 
    },
    getCommentsByAuthor: async (bookId: string) => {
        return await axios.get(`${URL_API}/comments/byAuthor/${bookId}` ,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }); 
    },
};

export default CommentService;
