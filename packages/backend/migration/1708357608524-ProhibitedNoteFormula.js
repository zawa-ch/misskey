/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class ProhibitedNoteFormula1708357608524 {
	name = 'ProhibitedNoteFormula1708357608524'

	async up(queryRunner) {
			await queryRunner.query(`ALTER TABLE "meta" ADD "prohibitedNotePattern" jsonb NOT NULL DEFAULT '{}'`);
	}

	async down(queryRunner) {
			await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "prohibitedNotePattern"`);
	}
}
