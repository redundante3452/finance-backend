import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const isProd = config.get('NODE_ENV') === 'production';

        if (isProd) {
          console.log('🟢 Connecting to Supabase (Prod)');

          return {
            type: 'postgres',
            url: config.get<string>('FINANCE_DB_POSTGRES_URL_NON_POOLING'),
            autoLoadEntities: true,
            synchronize: false,

            ssl: {
              rejectUnauthorized: false, // ⭐ necesario para Vercel
            },
          };
        }

        console.log('🔵 Connecting locally (Dev)');
        return {
          type: 'postgres',
          host: config.get('DB_HOST', 'localhost'),
          port: config.get('DB_PORT', 5432),
          username: config.get('DB_USERNAME', 'postgres'),
          password: config.get('DB_PASSWORD', 'postgres'),
          database: config.get('DB_NAME', 'finance'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
  ],
})
export class AppModule { }
