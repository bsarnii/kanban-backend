import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBoardMembersFromCreatedBy1775909131537 implements MigrationInterface {
    name = 'CreateBoardMembersFromCreatedBy1775909131537'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create board_member table if it doesn't exist
        const tableExists = await queryRunner.hasTable('board_member');
        
        if (!tableExists) {
            await queryRunner.query(
                `CREATE TABLE \`board_member\` (
                    \`id\` varchar(36) NOT NULL,
                    \`userId\` varchar(255) NOT NULL,
                    \`boardId\` varchar(36) NOT NULL,
                    \`role\` varchar(50) NOT NULL,
                    PRIMARY KEY (\`id\`),
                    CONSTRAINT \`FK_boardId\` FOREIGN KEY (\`boardId\`) REFERENCES \`board\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
                ) ENGINE=InnoDB`
            );
        }

        // Insert BoardMember entries based on board.createdBy
        // This will create an owner entry for the user who created the board
        // The query uses a LEFT JOIN to skip if the member already exists
        await queryRunner.query(
            `INSERT INTO \`board_member\` (\`id\`, \`userId\`, \`boardId\`, \`role\`)
             SELECT 
                UUID(),
                b.\`createdBy\`,
                b.\`id\`,
                'owner'
             FROM \`board\` b
             LEFT JOIN \`board_member\` bm ON b.\`id\` = bm.\`boardId\` AND b.\`createdBy\` = bm.\`userId\`
             WHERE bm.\`id\` IS NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove BoardMember entries that were created from board.createdBy with role 'owner'
        await queryRunner.query(
            `DELETE FROM \`board_member\`
             WHERE \`role\` = 'owner' AND \`userId\` IN (
                SELECT \`createdBy\` FROM \`board\`
             )`
        );

        // Drop the board_member table
        const tableExists = await queryRunner.hasTable('board_member');
        if (tableExists) {
            await queryRunner.query(`DROP TABLE \`board_member\``);
        }
    }
}
