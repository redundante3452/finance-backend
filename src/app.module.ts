import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProd = configService.get<string>('NODE_ENV') === 'production';

        if (isProd) {
          return {
            type: 'postgres',
            url: configService.get<string>('FINANCE_DB_POSTGRES_URL_NON_POOLING'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: false,       // en producción, manual o migraciones
            ssl: {
              rejectUnauthorized: false  // permite certificados “self-signed” sin validación
            },
          };
        }

        // Configuración para desarrollo local
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', 'postgres'),
          database: configService.get<string>('DB_NAME', 'finance'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    // ... otros módulos
  ],
})
export class AppModule { }
