import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import {hash} from 'bcryptjs'


export type UserDocument = HydratedDocument<User>;


@Schema({timestamps:true,versionKey:false})
export class User{
    [x: string]: unknown;
    @Prop({required:true,trim:true,type:String})
    name:string 
    @Prop({required:true,trim:true,unique:true,lowercase:true,type:String})
    email:string 
    @Prop({required:true,trim:true,type:String}) 
    password:string 
    @Prop({type:String,required:true,enum:['user','admin','vendor']})  //enum for role validation
    role:string
    @Prop({default:'',type:String})
    address:string
    @Prop({type:Boolean,default:false})
    isEmailVerified:boolean

    @Prop({default:'',type:String})
    avatar:string

    @Prop({type:String,enum:['not_required','pending','active','expired'],default:'not_required'})
    vendorPaymentStatus:string

    @Prop({type:Boolean,default:false})
    vendorRegistrationPaid:boolean

    @Prop({type:String,enum:['inactive','active'],default:'inactive'})
    vendorSubscriptionStatus:string

    @Prop({type:Date,default:null})
    vendorSubscriptionExpiresAt:Date

    // Compatibility matching fields
    @Prop({type:Number,default:null})
    age:number

    @Prop({type:String,default:''})
    profession:string

    @Prop({type:String,enum:['Introvert','Extrovert','Ambivert']})
    personality:string

    @Prop({type:String,default:''})
    hobbies:string

    @Prop({type:String,default:''})
    values:string

    @Prop({type:String,enum:['male','female','other']})
    gender:string
}


export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save',async function(next){
    const user =this;
    if(user.isModified('password')){
        this.password = await hash(user.password, 10);
    }
    next()
})
