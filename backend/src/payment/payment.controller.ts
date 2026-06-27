import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
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
}
