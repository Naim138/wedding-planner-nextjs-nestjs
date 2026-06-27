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
    const status = String(payload.status || "").toLowerCase();
    const tranId = String(payload.tran_id || payload.transaction_id || "");
    const valId = String(payload.val_id || "");

    if (!tranId) {
      throw new BadRequestException("Transaction ID not found in callback");
    }

    const payment = await this.paymentModel.findOne({ gatewayTransactionId: tranId });
    if (!payment) throw new NotFoundException("Payment not found");

    payment.callbackPayload = payload;

    if (status === "valid" || status === "success") {
      payment.status = "paid";
      payment.paidAt = new Date();
      payment.gatewayTransactionId = tranId;
      await payment.save();
      await this.activateVendorPayment(String(payment.user), payment.purpose as PaymentPurpose);
      return { msg: "Payment verified", payment };
    }

    if (status === "cancelled" || status === "cancel") {
      payment.status = "cancelled";
    } else if (status === "failed" || status === "fail") {
      payment.status = "failed";
    }

    await payment.save();
    return { msg: "Payment callback received", payment };
  }

  async validateIPN(payload: Record<string, unknown>) {
    const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
    const valId = String(payload.val_id || "");
    
    if (!valId || !storePassword) {
      throw new BadRequestException("Invalid validation request");
    }

    const validationApi = process.env.SSLCOMMERZ_VALIDATION_API || "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";
    
    const response = await fetch(`${validationApi}?val_id=${valId}&store_id=${process.env.SSLCOMMERZ_STORE_ID}&store_passwd=${storePassword}&format=json`);
    const result = await response.json().catch(() => ({}));

    if (result.status === "VALID" || result.status === "VALIDATED") {
      const tranId = String(result.tran_id || "");
      const payment = await this.paymentModel.findOne({ gatewayTransactionId: tranId });
      
      if (payment && payment.status !== "paid") {
        payment.status = "paid";
        payment.paidAt = new Date();
        payment.callbackPayload = result;
        await payment.save();
        await this.activateVendorPayment(String(payment.user), payment.purpose as PaymentPurpose);
      }
      
      return { msg: "IPN validated", payment };
    }

    return { msg: "IPN validation failed", result };
  }

  async getMyPayments(userId: string) {
    return this.paymentModel.find({ user: userId }).sort({ createdAt: -1 });
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
