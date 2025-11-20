import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'Juan Perez', description: 'Nombre completo del usuario' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'juan@example.com', description: 'Correo electrónico único' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'password123', description: 'Contraseña segura', minLength: 6 })
    @IsString()
    @MinLength(6)
    password: string;
}
