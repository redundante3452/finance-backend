import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateParticipantDto {
  @ApiProperty({ example: 'Juan', description: 'Nombre del participante' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
