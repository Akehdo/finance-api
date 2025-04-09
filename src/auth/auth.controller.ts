import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshDto } from './dtos/refresh.dto';
import { LogoutDto } from './dtos/logout.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body()dto: RegisterDto, @Req() req) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.authService.register(dto, userAgent);
  }

  @Post('login')
    login(@Body() dto: LoginDto, @Req() req){
      const userAgent = req.headers['user-agent'] || 'unknown';
      return this.authService.login(dto, userAgent);
    }

    @Post('refresh')
    refresh(@Body() dto: RefreshDto, @Req() req){
      const userAgent = req.headers['user-agent'] || 'unknown';
      return this.authService.refresh(dto, userAgent);
    }

    @Post('logout')
    logout(@Body() dto: LogoutDto, @Req() req){
      const userAgent = req.headers['user-agent'] || 'unknown';
      return this.authService.logout(dto, userAgent);
    }
    
}
