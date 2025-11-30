import { Module } from '@nestjs/common';
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
        const nodeEnv = configService.get('NODE_ENV');
        const isProduction = nodeEnv === 'production';

        console.log('Environment:', nodeEnv || 'development');
        console.log('Is Production:', isProduction);

        if (isProduction) {
          // Prioridad: DATABASE_URL (Estándar Vercel/Supabase) -> FINANCE_DB_POSTGRES_URL_NON_POOLING (Legacy)
          const url = configService.get('DATABASE_URL') || configService.get('FINANCE_DB_POSTGRES_URL_NON_POOLING');

          if (!url) {
            console.error('CRITICAL: No database URL found in environment variables (Production)');
            console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('DB') || k.includes('DATABASE')));
            throw new Error('DATABASE_URL is missing');
          }

          console.log('Connecting to database (Production)...');
          console.log('Using URL (masked):', url?.substring(0, 30) + '...');

          return {
            type: 'postgres',
            url: url,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true, // Cuidado en producción, idealmente false y usar migraciones
            ssl: {
              rejectUnauthorized: false, // Permite certificados auto-firmados de Supabase
            },
          };
        }

        // En desarrollo local
        console.log('Connecting to database in Development mode...');
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST') || 'localhost',
          port: configService.get<number>('DB_PORT') || 5432,
          username: configService.get<string>('DB_USERNAME') || 'postgres',
          password: configService.get<string>('DB_PASSWORD') || 'postgres',
          database: configService.get<string>('DB_NAME') || 'finance_db',
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
