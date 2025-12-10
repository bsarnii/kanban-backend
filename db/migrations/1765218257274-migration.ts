import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1765218257274 implements MigrationInterface {
    name = 'Migration1765218257274'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`emailVerified\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`status\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`boardId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`board\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdBy\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`subtask\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`completed\` tinyint NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`taskId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`task\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`orderIndex\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`boardId\` varchar(36) NULL, \`statusId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`status\` ADD CONSTRAINT \`FK_b04aa8033132c9ff7b70b770a76\` FOREIGN KEY (\`boardId\`) REFERENCES \`board\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`subtask\` ADD CONSTRAINT \`FK_8209040ec2c518c62c70cd382dd\` FOREIGN KEY (\`taskId\`) REFERENCES \`task\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`task\` ADD CONSTRAINT \`FK_d88edac9d7990145ff6831a7bb3\` FOREIGN KEY (\`boardId\`) REFERENCES \`board\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`task\` ADD CONSTRAINT \`FK_02068239bb8d5b2fc7f3ded618c\` FOREIGN KEY (\`statusId\`) REFERENCES \`status\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task\` DROP FOREIGN KEY \`FK_02068239bb8d5b2fc7f3ded618c\``);
        await queryRunner.query(`ALTER TABLE \`task\` DROP FOREIGN KEY \`FK_d88edac9d7990145ff6831a7bb3\``);
        await queryRunner.query(`ALTER TABLE \`subtask\` DROP FOREIGN KEY \`FK_8209040ec2c518c62c70cd382dd\``);
        await queryRunner.query(`ALTER TABLE \`status\` DROP FOREIGN KEY \`FK_b04aa8033132c9ff7b70b770a76\``);
        await queryRunner.query(`DROP TABLE \`task\``);
        await queryRunner.query(`DROP TABLE \`subtask\``);
        await queryRunner.query(`DROP TABLE \`board\``);
        await queryRunner.query(`DROP TABLE \`status\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
    }

}
