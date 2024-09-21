import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDTO } from "./dto/create-user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdatePutUserDTO } from "./dto/update-put-user.dto";
import { UpdatePatchUserDTO } from "./dto/update-patch-user.dto";
import * as bcrypt from 'bcrypt'
import { log } from "console";

@Injectable()
export class UserService {

    constructor(private readonly prisma: PrismaService) {}

    async create(data: CreateUserDTO) {

        data.password = data.password;

        const salt = await bcrypt.genSalt();

        data.password = await bcrypt.hash(data.password, salt);

        return this.prisma.users.create({
            data,
        });
    }

    async list() {
        return this.prisma.users.findMany();
    }

    async show(id: number) {

        await this.exists(id);

        return this.prisma.users.findUnique({
            where: {
                id,
            }
        })
    }

    async update(id: number, {name, email, password, birthAt, role}: UpdatePutUserDTO) {

        await this.exists(id);

        const salt = await bcrypt.genSalt();

        password = await bcrypt.hash(password, salt);

        return this.prisma.users.update({
            data: {name, email, password, birthAt: birthAt ? new Date(birthAt) : null, role},
            where: {
                id
            }
        })
    }

    async updatePartial(id: number, {name, email, password, birthAt, role}: UpdatePatchUserDTO) {

        await this.exists(id);

        const data: any = {};

        if(name) {
            data.name = name;
        }

        if(email) {
            data.email = email;
        }

        if(password) {
            const salt = await bcrypt.genSalt();
            data.password = await bcrypt.hash(password, salt);
        }

        if(birthAt) {
            data.birthAt = new Date(birthAt)
        }

        if(role) {
            data.role = new Date(role)
        }

        return this.prisma.users.update({
            data,
            where: {
                id
            }
        })
    }

    async delete(id: number) {

        await this.exists(id);

        return this.prisma.users.delete({
            where: {
                id
            }
        })
    }

    async exists(id: number) {
        if(!(await this.prisma.users.count({
            where: {
                id
            }
        }))) {
            throw new NotFoundException(`O usuáio ${id} não existe.`);
        }
    }
}