import { IsNumber } from "class-validator";

export class LogoutDto {
    @IsNumber()
    userId: number;
}