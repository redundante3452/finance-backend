import { IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePayerDto {
  @ApiProperty({ description: 'ID del participante que pagó' })
  @IsUUID()
  participantId: string;

  @ApiProperty({ example: 20000, description: 'Monto pagado' })
  @IsNumber()
  @Min(0)
  amount: number;
}
