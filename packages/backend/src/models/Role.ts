/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Entity, Column, PrimaryColumn } from 'typeorm';
import { id } from './util/id.js';

/**
 * ～かつ～
 * 複数の条件を同時に満たす場合のみ成立とする
 */
type CondFormulaValueAnd = {
	type: 'and';
	values: RoleCondFormulaValue[];
};

/**
 * ～または～
 * 複数の条件のうち、いずれかを満たす場合のみ成立とする
 */
type CondFormulaValueOr = {
	type: 'or';
	values: RoleCondFormulaValue[];
};

/**
 * ～ではない
 * 条件を満たさない場合のみ成立とする
 */
type CondFormulaValueNot = {
	type: 'not';
	value: RoleCondFormulaValue;
};

/**
 * ローカルユーザーのみ成立とする
 */
type CondFormulaValueIsLocal = {
	type: 'isLocal';
};

/**
 * リモートユーザーのみ成立とする
 */
type CondFormulaValueIsRemote = {
	type: 'isRemote';
};

type CondFormulaValueIsFederated = {
	type: 'isFederated';
};

type CondFormulaValueIsSubscribing = {
	type: 'isSubscribing';
};

type CondFormulaValueIsPublishing = {
	type: 'isPublishing';
};

type CondFormulaValueIsForeign = {
	type: 'isForeign';
};

type CondFormulaValueRoleAssignedTo = {
	type: 'roleAssignedTo';
	roleId: string;
};

/**
 * サスペンド済みアカウントの場合のみ成立とする
 */
type CondFormulaValueIsSuspended = {
	type: 'isSuspended';
};

/**
 * 鍵アカウントの場合のみ成立とする
 */
type CondFormulaValueIsLocked = {
	type: 'isLocked';
};

/**
 * botアカウントの場合のみ成立とする
 */
type CondFormulaValueIsBot = {
	type: 'isBot';
};

/**
 * 猫アカウントの場合のみ成立とする
 */
type CondFormulaValueIsCat = {
	type: 'isCat';
};

/**
 * 「ユーザを見つけやすくする」が有効なアカウントの場合のみ成立とする
 */
type CondFormulaValueIsExplorable = {
	type: 'isExplorable';
};

type CondFormulaValueIsMfaEnabled = {
	type: 'isMfaEnabled';
};

type CondFormulaValueIsSecurityKeyAvailable = {
	type: 'isSecurityKeyAvailable';
};

type CondFormulaValueIsUsingPwlessLogin = {
	type: 'isUsingPwlessLogin';
};

type CondFormulaValueIsNoCrawle = {
	type: 'isNoCrawle';
};

type CondFormulaValueIsNoAI = {
	type: 'isNoAI';
};

/**
 * ユーザが作成されてから指定期間経過した場合のみ成立とする
 */
type CondFormulaValueCreatedLessThan = {
	type: 'createdLessThan';
	sec: number;
};

/**
 * ユーザが作成されてから指定期間経っていない場合のみ成立とする
 */
type CondFormulaValueCreatedMoreThan = {
	type: 'createdMoreThan';
	sec: number;
};

type CondFormulaValueLoggedInLessThanOrEq = {
	type: 'loggedInLessThanOrEq';
	day: number;
};

type CondFormulaValueLoggedInMoreThanOrEq = {
	type: 'loggedInMoreThanOrEq';
	day: number;
};

/**
 * フォロワー数が指定値以下の場合のみ成立とする
 */
type CondFormulaValueFollowersLessThanOrEq = {
	type: 'followersLessThanOrEq';
	value: number;
};

/**
 * フォロワー数が指定値以上の場合のみ成立とする
 */
type CondFormulaValueFollowersMoreThanOrEq = {
	type: 'followersMoreThanOrEq';
	value: number;
};

/**
 * フォロー数が指定値以下の場合のみ成立とする
 */
type CondFormulaValueFollowingLessThanOrEq = {
	type: 'followingLessThanOrEq';
	value: number;
};

/**
 * フォロー数が指定値以上の場合のみ成立とする
 */
type CondFormulaValueFollowingMoreThanOrEq = {
	type: 'followingMoreThanOrEq';
	value: number;
};

/**
 * 投稿数が指定値以下の場合のみ成立とする
 */
type CondFormulaValueNotesLessThanOrEq = {
	type: 'notesLessThanOrEq';
	value: number;
};

/**
 * 投稿数が指定値以上の場合のみ成立とする
 */
type CondFormulaValueNotesMoreThanOrEq = {
	type: 'notesMoreThanOrEq';
	value: number;
};

type CondFormulaValueUsernameMatchOf = {
	type: 'usernameMatchOf';
	pattern: string;
};

type CondFormulaValueUsernameEntropyMoreThanOrEq = {
	type: 'usernameEntropyMoreThanOrEq';
	value: number;
};

type CondFormulaValueUsernameEntropyLessThanOrEq = {
	type: 'usernameEntropyLessThanOrEq';
	value: number;
};

type CondFormulaValueUsernameEntropyMeanMoreThanOrEq = {
	type: 'usernameEntropyMeanMoreThanOrEq';
	value: number;
};

type CondFormulaValueUsernameEntropyMeanLessThanOrEq = {
	type: 'usernameEntropyMeanLessThanOrEq';
	value: number;
};

type CondFormulaValueHostMatchOf = {
	type: 'hostMatchOf';
	pattern: string;
};

type CondFormulaValueNameMatchOf = {
	type: 'nameMatchOf';
	pattern: string;
};

type CondFormulaValueNameIsDefault = {
	type: 'nameIsDefault';
};

type CondFormulaValueEmailVerified = {
	type: 'emailVerified';
};

type CondFormulaValueEmailMatchOf = {
	type: 'emailMatchOf';
	pattern: string;
};

type CondFormulaValueAvatarUnset = {
	type: 'avatarUnset';
};

type CondFormulaValueAvatarLikelyBlurhash = {
	type: 'avatarLikelyBlurhash';
	hash: string;
	diff: number;
};

type CondFormulaValueBannerUnset = {
	type: 'bannerUnset';
};

type CondFormulaValueBannerLikelyBlurhash = {
	type: 'bannerLikelyBlurhash';
	hash: string;
	diff: number;
};

type CondFormulaValueHasTags = {
	type: 'hasTags';
};

type CondFormulaValueHashtagCountIs = {
	type: 'tagCountIs';
	value: number;
};

type CondFormulaValueHashtagCountMoreThanOrEq = {
	type: 'tagCountMoreThanOrEq';
	value: number;
};

type CondFormulaValueHashtagCountLessThan = {
	type: 'tagCountLessThan';
	value: number;
};

type CondFormulaValueHasHashtagMatchOf = {
	type: 'hasTagMatchOf';
	pattern: string;
};

export type RoleCondFormulaValue = { id: string } & (
	CondFormulaValueAnd |
	CondFormulaValueOr |
	CondFormulaValueNot |
	CondFormulaValueIsLocal |
	CondFormulaValueIsRemote |
	CondFormulaValueIsFederated |
	CondFormulaValueIsSubscribing |
	CondFormulaValueIsPublishing |
	CondFormulaValueIsForeign |
	CondFormulaValueIsSuspended |
	CondFormulaValueIsLocked |
	CondFormulaValueIsBot |
	CondFormulaValueIsCat |
	CondFormulaValueIsExplorable |
	CondFormulaValueIsMfaEnabled |
	CondFormulaValueIsSecurityKeyAvailable |
	CondFormulaValueIsUsingPwlessLogin |
	CondFormulaValueIsNoCrawle |
	CondFormulaValueIsNoAI |
	CondFormulaValueRoleAssignedTo |
	CondFormulaValueCreatedLessThan |
	CondFormulaValueCreatedMoreThan |
	CondFormulaValueLoggedInLessThanOrEq |
	CondFormulaValueLoggedInMoreThanOrEq |
	CondFormulaValueFollowersLessThanOrEq |
	CondFormulaValueFollowersMoreThanOrEq |
	CondFormulaValueFollowingLessThanOrEq |
	CondFormulaValueFollowingMoreThanOrEq |
	CondFormulaValueNotesLessThanOrEq |
	CondFormulaValueNotesMoreThanOrEq |
	CondFormulaValueUsernameMatchOf |
	CondFormulaValueUsernameEntropyMoreThanOrEq |
	CondFormulaValueUsernameEntropyLessThanOrEq |
	CondFormulaValueUsernameEntropyMeanMoreThanOrEq |
	CondFormulaValueUsernameEntropyMeanLessThanOrEq |
	CondFormulaValueHostMatchOf |
	CondFormulaValueNameMatchOf |
	CondFormulaValueNameIsDefault |
	CondFormulaValueEmailVerified |
	CondFormulaValueEmailMatchOf |
	CondFormulaValueAvatarUnset |
	CondFormulaValueAvatarLikelyBlurhash |
	CondFormulaValueBannerUnset |
	CondFormulaValueBannerLikelyBlurhash |
	CondFormulaValueHasTags |
	CondFormulaValueHashtagCountIs |
	CondFormulaValueHashtagCountMoreThanOrEq |
	CondFormulaValueHashtagCountLessThan |
	CondFormulaValueHasHashtagMatchOf
);

@Entity('role')
export class MiRole {
	@PrimaryColumn(id())
	public id: string;

	@Column('timestamp with time zone', {
		comment: 'The updated date of the Role.',
	})
	public updatedAt: Date;

	@Column('timestamp with time zone', {
		comment: 'The last used date of the Role.',
	})
	public lastUsedAt: Date;

	@Column('varchar', {
		length: 256,
	})
	public name: string;

	@Column('varchar', {
		length: 1024,
	})
	public description: string;

	@Column('varchar', {
		length: 256, nullable: true,
	})
	public color: string | null;

	@Column('varchar', {
		length: 512, nullable: true,
	})
	public iconUrl: string | null;

	@Column('enum', {
		enum: ['manual', 'conditional'],
		default: 'manual',
	})
	public target: 'manual' | 'conditional';

	@Column('jsonb', {
		default: { },
	})
	public condFormula: RoleCondFormulaValue;

	@Column('boolean', {
		default: false,
	})
	public isPublic: boolean;

	// trueの場合ユーザー名の横にバッジとして表示
	@Column('boolean', {
		default: false,
	})
	public asBadge: boolean;

	@Column('boolean', {
		default: false,
	})
	public isModerator: boolean;

	@Column('boolean', {
		default: false,
	})
	public isAdministrator: boolean;

	@Column('boolean', {
		default: false,
	})
	public isExplorable: boolean;

	@Column('boolean', {
		default: false,
	})
	public canEditMembersByModerator: boolean;

	// UIに表示する際の並び順用(大きいほど先頭)
	@Column('integer', {
		default: 0,
	})
	public displayOrder: number;

	@Column('jsonb', {
		default: { },
	})
	public policies: Record<string, {
		useDefault: boolean;
		priority: number;
		value: any;
	}>;
}
