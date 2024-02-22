/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

type ProhibitedNoteFormulaValueNull = {
	type: undefined;
};

type ProhibitedNoteFormulaValueFalse = {
	type: 'false';
};

type ProhibitedNoteFormulaValueTrue = {
	type: 'true';
};

type ProhibitedNoteFormulaValueAnd = {
	type: 'and';
	values: ProhibitedNoteFormulaValue[];
};

type ProhibitedNoteFormulaValueOr = {
	type: 'or';
	values: ProhibitedNoteFormulaValue[];
};

type ProhibitedNoteFormulaValueNot = {
	type: 'not';
	value: ProhibitedNoteFormulaValue;
};

type ProhibitedNoteFormulaValueRoleAssignedOf = {
	type: 'roleAssignedOf';
	roleId: string;
};

type ProhibitedNoteFormulaValueHasText = {
	type: 'hasText';
};

type ProhibitedNoteFormulaValueTextMatchOf = {
	type: 'textMatchOf';
	pattern: string;
};

type ProhibitedNoteFormulaValueHasMentions = {
	type: 'hasMentions';
};

type ProhibitedNoteFormulaValueMentionCountIs = {
	type: 'mentionCountIs';
	value: number;
};

type ProhibitedNoteFormulaValueMentionCountMoreThanOrEq = {
	type: 'mentionCountMoreThanOrEq';
	value: number;
};

type ProhibitedNoteFormulaValueMentionCountLessThan = {
	type: 'mentionCountLessThan';
	value: number;
};

type ProhibitedNoteFormulaValueIsReply = {
	type: 'isReply';
};

type ProhibitedNoteFormulaValueIsQuoted = {
	type: 'isQuoted';
};

type ProhibitedNoteFormulaValueHasFiles = {
	type: 'hasFiles';
};

type ProhibitedNoteFormulaValueFileCountIs = {
	type: 'fileCountIs';
	value: number;
};

type ProhibitedNoteFormulaValueFileCountMoreThanOrEq = {
	type: 'fileCountMoreThanOrEq';
	value: number;
};

type ProhibitedNoteFormulaValueFileCountLessThan = {
	type: 'fileCountLessThan';
	value: number;
};

type ProhibitedNoteFormulaValueFileTotalSizeMoreThanOrEq = {
	type: 'fileTotalSizeMoreThanOrEq';
	size: number;
};

type ProhibitedNoteFormulaValueFileTotalSizeLessThan = {
	type: 'fileTotalSizeLessThan';
	size: number;
};

type ProhibitedNoteFormulaValueHasFileSizeMoreThanOrEq = {
	type: 'hasFileSizeMoreThanOrEq';
	size: number;
};

type ProhibitedNoteFormulaValueHasFileSizeLessThan = {
	type: 'hasFileSizeLessThan';
	size: number;
};

type ProhibitedNoteFormulaValueHasFileMD5Is = {
	type: 'hasFileMD5Is';
	hash: string;
};

type ProhibitedNoteFormulaValueHasBrowserInsafe = {
	type: 'hasBrowserInsafe';
};

type ProhibitedNoteFormulaValueHasPictures = {
	type: 'hasPictures';
};

type ProhibitedNoteFormulaValueHasLikelyBlurhash = {
	type: 'hasLikelyBlurhash';
	hash: string;
	diff: number;
};

type ProhibitedNoteFormulaValueHasHashtags = {
	type: 'hasHashtags';
};

type ProhibitedNoteFormulaValueHashtagCountIs = {
	type: 'hashtagCountIs';
	value: number;
};

type ProhibitedNoteFormulaValueHashtagCountMoreThanOrEq = {
	type: 'hashtagCountMoreThanOrEq';
	value: number;
};

type ProhibitedNoteFormulaValueHashtagCountLessThan = {
	type: 'hashtagCountLessThan';
	value: number;
};

type ProhibitedNoteFormulaValueHasHashtagMatchOf = {
	type: 'hasHashtagMatchOf';
	value: string;
};

export type ProhibitedNoteFormulaValue = (
	ProhibitedNoteFormulaValueNull |
	ProhibitedNoteFormulaValueFalse |
	ProhibitedNoteFormulaValueTrue |
	ProhibitedNoteFormulaValueAnd |
	ProhibitedNoteFormulaValueOr |
	ProhibitedNoteFormulaValueNot |
	ProhibitedNoteFormulaValueRoleAssignedOf |
	ProhibitedNoteFormulaValueHasText |
	ProhibitedNoteFormulaValueTextMatchOf |
	ProhibitedNoteFormulaValueHasMentions |
	ProhibitedNoteFormulaValueMentionCountIs |
	ProhibitedNoteFormulaValueMentionCountMoreThanOrEq |
	ProhibitedNoteFormulaValueMentionCountLessThan |
	ProhibitedNoteFormulaValueIsReply |
	ProhibitedNoteFormulaValueIsQuoted |
	ProhibitedNoteFormulaValueHasFiles |
	ProhibitedNoteFormulaValueFileCountIs |
	ProhibitedNoteFormulaValueFileCountMoreThanOrEq |
	ProhibitedNoteFormulaValueFileCountLessThan |
	ProhibitedNoteFormulaValueFileTotalSizeMoreThanOrEq |
	ProhibitedNoteFormulaValueFileTotalSizeLessThan |
	ProhibitedNoteFormulaValueHasFileSizeMoreThanOrEq |
	ProhibitedNoteFormulaValueHasFileSizeLessThan |
	ProhibitedNoteFormulaValueHasFileMD5Is |
	ProhibitedNoteFormulaValueHasBrowserInsafe |
	ProhibitedNoteFormulaValueHasPictures |
	ProhibitedNoteFormulaValueHasLikelyBlurhash |
	ProhibitedNoteFormulaValueHasHashtags |
	ProhibitedNoteFormulaValueHashtagCountIs |
	ProhibitedNoteFormulaValueHashtagCountMoreThanOrEq |
	ProhibitedNoteFormulaValueHashtagCountLessThan |
	ProhibitedNoteFormulaValueHasHashtagMatchOf
);
