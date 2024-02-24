/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { decode } from 'blurhash';
import { MiNote } from '@/models/Note.js';
import { MiDriveFile } from '@/models/DriveFile.js';
import { bindThis } from '@/decorators.js';
import type { ProhibitedNoteFormulaValue } from '@/models/ProhibitedNoteFormula.js';
import { MiUser } from '@/models/User.js';
import { FILE_TYPE_BROWSERSAFE } from '@/const.js';
import { MiRole } from '@/models/Role.js';
import { RoleService } from './RoleService.js';
import { MetaService } from './MetaService.js';
import { UtilityService } from './UtilityService.js';

type InspectionSubject = {
	userId: MiUser['id'];
	text: string | null;
	reply: MiNote | null;
	renote: MiNote | null;
	files: MiDriveFile[] | null;
	mentions: { username: string; host: string | null; }[];
	hashtags: string[];
};

@Injectable()
export class NoteProhibitService {
	constructor(
		private metaService: MetaService,
		private roleService: RoleService,
		private utilityService: UtilityService,
	) {
	}

	@bindThis
	public async isProhibitedNote(subject: InspectionSubject): Promise<boolean> {
		const formula = (await this.metaService.fetch()).prohibitedNotePattern;
		if (formula.type) {
			const roles = await this.roleService.getUserRoles(subject.userId);
			const bhash = subject.files?.filter(v => v.blurhash != null).map(v => { try { return decode(v.blurhash ?? '', 5, 5); } catch (e) { return null; }}).filter(v => v != null).map(v => v as Uint8ClampedArray) ?? [];
			return this.evalcond(subject, roles, bhash, formula);
		} else {
			return false;
		}
	}

	@bindThis
	private evalcond(subject: InspectionSubject, roles: MiRole[], blurhashes: Uint8ClampedArray[], formula: ProhibitedNoteFormulaValue): boolean {
		try {
			switch (formula.type) {
				case 'true': {
					return true;
				}
				case 'false': {
					return false;
				}
				case 'and': {
					return formula.values.every(v => this.evalcond(subject, roles, blurhashes, v));
				}
				case 'or': {
					return formula.values.some(v => this.evalcond(subject, roles, blurhashes, v));
				}
				case 'not': {
					return !this.evalcond(subject, roles, blurhashes, formula.value);
				}
				case 'roleAssignedOf': {
					return roles.some(r => r.id === formula.roleId);
				}
				case 'hasText': {
					return subject.text != null;
				}
				case 'textMatchOf': {
					return this.utilityService.isKeyWordIncluded(subject.text ?? '', Array.isArray(formula.pattern) ? formula.pattern : [formula.pattern]);
				}
				case 'hasMentions': {
					return subject.reply ? true : subject.mentions.length > 0;
				}
				case 'mentionCountIs': {
					return (subject.mentions.length) === formula.value;
				}
				case 'mentionCountMoreThanOrEq': {
					return (subject.mentions.length) >= formula.value;
				}
				case 'mentionCountLessThan': {
					return (subject.mentions.length) < formula.value;
				}
				case 'isReply': {
					return subject.reply != null;
				}
				case 'isQuoted': {
					return subject.renote != null;
				}
				case 'hasFiles': {
					return subject.files ? subject.files.length > 0 : false;
				}
				case 'fileCountIs': {
					return (subject.files ? subject.files.length : 0) === formula.value;
				}
				case 'fileCountMoreThanOrEq': {
					return (subject.files ? subject.files.length : 0) >= formula.value;
				}
				case 'fileCountLessThan': {
					return (subject.files ? subject.files.length : 0) < formula.value;
				}
				case 'fileTotalSizeMoreThanOrEq': {
					return (subject.files?.reduce((p, f) => p + f.size, 0) ?? 0) >= formula.size;
				}
				case 'fileTotalSizeLessThan': {
					return (subject.files?.reduce((p, f) => p + f.size, 0) ?? 0) < formula.size;
				}
				case 'hasFileSizeMoreThanOrEq': {
					return subject.files?.some(f => f.size >= formula.size) ?? false;
				}
				case 'hasFileSizeLessThan': {
					return subject.files?.some(f => f.size < formula.size) ?? true;
				}
				case 'hasFileMD5Is': {
					return subject.files?.some(f => f.md5 === formula.hash) ?? false;
				}
				case 'hasBrowserInsafe': {
					return subject.files?.some(f => !FILE_TYPE_BROWSERSAFE.some(t => f.type === t)) ?? false;
				}
				case 'hasPictures': {
					return subject.files?.some(f => f.type.startsWith('image/')) ?? false;
				}
				case 'hasLikelyBlurhash': {
					try {
						const k = decode(formula.hash, 5, 5);
						return blurhashes.some(h => h.reduce((v, j, n) => v + (j >= k[n] ? j - k[n] : k[n] - j), 0) <= formula.diff);
					} catch (e) {
						return false;
					}
				}
				case 'hasHashtags': {
					return subject.hashtags.length > 0;
				}
				case 'hashtagCountIs': {
					return (subject.hashtags.length) === formula.value;
				}
				case 'hashtagCountMoreThanOrEq': {
					return (subject.hashtags.length) >= formula.value;
				}
				case 'hashtagCountLessThan': {
					return (subject.hashtags.length) < formula.value;
				}
				case 'hasHashtagMatchOf': {
					return (subject.hashtags).some(h => this.utilityService.isKeyWordIncluded(h, Array.isArray(formula.pattern) ? formula.pattern : [formula.pattern]));
				}
				default:
					return false;
			}
		} catch (err) {
			// TODO: log error
			return false;
		}
	}
}
