import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { User } from "./User.model";

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true, versionKey: false })
export class Payment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  user: User;

  @Prop({ type: String, required: true, enum: ["vendor_registration", "vendor_subscription"] })
  purpose: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, default: "BDT" })
  currency: string;

  @Prop({ type: String, enum: ["pending", "paid", "failed", "cancelled"], default: "pending" })
  status: string;

  @Prop({ type: String, default: "" })
  gateway: string;

  @Prop({ type: String, default: "" })
  gatewayTransactionId: string;

  @Prop({ type: String, default: "" })
  paymentUrl: string;

  @Prop({ type: Object, default: {} })
  gatewayResponse: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  callbackPayload: Record<string, unknown>;

  @Prop({ type: Date, default: null })
  paidAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
