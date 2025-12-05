import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceType } from '../entities/outing-account.entity';

export class CreateOutingAccountDto {
  @ApiProperty({ example: 'Bolos', description: 'Nombre de la cuenta' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: true, description: 'Si la cuenta tiene servicio' })
  @IsBoolean()
  hasService: boolean;

  @ApiProperty({
    enum: ServiceType,
    required: false,
    example: ServiceType.PERCENTAGE,
  })
  @IsEnum(ServiceType)
  @IsOptional()
  serviceType?: ServiceType;

  @ApiProperty({
    example: 10,
    required: false,
    description: 'Valor del servicio (% o monto)',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  serviceValue?: number;
}
