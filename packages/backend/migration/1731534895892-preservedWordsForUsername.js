/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class preservedWordsForUsername1731534895892 {
	name = 'preservedWordsForUsername1731534895892'

	async up(queryRunner) {
			await queryRunner.query(`ALTER TABLE "meta" ADD "preservedWordsForUsername" character varying(1024) array NOT NULL DEFAULT '{}'`);
	}

	async down(queryRunner) {
			await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "preservedWordsForUsername"`);
	}
}
