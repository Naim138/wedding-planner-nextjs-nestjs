import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Payment } from "src/models/Payment.model";
import { User } from "src/models/User.model";

type PaymentPurpose = "vendor_registration" | "vendor_subscription";

const REGISTRATION_FEE = 500;
const MONTHLY_SUBSCRIPTION_FEE = 1000;

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async createVendorRegistrationPayment(userId: string) {
    return this.createPayment(userId, "vendor_registration", REGISTRATION_FEE);
  }

  async createVendorSubscriptionPayment(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException("User not found");
    if (user.role !== "vendor") throw new BadRequestException("Only vendors can pay vendor subscription");

    return this.createPayment(userId, "vendor_subscription", MONTHLY_SUBSCRIPTION_FEE);
  }

  async handleGatewayCallback(payload: Record<string, unknown>) {
    console.log("Payment Callback Received:", JSON.stringify(payload, null, 2));
    
    const status = String(payload.status || "").toLowerCase();
    const tranId = String(payload.tran_id || payload.transaction_id || "");
    const valId = String(payload.val_id || "");

    console.log("Parsed Data:", { status, tranId, valId });

    if (!tranId) {
      console.error("Transaction ID not found in callback");
      throw new BadRequestException("Transaction ID not found in callback");
    }

    const payment = await this.paymentModel.findOne({ gatewayTransactionId: tranId });
    if (!payment) {
      console.error("Payment not found for tranId:", tranId);
      throw new NotFoundException("Payment not found");
    }

    console.log("Payment found:", payment._id, "Current status:", payment.status);

    payment.callbackPayload = payload;

    if (status === "valid" || status === "success") {
      console.log("Payment successful, updating status to paid");
      payment.status = "paid";
      payment.paidAt = new Date();
      payment.gatewayTransactionId = tranId;
      await payment.save();
      console.log("Payment marked as paid, waiting for admin to activate account");
      return { msg: "Payment successful, waiting for admin to activate account", payment };
    }

    if (status === "cancelled" || status === "cancel") {
      payment.status = "cancelled";
    } else if (status === "failed" || status === "fail") {
      payment.status = "failed";
    }

    await payment.save();
    console.log("Payment status updated to:", payment.status);
    return { msg: "Payment callback received", payment };
  }

  async validateIPN(payload: Record<string, unknown>) {
    console.log("IPN Received:", JSON.stringify(payload, null, 2));
    
    const status = String(payload.status || "").toUpperCase();
    const tranId = String(payload.tran_id || "");
    const valId = String(payload.val_id || "");
    const amount = String(payload.amount || "");
    
    console.log("IPN Parsed Data:", { status, tranId, valId, amount });

    // First check if payment exists by tran_id
    const payment = await this.paymentModel.findOne({ gatewayTransactionId: tranId });
    
    if (!payment) {
      console.error("Payment not found for tranId:", tranId);
      return { msg: "Payment not found", status: "error" };
    }
    
    console.log("Payment found:", payment._id, "Current status:", payment.status);

    // If already paid, no need to process again
    if (payment.status === "paid") {
      console.log("Payment already paid, skipping");
      return { msg: "Payment already processed", payment };
    }

    // Update status based on IPN status
    if (status === "VALID") {
      console.log("IPN status is VALID, updating payment to paid");
      payment.status = "paid";
      payment.paidAt = new Date();
      payment.callbackPayload = payload;
      await payment.save();
      console.log("Payment marked as paid via IPN, waiting for admin to activate account");
      return { msg: "IPN validated, payment paid, waiting for admin to activate account", payment };
    }

    if (status === "FAILED") {
      payment.status = "failed";
      payment.callbackPayload = payload;
      await payment.save();
      console.log("Payment status updated to failed");
      return { msg: "Payment failed", payment };
    }

    if (status === "CANCELLED") {
      payment.status = "cancelled";
      payment.callbackPayload = payload;
      await payment.save();
      console.log("Payment status updated to cancelled");
      return { msg: "Payment cancelled", payment };
    }

    if (status === "EXPIRED") {
      payment.status = "expired";
      payment.callbackPayload = payload;
      await payment.save();
      console.log("Payment status updated to expired");
      return { msg: "Payment expired", payment };
    }

    console.log("IPN status unknown:", status);
    return { msg: "IPN received but status unknown", status };
  }

  async getMyPayments(userId: string) {
    return this.paymentModel.find({ user: userId }).sort({ createdAt: -1 });
  }

  async getAllPayments() {
    return this.paymentModel.find().sort({ createdAt: -1 }).populate('user', 'name email role');
  }

  async approvePayment(paymentId: string) {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    if (payment.status !== "paid") {
      throw new BadRequestException("Payment must be paid before account activation");
    }

    await this.activateVendorPayment(String(payment.user), payment.purpose as PaymentPurpose);
    
    console.log("Account activated for payment:", paymentId);
    return { msg: "Account activated", payment };
  }

  async rejectPayment(paymentId: string) {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    payment.status = "rejected";
    await payment.save();
    
    console.log("Payment rejected:", paymentId);
    return { msg: "Payment rejected", payment };
  }

  private async createPayment(userId: string, purpose: PaymentPurpose, amount: number) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException("User not found");

    const tranId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const payment = await this.paymentModel.create({
      user: userId,
      purpose,
      amount,
      gateway: "sslcommerz",
      gatewayTransactionId: tranId,
      status: "pending",
    });

    const gatewayResponse = await this.createSSLCommerzSession({
      tranId,
      amount,
      purpose,
      user,
      paymentId: String(payment._id),
    });

    payment.gatewayResponse = gatewayResponse;
    payment.paymentUrl = String(gatewayResponse.GatewayPageURL || gatewayResponse.redirect_url || "");
    await payment.save();

    if (!payment.paymentUrl) {
      throw new BadRequestException("SSLCommerz did not return a payment URL");
    }

    return {
      msg: "Payment created",
      paymentId: payment._id,
      amount,
      currency: "BDT",
      purpose,
      paymentUrl: payment.paymentUrl,
    };
  }

  private async createSSLCommerzSession(data: {
    tranId: string;
    amount: number;
    purpose: PaymentPurpose;
    user: User;
    paymentId: string;
  }) {
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
    const isSandbox = process.env.SSLCOMMERZ_IS_SANDBOX === "true";
    const sessionApi = process.env.SSLCOMMERZ_SESSION_API || "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

    console.log("SSLCommerz Config:", { storeId, isSandbox, sessionApi });

    if (!storeId || !storePassword) {
      console.error("SSLCommerz credentials missing");
      throw new BadRequestException("SSLCommerz is not configured on the server");
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";

    console.log("URL Config:", { frontendUrl, backendUrl });

    const purposeDescription = data.purpose === "vendor_registration" ? "Vendor Registration Fee" : "Monthly Subscription";

    const successUrl = `${backendUrl}/api/v1/payment/sslcommerz/success?paymentId=${data.paymentId}`;
    const failUrl = `${backendUrl}/api/v1/payment/sslcommerz/fail?paymentId=${data.paymentId}`;
    const cancelUrl = `${backendUrl}/api/v1/payment/sslcommerz/cancel?paymentId=${data.paymentId}`;
    const ipnUrl = `${backendUrl}/api/v1/payment/sslcommerz/ipn`;

    console.log("Callback URLs:", { successUrl, failUrl, cancelUrl, ipnUrl });

    const requestBody = {
      store_id: storeId,
      store_passwd: storePassword,
      total_amount: String(data.amount),
      currency: "BDT",
      tran_id: data.tranId,
      success_url: successUrl,
      fail_url: failUrl,
      cancel_url: cancelUrl,
      ipn_url: ipnUrl,
      product_name: purposeDescription,
      product_category: "Service",
      product_profile: "non-physical-goods",
      cus_name: data.user.name || "Customer",
      cus_email: data.user.email || "customer@test.com",
      cus_add1: data.user.address || "N/A",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      cus_phone: "+8801317326820",
      shipping_method: "NO",
      value_a: data.paymentId,
      value_b: data.purpose,
    };

    console.log("SSLCommerz Request Body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(sessionApi, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(requestBody).toString(),
    });

    console.log("SSLCommerz Response Status:", response.status);

    const result = await response.json().catch(() => ({}));
    
    console.log("SSLCommerz Response:", JSON.stringify(result, null, 2));
    
    if (!response.ok || result.status !== "SUCCESS") {
      console.error("SSLCommerz Error:", result?.failedreason || result?.message || "Unknown error");
      throw new BadRequestException(result?.failedreason || result?.message || "SSLCommerz session creation failed");
    }

    console.log("SSLCommerz Gateway Page URL:", result.GatewayPageURL);

    return result;
  }

  private async activateVendorPayment(userId: string, purpose: PaymentPurpose) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const update: Record<string, unknown> = {
      vendorPaymentStatus: "active",
      vendorSubscriptionStatus: "active",
      vendorSubscriptionExpiresAt: expiresAt,
    };

    if (purpose === "vendor_registration") {
      update.vendorRegistrationPaid = true;
    }

    await this.userModel.findByIdAndUpdate(userId, update);
  }
}
