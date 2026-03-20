import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActiveCartUniqueIndex1710300000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_one_active_cart_per_customer"
      ON "carts" ("customer_id")
      WHERE "status" = 'ACTIVE'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "UQ_one_active_cart_per_customer"
    `);
  }
}