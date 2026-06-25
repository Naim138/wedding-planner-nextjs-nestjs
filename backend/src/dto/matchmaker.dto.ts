import { IsNotEmpty, IsObject } from "class-validator";

export class PartnerPreference {
  name: string;
  gender: string;
  style: string;
  budget: string;
  focus: string;
  guests: string;
}

export class CreateMatchmakerDto {
  @IsNotEmpty()
  @IsObject()
  partner1: PartnerPreference;

  @IsNotEmpty()
  @IsObject()
  partner2: PartnerPreference;
}
