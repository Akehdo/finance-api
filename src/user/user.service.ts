import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateUserDto } from './dtos/create-user-dto';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async findByEmail(email: string) : Promise<User | null> {
        return this.prisma.user.findUnique({ where : { email }});
    }

    async findById(id: number ): Promise<User | null> {
        return this.prisma.user.findUnique( { where: { id }});
    }

    async createUser(dto : CreateUserDto): Promise<User> {
        return this.prisma.user.create({
            data: {
                email: dto.email,
                name: dto.name,
                password: dto.password,
            },
        });
    }
}
