import { IsNotEmpty, IsOptional, IsBoolean, IsString } from "class-validator";

export class CreateChecklistDto {
  @IsNotEmpty({ message: "Title is required" })
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  dueDate?: string;
}

export class UpdateChecklistDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  dueDate?: string;
}
