import { Module } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AccountsModule } from './accounts/accounts.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';

        // En producción (Vercel) usamos la URL de conexión directa o pooler
        if (isProduction) {
          const url = configService.get('FINANCE_DB_POSTGRES_URL_NON_POOLING') || configService.get('DATABASE_URL') || configService.get('POSTGRES_URL');

          if (!url) {
            console.error('CRITICAL: No database URL found in environment variables (Production)');
          }

          let sslConfig: any = { rejectUnauthorized: false };
          const certPath = path.join(process.cwd(), 'prod-ca-2021.crt');

          if (fs.existsSync(certPath)) {
            try {
              const ca = fs.readFileSync(certPath).toString();
              sslConfig = {
                rejectUnauthorized: true,
                ca: ca,
              };
              console.log('SSL Certificate loaded successfully from:', certPath);
            } catch (err) {
              console.error('Error reading SSL certificate:', err);
            }
          } else {
            console.warn('SSL Certificate not found at:', certPath, 'Using insecure connection.');
          }

          return {
            type: 'postgres',
            url: url,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            ssl: sslConfig,
            extra: {
              ssl: sslConfig,
            },
          };
        }

        // En desarrollo local
        console.log('Connecting to database in Development mode...');
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
        };
      },
    }),
    UsersModule,
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
