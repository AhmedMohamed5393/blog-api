import { Injectable } from "@nestjs/common";
import { UserRepository } from "./repositories/user.repository";
import { User } from "./entities/user.entity";
import { FindOptionsWhere } from "typeorm";

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    public async checkExistenceByEmail(email: string) {
        return await this.userRepository.isExist({ email });
    }

    public async getUserBy(where: FindOptionsWhere<User>) {
        return await this.userRepository.findOne({
            where: where,
            select: { id: true, email: true, password: true, role: true },
        });
    }

    public async createUser(user: User) {
        return await this.userRepository.save(user);
    }
}
