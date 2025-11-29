import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProd = configService.get<string>('NODE_ENV') === 'production';

        if (isProd) {
          // Leer certificado CA
          const ca = readFileSync(join(__dirname, 'ca.pem'));

          return {
            type: 'postgres',
            url: configService.get<string>('FINANCE_DB_POSTGRES_URL_NON_POOLING'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: false,
            ssl: {
              rejectUnauthorized: false,  // exige que el certificado sea válido
              ca: ca,
            },
          };
        }

        // configuración local...
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
