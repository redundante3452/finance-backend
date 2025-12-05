import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Cerveza', description: 'Nombre del producto' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 8000, description: 'Precio unitario' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 1, description: 'Cantidad' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'ID del participante que consumió' })
  @IsUUID()
  participantId: string;
}
