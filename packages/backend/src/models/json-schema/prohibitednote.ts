/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const packedProhibitedNoteFormulaConstantsSchema = {
	type: 'object',
	properties: {
		type: {
			type: 'string',
			nullable: false, optional: false,
			enum: ['true', 'false'],
		},
	},
} as const;

export const packedProhibitedNoteFormulaLogicsSchema = {
	type: 'object',
	properties: {
		type: {
			type: 'string',
			nullable: false, optional: false,
			enum: ['and', 'or'],
		},
		values: {
			type: 'array',
			nullable: false, optional: false,
			items: {
				ref: 'ProhibitedNoteFormulaValue',
			},
		},
	},
} as const;

export const packedProhibitedNoteFormulaNotSchema = {
	type: 'object',
	properties: {
		type: {
			type: 'string',
			nullable: false, optional: false,
			enum: ['not'],
		},
		value: {
			type: 'object',
			optional: false,
			ref: 'ProhibitedNoteFormulaValue',
		},
	},
} as const;

export const packedProhibitedNoteFormulaZeroArgSchema = {
	type: 'object',
	properties: {
		type: {
			type: 'string',
			nullable: false, optional: false,
			enum: ['hasText', 'hasMentions', 'isReply', 'isQuoted', 'hasFiles', 'hasBrowserInsafe', 'hasPictures', 'hasHashtags'],
		},
	},
} as const;

export const packedProhibitedNoteFormulaPatternMatchSchema = {
	type: 'object',
	properties: {
		type: {
			type: 'string',
			nullable: false, optional: false,
			enum: ['textMatchOf', 'hasHashtagMatchOf'],
		},
		pattern: {
			oneOf: [
				{
					type: 'string',
					nullable: false, optional: false,
				},
				{
					type: 'array',
					nullable: false, optional: false,
					items: {
						type: 'string',
						nullable: false,
					},
				},
			],
		},
	},
} as const;

export const packedProhibitedNoteFormulaAssignsRoleSchema = {
	type: 'object',
	properties: {
		type: {
			type: 'string',
			nullable: false, optional: false,
			enum: ['roleAssignedTo'],
		},
		roleId: {
			type: 'string',
			nullable: false, optional: false,
			format: 'id',
			example: 'xxxxxxxxxx',
		},
	},
} as const;

export const packedProhibitedNoteFormulaCountCompSchema = {
	type: 'object',
	properties: {
		type: {
			type: 'string',
			nullable: false, optional: false,
			enum: ['mentionCountIs', 'mentionCountMoreThanOrEq', 'mentionCountLessThan', 'fileCountIs', 'fileCountMoreThanOrEq', 'fileCountLessThan', 'hashtagCountIs', 'hashtagCountMoreThanOrEq', 'hashtagCountLessThan'],
		},
		value: {
			type: 'number',
			nullable: false, optional: false,
		},
	},
} as const;

export const packedProhibitedNoteFormulaSizeCompSchema = {
	type: 'object',
	properties: {
		type: {
			type: 'string',
			nullable: false, optional: false,
			enum: ['fileTotalSizeMoreThanOrEq', 'fileTotalSizeLessThan', 'hasFileSizeMoreThanOrEq', 'hasFileSizeLessThan'],
		},
		size: {
			type: 'number',
			nullable: false, optional: false,
		},
	},
} as const;

export const packedProhibitedNoteFormulaMD5HashMatchSchema = {
	type: 'object',
	properties: {
		type: {
			type: 'string',
			nullable: false, optional: false,
			enum: ['hasFileMD5Is'],
		},
		hash: {
			type: 'string',
			nullable: false, optional: false,
		},
	},
} as const;

export const packedProhibitedNoteFormulaBlurhashLikelySchema = {
	type: 'object',
	properties: {
		type: {
			type: 'string',
			nullable: false, optional: false,
			enum: ['hasLikelyBlurhash'],
		},
		hash: {
			type: 'string',
			nullable: false, optional: false,
		},
		diff: {
			type: 'number',
			nullable: false, optional: false,
		},
	},
} as const;

export const packedProhibitedNoteFormulaValueSchema = {
	type: 'object',
	oneOf: [
		{
			ref: 'ProhibitedNoteFormulaConstants',
		},
		{
			ref: 'ProhibitedNoteFormulaLogics',
		},
		{
			ref: 'ProhibitedNoteFormulaNot',
		},
		{
			ref: 'ProhibitedNoteFormulaZeroArg',
		},
		{
			ref: 'ProhibitedNoteFormulaPatternMatch',
		},
		{
			ref: 'ProhibitedNoteFormulaAssignsRole',
		},
		{
			ref: 'ProhibitedNoteFormulaCountComp',
		},
		{
			ref: 'ProhibitedNoteFormulaSizeComp',
		},
		{
			ref: 'ProhibitedNoteFormulaMD5HashMatch',
		},
		{
			ref: 'ProhibitedNoteFormulaBlurhashLikely',
		},
	],
} as const;
