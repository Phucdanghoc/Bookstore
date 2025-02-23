import { BookData } from "./BookData";

interface CartItem {
    _id: string,
    book: BookData,
    quantity: number,
    price: number,
    selected: boolean,
}

interface Checkout {
    cartItems: string[],
    voucherCode: string,
}
export type {
    CartItem,
    Checkout
};