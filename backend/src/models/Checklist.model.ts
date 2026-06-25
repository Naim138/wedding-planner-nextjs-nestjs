import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './User.model';

export type ChecklistDocument = HydratedDocument<Checklist>;

@Schema({ versionKey: false, timestamps: true })
export class Checklist {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({ type: Boolean, default: false })
  completed: boolean;

  @Prop({ type: String, default: 'General', trim: true })
  category: string;

  @Prop({ type: Date })
  dueDate?: Date;
}

export const ChecklistSchema = SchemaFactory.createForClass(Checklist);
