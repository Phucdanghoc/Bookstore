interface VoucherData {
    _id: string;
    code: string;
    discount: number;
    status: string;
    min_order_value: number;
    expired_date: string;
    created_at: string;
}
export default VoucherData;