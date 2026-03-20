import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDriverDeliveryFieldsToOrders1710500000000
  implements MigrationInterface
{
  name = 'AddDriverDeliveryFieldsToOrders1710500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN "driver_id" bigint NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN "assigned_at" TIMESTAMP NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN "picked_up_at" TIMESTAMP NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN "delivered_at" TIMESTAMP NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN "driver_confirmed_delivered" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN "customer_confirmed_delivered" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD CONSTRAINT "FK_orders_driver_id_drivers_user_id"
      FOREIGN KEY ("driver_id") REFERENCES "drivers"("user_id")
      ON DELETE SET NULL
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders"
      DROP CONSTRAINT "FK_orders_driver_id_drivers_user_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      DROP COLUMN "customer_confirmed_delivered"
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      DROP COLUMN "driver_confirmed_delivered"
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      DROP COLUMN "delivered_at"
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      DROP COLUMN "picked_up_at"
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      DROP COLUMN "assigned_at"
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      DROP COLUMN "driver_id"
    `);
  }
}