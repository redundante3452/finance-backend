import { IsNotEmpty, IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
    @ApiProperty({ example: 'Billetera Principal', description: 'Nombre de la cuenta' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'EFECTIVO', description: 'Tipo de cuenta (EFECTIVO, BANCO, etc)' })
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty({ example: 0, description: 'Balance inicial', required: false })
    @IsNumber()
    @IsOptional()
    balance?: number;

    @ApiProperty({ example: 'COP', description: 'Moneda de la cuenta', required: false })
    @IsString()
    @IsOptional()
    currency?: string;

    @ApiProperty({ example: 'uuid-user-id', description: 'ID del usuario propietario' })
    @IsUUID()
    @IsNotEmpty()
    userId: string;
}
