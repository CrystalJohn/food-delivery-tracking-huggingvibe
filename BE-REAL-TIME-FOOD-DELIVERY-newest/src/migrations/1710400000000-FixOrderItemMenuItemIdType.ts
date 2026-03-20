import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixOrderItemMenuItemIdType1710400000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_items"
        ALTER COLUMN "menu_item_id" TYPE int
        USING "menu_item_id"::int
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_items"
        ALTER COLUMN "menu_item_id" TYPE bigint
    `);
  }
}