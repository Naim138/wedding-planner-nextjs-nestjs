import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './User.model';

export type MatchmakerDocument = HydratedDocument<Matchmaker>;

@Schema({ versionKey: false, timestamps: true })
export class Matchmaker {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: Object, required: true })
  partner1: {
    name: string;
    gender: string;
    style: string;
    budget: string;
    focus: string;
    guests: string;
  };

  @Prop({ type: Object, required: true })
  partner2: {
    name: string;
    gender: string;
    style: string;
    budget: string;
    focus: string;
    guests: string;
  };

  @Prop({ type: Number, required: true })
  compatibilityScore: number;

  @Prop({ type: [String], default: [] })
  matches: string[];

  @Prop({ type: [String], default: [] })
  compromises: string[];

  @Prop({ type: String, required: true })
  recommendation: string;
}

export const MatchmakerSchema = SchemaFactory.createForClass(Matchmaker);
