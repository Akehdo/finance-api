import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { TransactionsModule } from './transactions/transactions.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    TransactionsModule],
})
export class AppModule {}
