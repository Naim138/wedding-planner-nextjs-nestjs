import { CanActivate, ExecutionContext, Injectable ,UnauthorizedException} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt'; 
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/models/User.model';

@Injectable()
export class AuthGuard implements CanActivate {


  constructor(private readonly jwtService:JwtService, @InjectModel(User.name) private readonly userModel:Model<User>){}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
          try{
 
                const request = context.switchToHttp().getRequest()
                const auth_token = request.headers['authorization'] ||''

                if(!auth_token || !auth_token.startsWith("Bearer ")){
                  throw new UnauthorizedException("No Authorization Token")
                }
                const token = auth_token.split(" ")[1]
                if(!token){
                  throw new UnauthorizedException("Invalid Authorization Token")
                }
                const payload = this.jwtService.verify(token)
                
                // Fetch full user object from database
                const user = await this.userModel.findById(payload.userId).select('-password');
                if (!user) {
                  throw new UnauthorizedException("User not found");
                }
                
                request.user = user;
                request.type = payload.type;

            return true;
          }
          catch(e){
              throw new UnauthorizedException(e.message)
          }


  }
}
