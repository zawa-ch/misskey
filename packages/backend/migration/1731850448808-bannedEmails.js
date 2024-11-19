/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class bannedEmails1731850448808 {
	name = 'bannedEmails1731850448808'

	async up(queryRunner) {
			await queryRunner.query(`ALTER TABLE "meta" ADD "bannedEmails" character varying(1024) array NOT NULL DEFAULT '{}'`);
	}

	async down(queryRunner) {
			await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "bannedEmails"`);
	}
}
