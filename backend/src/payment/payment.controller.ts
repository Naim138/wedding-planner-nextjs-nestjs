import { Body, Controller, Get, Post, Req, UseGuards, Res, Query } from "@nestjs/common";
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
    await this.paymentService.handleGatewayCallback(data);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const tranId = String(data.tran_id || "");
    const status = String(data.status || "VALID");
    const valId = String(data.val_id || "");
    return res.redirect(
      `${frontendUrl}/payment/success?paymentId=${paymentId}&tran_id=${tranId}&status=${status}&val_id=${valId}`,
    );
  }

  @Post("/sslcommerz/fail")
  async sslCommerzFail(
    @Body() data: Record<string, unknown>,
    @Query("paymentId") paymentId: string,
    @Res() res,
  ) {
    await this.paymentService.handleGatewayCallback(data);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const tranId = String(data.tran_id || "");
    const status = String(data.status || "FAILED");
    return res.redirect(
      `${frontendUrl}/payment/cancel?paymentId=${paymentId}&tran_id=${tranId}&status=${status}`,
    );
  }

  @Post("/sslcommerz/cancel")
  async sslCommerzCancel(
    @Body() data: Record<string, unknown>,
    @Query("paymentId") paymentId: string,
    @Res() res,
  ) {
    await this.paymentService.handleGatewayCallback(data);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const tranId = String(data.tran_id || "");
    const status = String(data.status || "CANCELLED");
    return res.redirect(
      `${frontendUrl}/payment/cancel?paymentId=${paymentId}&tran_id=${tranId}&status=${status}`,
    );
  }
}
