import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOutingDto {
  @ApiProperty({
    example: 'Viernes con amigos',
    description: 'Nombre de la salida',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
