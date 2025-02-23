import { useEffect, useState } from "react";
import { Trash, Plus, Minus } from "lucide-react";
import { CartItem } from "../../interfaces/CartData";
import VoucherInCart from "./components/VoucherCart";
import { useNavigate } from "react-router-dom";
import CartServices from "../../services/CartServices";
import VoucherData from "../../interfaces/VoucherData";
import { toast } from "react-toastify";
const URL_API = "http://localhost:3000";


export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const navigate = useNavigate();
  const [voucherSelected, setVoucherSelected] = useState<VoucherData | null>(null);
  const [cartItemCheck, setCartItemCheck] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    try {
      CartServices.getCart().then((response) => {
        setCart(response.cart.cart_items);
      });
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
    }
  }, []);


  const handleCheckout = async () => {
    try {
      setLoading(true); // Bắt đầu tiến trình
      const response = await CartServices.checkOut(
        cartItemCheck,
        voucherSelected?._id || ""
      );
      console.log(response);

      if (response.status == 200) {
        navigate("/client/checkouts?token=" + response.data.token);
      }
      else {
        toast.error("Đặt hàng thất bại!");
      }
    } catch (error) {
      toast.error("Đặt hàng thất bại!");
    } finally {
      setLoading(false); // Kết thúc tiến trình
    }
  };



  const handleRemoveItem = async (itemId: string) => {
    try {
      const response = await CartServices.removeFromCart(itemId);
      if (response == 200) {
        toast.success("Xóa khỏi giỏ hàng thành công!");
        setCart(cart.filter((item) => item._id !== itemId));
        setCartItemCheck(cartItemCheck.filter((item) => item !== itemId));
      } else {
        toast.error("Xóa khỏi giỏ hàng thất bại!");
      }

    } catch (error) {
      toast.error("Xóa khỏi giỏ hàng thất bại!");
    }
  };

  const handleQuantityChange = async (itemId: string, type: "add" | "minus") => {
    try {
      const updatedCart = cart.map((item) => {
        if (item._id === itemId) {
          const newQuantity = type === "add" ? item.quantity + 1 : Math.max(1, item.quantity - 1);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      const itemToUpdate = updatedCart.find((item) => item._id === itemId);
      if (!itemToUpdate) return;
      const response = await CartServices.updateCartItem(itemId, itemToUpdate.quantity);
      if (response.status == 200) {
        setCart(updatedCart);
        toast.success("Cập nhật giỏ hàng thành công!");
      } else if (response.status == 400) {
        toast.error("Số lượng không đủ!");
      }
      else {
        toast.error("Số lượng không đủ!");
      }
    } catch (error) {
      toast.error("Số lượng không đủ!");
    }
  };


  const handleToggleCheckbox = (itemId: string) => {
    setCart(
      cart.map((item) =>
        item._id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
    setCartItemCheck(cartItemCheck.includes(itemId) ? cartItemCheck.filter((item) => item !== itemId) : [...cartItemCheck, itemId]);
  };

  const selectedItems = cart.filter(item => item.selected);
  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0);

  return (
    <div className="container mx-auto p-2">
      <h1 className="text-2xl mb-6 font-bold text-white">Giỏ Hàng ({cart.length})</h1>
      <div className="flex space-x-4">
        <div className="w-9/12">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500">
              <p className="text-xl">Chưa có giỏ hàng nào</p>
              <button
                className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                onClick={() => navigate("/client/books")}
              >
                Hãy mua sách
              </button>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[600px] no-scrollbar min-h-[400px]">

              <div className="flex items-center p-4 bg-gray-200 font-semibold rounded-lg shadow-md">
                <div className="w-10 text-center"></div>
                <div className="w-40 text-center">Hình ảnh</div>
                <div className="flex-grow">Tên sách</div>
                <div className="w-40 text-center">Số lượng</div>
                <div className="w-32 text-center">Thành tiền</div>
                <div className="w-20 text-center">Xóa</div>
              </div>
              {cart.map((item) => (
                <div key={item._id} className="flex items-center p-4 border-b bg-white rounded-lg shadow-lg">
                  <input
                    type="checkbox"
                    checked={item.selected || false}
                    onChange={() => handleToggleCheckbox(item._id)}
                    className="mr-4 transform scale-150 w-10 text-center"
                  />

                  <div className="w-30 h-40 mr-4">
                    <img
                      src={`${URL_API}${item.book.images[0]}`}
                      alt={item.book.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex-grow">
                    <div className="font-medium text-xl">{item.book.title}</div>
                    <div className="text-lg text-gray-500">Tác giả: {item.book.author}</div>
                    <div className="text-lg text-gray-500">Nhà xuất bản: {item.book.publisher}</div>
                    <div className="text-blue-500 font-bold text-lg">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.book.price)}
                    </div>
                  </div>



                  <div className="w-40 flex items-center justify-center">
                    <button
                      onClick={() => handleQuantityChange(item._id, "minus")}
                      className="bg-gray-300 text-black rounded-full w-8 h-8 flex justify-center items-center mr-2"
                    >
                      <Minus size={16} />
                    </button>

                    <div className="text-sm mx-2 pe-2">{item.quantity}</div>

                    <button
                      onClick={() => handleQuantityChange(item._id, "add")}
                      className="bg-gray-300 text-black rounded-full w-8 h-8 flex justify-center items-center"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="w-32 text-center text-green-600 font-bold">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.book.price * item.quantity)}
                  </div>

                  <div className="w-20 flex justify-center">
                    <button onClick={() => handleRemoveItem(item._id)} className="text-red-500 hover:text-red-700">
                      <Trash size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        <div className="w-3/12">
          <VoucherInCart totalPrice={totalPrice} onVoucherApplied={setVoucherSelected} />
        </div>
      </div>

      {cartItemCheck.length > 0 && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow-md flex justify-between items-center">
          <div className="text-left">
            <h2 className="text-xl font-semibold">Tổng tiền</h2>
            <div className="mt-4">
              <p className="text-lg">
                Tổng sản phẩm: <span className="font-bold text-red-500">{totalQuantity} sản phẩm</span>
              </p>

              <p className="text-lg">
                Tổng tiền:
                {voucherSelected ? (
                  <>
                    <span className="font-bold text-gray-500 line-through"> {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice)}</span>
                    <span className="font-bold text-blue-500 ml-2">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice - voucherSelected.discount)}
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-blue-500"> {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice)}</span>
                )}
              </p>

              {voucherSelected && (
                <p className="text-sm text-green-500 mt-2">
                  Đã áp dụng voucher: {voucherSelected.code} - Giảm: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(voucherSelected.discount)}
                </p>
              )}
            </div>

          </div>

          <div className="flex justify-end">
            <button
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
              onClick={handleCheckout}
              disabled={loading} // Disable nút khi đang loading
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                "Tiến Hành Thanh Toán"
              )}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
