/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class usernameEntropyTable1731424309202 {
	name = 'usernameEntropyTable1731424309202'

	async up(queryRunner) {
			await queryRunner.query(`ALTER TABLE "meta" ADD "usernameEntropyTable" jsonb`);
	}

	async down(queryRunner) {
			await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "usernameEntropyTable"`);
	}
}
