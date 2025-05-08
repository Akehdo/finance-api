import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { LoginDto } from './dtos/login.dto';
import { RefreshDto } from './dtos/refresh.dto';
import { LogoutDto } from './dtos/logout.dto';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto, userAgent: string) {
        const existingUser = await this.userService.findByEmail(dto.email);
        
        if(existingUser) {
            throw new BadRequestException("Пользователь с таким email уже существует");
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.userService.createUser({
            email: dto.email,
            name: dto.name,
            password: hashedPassword,
        });

        return await this.generateAndSaveTokens(user.id, user.email, userAgent);


    }

    async login(dto: LoginDto, userAgent: string){
        const user = await this.userService.findByEmail(dto.email);
        if(!user){
            throw new UnauthorizedException('Неверные учетные данные');
        }

        const isMatch = await bcrypt.compare(dto.password, user.password);
        if(!isMatch){
            throw new UnauthorizedException('Неверные учетные данные');
        }
        

        return await this.generateAndSaveTokens(user.id, user.email, userAgent);

    }

    async refresh(dto: RefreshDto, userAgent: string){
        const TokenInDb = await this.prisma.refreshToken.findFirst({
            where: { 
                userId: dto.userId,
                token: dto.refreshToken,
                userAgent,
            },
        });

        if(!TokenInDb){
            throw new UnauthorizedException('Refresh token not found');
        }

        try {
            await this.jwtService.verifyAsync(dto.refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
        } catch(err) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const user = await this.userService.findById(dto.userId);
        if(!user) {
            throw new UnauthorizedException('User not found');
        }

        await this.prisma.refreshToken.deleteMany({
            where: { 
                userId: dto.userId,
                userAgent,
             },
        });

        return await this.generateAndSaveTokens(user.id, user.email, userAgent);


    }

    async logout(dto: LogoutDto, userAgent: string){
        await this.prisma.refreshToken.deleteMany({
            where: { 
                userId: dto.userId,
                userAgent,
             },
        });

        return { message: 'Logged out successfully' };
    }


    private async generateAndSaveTokens(userId: number, email: string, userAgent: string) {
        const payload = { sub: userId, email };
    
        await this.prisma.refreshToken.deleteMany({
            where: {
                userId,
                userAgent,
            },
        });
    
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_SECRET,
                expiresIn: process.env.JWT_EXPIRES_IN,
            }),
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
            }),
        ]);
    
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userAgent,
                userId,
            },
        });
    
        return {
            accessToken,
            refreshToken,
        };
    }
    

}
