import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './User.model';

export type BudgetDocument = HydratedDocument<Budget>;

@Schema({ versionKey: false, timestamps: true })
export class Budget {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: String, required: true, trim: true })
  category: string;

  @Prop({ type: Number, default: 0 })
  estimatedCost: number;

  @Prop({ type: Number, default: 0 })
  actualCost: number;

  @Prop({ type: String, default: '', trim: true })
  notes: string;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);
