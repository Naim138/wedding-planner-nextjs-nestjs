import { Body, Controller, Get, Post, Req, UseGuards, Res, Query, Param, Patch } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { PaymentService } from "./payment.service";

@Controller("/api/v1/payment")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post("/vendor-registration")
  @UseGuards(AuthGuard)
  async createVendorRegistration(@Req() req) {
    return this.paymentService.createVendorRegistrationPayment(req.user);
  }

  @Post("/vendor-subscription")
  @UseGuards(AuthGuard)
  async createVendorSubscription(@Req() req) {
    return this.paymentService.createVendorSubscriptionPayment(req.user);
  }

  @Get("/my-payments")
  @UseGuards(AuthGuard)
  async getMyPayments(@Req() req) {
    return this.paymentService.getMyPayments(req.user);
  }

  @Get("/all-payments")
  @UseGuards(AuthGuard)
  async getAllPayments(@Req() req) {
    // Check if user is admin
    const user = req.user;
    if (user.role !== "admin") {
      throw new Error("Only admins can view all payments");
    }
    return this.paymentService.getAllPayments();
  }

  @Patch("/:paymentId/activate")
  @UseGuards(AuthGuard)
  async activateAccount(@Param("paymentId") paymentId: string, @Req() req) {
    // Check if user is admin
    const user = req.user;
    if (user.role !== "admin") {
      throw new Error("Only admins can activate accounts");
    }
    return this.paymentService.approvePayment(paymentId);
  }

  @Patch("/:paymentId/reject")
  @UseGuards(AuthGuard)
  async rejectPayment(@Param("paymentId") paymentId: string, @Req() req) {
    // Check if user is admin
    const user = req.user;
    if (user.role !== "admin") {
      throw new Error("Only admins can reject payments");
    }
    return this.paymentService.rejectPayment(paymentId);
  }

  @Post("/sslcommerz/ipn")
  async sslCommerzIPN(@Body() data: Record<string, unknown>) {
    return this.paymentService.validateIPN(data);
  }

  @Post("/sslcommerz/callback")
  async sslCommerzCallback(@Body() data: Record<string, unknown>) {
    return this.paymentService.handleGatewayCallback(data);
  }

  @Post("/sslcommerz/success")
  async sslCommerzSuccess(
    @Body() data: Record<string, unknown>,
    @Query("paymentId") paymentId: string,
    @Res() res,
  ) {
    console.log("SSLCommerz Success Callback Hit:", { paymentId, data });
    try {
      await this.paymentService.handleGatewayCallback(data);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const tranId = String(data.tran_id || "");
      const status = String(data.status || "VALID");
      const valId = String(data.val_id || "");
      console.log("Redirecting to frontend:", { frontendUrl, paymentId, tranId, status });
      return res.redirect(
        `${frontendUrl}/payment/success?paymentId=${paymentId}&tran_id=${tranId}&status=${status}&val_id=${valId}`,
      );
    } catch (error) {
      console.error("Error in success callback:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/payment/error?message=${encodeURIComponent(error.message)}`);
    }
  }

  @Post("/sslcommerz/fail")
  async sslCommerzFail(
    @Body() data: Record<string, unknown>,
    @Query("paymentId") paymentId: string,
    @Res() res,
  ) {
    console.log("SSLCommerz Fail Callback Hit:", { paymentId, data });
    try {
      await this.paymentService.handleGatewayCallback(data);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const tranId = String(data.tran_id || "");
      const status = String(data.status || "FAILED");
      return res.redirect(
        `${frontendUrl}/payment/cancel?paymentId=${paymentId}&tran_id=${tranId}&status=${status}`,
      );
    } catch (error) {
      console.error("Error in fail callback:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/payment/error?message=${encodeURIComponent(error.message)}`);
    }
  }

  @Post("/sslcommerz/cancel")
  async sslCommerzCancel(
    @Body() data: Record<string, unknown>,
    @Query("paymentId") paymentId: string,
    @Res() res,
  ) {
    console.log("SSLCommerz Cancel Callback Hit:", { paymentId, data });
    try {
      await this.paymentService.handleGatewayCallback(data);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const tranId = String(data.tran_id || "");
      const status = String(data.status || "CANCELLED");
      return res.redirect(
        `${frontendUrl}/payment/cancel?paymentId=${paymentId}&tran_id=${tranId}&status=${status}`,
      );
    } catch (error) {
      console.error("Error in cancel callback:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/payment/error?message=${encodeURIComponent(error.message)}`);
    }
  }
}
