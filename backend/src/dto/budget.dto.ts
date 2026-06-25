import { IsNotEmpty, IsOptional, IsNumber, IsString } from "class-validator";

export class CreateBudgetDto {
  @IsNotEmpty({ message: "Category name is required" })
  @IsString()
  category: string;

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @IsNumber()
  actualCost?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBudgetDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @IsNumber()
  actualCost?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
