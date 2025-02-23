const { verify } = require("jsonwebtoken");
const { VNPay } = require("vnpay");


const vnpayConfig = {
    tmnCode: 'BMEHOAEM',
    secureSecret: 'OO6JZSB1IQXM4XRQCTCAK12HRDKMG1A3',
    vnpayHost: "https://sandbox.vnpayment.vn",
    testMode: true,

};

const vnpayInstance = new VNPay(vnpayConfig);

const PaymentService = {
    generatePaymentUrl: async (paymentData, req) => {
        try {
            console.log("Payment data:", paymentData);
            
            const payUrl = vnpayInstance.buildPaymentUrl({
                vnp_Amount: Math.floor(paymentData.amount),
                vnp_IpAddr: req.clientIp || req.ip,
                vnp_TxnRef: `ORDER_${Date.now()}`,
                vnp_OrderInfo: paymentData.orderInfo,
                vnp_OrderType: "other",
                vnp_BankCode: paymentData.bankCode,
                vnp_ReturnUrl: `http://localhost:3000/api/orders/vnpay-return`,
                vnp_Locale: "vn",
            });
            return payUrl;
        } catch (error) {
            console.error("Payment creation error:", error);
            return null;
        }
    },
    verifyReturnUrl: async (urlReturned) => {
        try {
      
            const vpnReturn = vnpayInstance.verifyReturnUrl(urlReturned);
            return vpnReturn;
        } catch (error) {
            console.error("Return URL verification error:", error);
            return null;
        }
    },
}


module.exports = PaymentService;