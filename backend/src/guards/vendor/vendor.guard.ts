import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { User } from 'src/models/User.model';

@Injectable()
export class VendorGuard implements CanActivate {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
      try {
          
        const request = context.switchToHttp().getRequest();
        if(request.type!=="vendor"){
          throw new UnauthorizedException("Only Vendors can access this Route")   
        }

        const user = await this.userModel.findById(request.user).select("vendorPaymentStatus vendorSubscriptionStatus vendorSubscriptionExpiresAt");
        if(!user){
          throw new UnauthorizedException("Vendor account not found")
        }

        const isExpired = user.vendorSubscriptionExpiresAt && new Date(user.vendorSubscriptionExpiresAt) < new Date();
        if(user.vendorPaymentStatus !== "active" || user.vendorSubscriptionStatus !== "active" || isExpired){
          throw new UnauthorizedException("Vendor payment or subscription is not active")
        }

        return true;
      } catch (error) {
            throw new UnauthorizedException(error?.message || "User Can not access This Route")
      }
  }
}
