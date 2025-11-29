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
        const isProduction = configService.get('NODE_ENV') === 'production';

        if (isProduction) {
          // Prioridad: DATABASE_URL (Estándar Vercel/Supabase) -> FINANCE_DB_POSTGRES_URL_NON_POOLING (Legacy)
          const url = configService.get('DATABASE_URL') || configService.get('FINANCE_DB_POSTGRES_URL_NON_POOLING');

          if (!url) {
            console.error('CRITICAL: No database URL found in environment variables (Production)');
            throw new Error('DATABASE_URL is missing');
          }

          console.log('Connecting to database (Production)...');

          return {
            type: 'postgres',
            url: url,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true, // Cuidado en producción, idealmente false y usar migraciones
            ssl: true,
            extra: {
              ssl: {
                rejectUnauthorized: false, // Necesario para Supabase Transaction Pooler en algunos casos
              },
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
