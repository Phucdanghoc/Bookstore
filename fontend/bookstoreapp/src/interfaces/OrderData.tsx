import { BookData } from "./BookData";

export interface CheckoutData {
    _id: string;
    userId: string;
    listCartItems: string; 
    totalPrice: number;
    voucherId?: string;
    shippingAddress: string;
    contactNumber: string;
    paymentMethod: string;
    noteOrder?: string;
}

export interface CreateOrderData {
    shippingAddress: string;
    contactNumber: string;
    paymentMethod: string;
    tokenCheckout: string;
    customerName: string;
    noteOrder ?: string;
}
export interface OrderItemData {
    _id: string;
    book: BookData;
    quantity: number;
    price: number;
}
export interface OrderData {
    _id: string;
    order_items: OrderItemData[];
    total: number;
    shipping_address: string;
    contact_number: string;
    payment_method: string;  
    noteOrder: string;
    payment_status: string;
    status: string;
    payment_code: string;
    order_date: string;
    updated_at: string;
    discount: number;
    customerName: string;
}
