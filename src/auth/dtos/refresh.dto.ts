import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class RefreshDto{
    @IsNumber()
    userId: number;
  
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}