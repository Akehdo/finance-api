import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { TransactionsModule } from './transactions/transactions.module';
import * as redisStore from 'cache-manager-ioredis';
import { QueuesModule } from './queues/queues.module';
import { BullModule } from '@nestjs/bull';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST',),
        port: config.get<number>('REDIS_PORT',),
        ttl: 30, 
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async(config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        },
      })
    }),
    QueuesModule,
    AuthModule,
    UserModule,
    PrismaModule,
    TransactionsModule, ],
    
})
export class AppModule {}
