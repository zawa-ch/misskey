/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { toArray } from 'stringz';

export type CharSet = '_' | '0' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';
export type EntropyTable = {
	[key in CharSet]: { [key in CharSet]: number; };
};

function to_charset(c: string): CharSet {
	if (c.length !== 1) {
		throw Error('Incorrect use of function: Expects to receive a string of exactly one character');
	}
	if (c.match(/[0-9]/)) { return '0'; }
	switch (c.toLowerCase()) {
		case 'a': return 'a';
		case 'b': return 'b';
		case 'c': return 'c';
		case 'd': return 'd';
		case 'e': return 'e';
		case 'f': return 'f';
		case 'g': return 'g';
		case 'h': return 'h';
		case 'i': return 'i';
		case 'j': return 'j';
		case 'k': return 'k';
		case 'l': return 'l';
		case 'm': return 'm';
		case 'n': return 'n';
		case 'o': return 'o';
		case 'p': return 'p';
		case 'q': return 'q';
		case 'r': return 'r';
		case 's': return 's';
		case 't': return 't';
		case 'u': return 'u';
		case 'v': return 'v';
		case 'w': return 'w';
		case 'x': return 'x';
		case 'y': return 'y';
		case 'z': return 'z';
		default: return '_';
	}
}

/**
 * 文字列の情報量を計算する
 * @param text 検査対象の文字列
 * @param entropy_table 検査のために用いるエントロピーテーブル
 * @returns 計算された文字列の情報量
 */
export function calcEntropy(text: string, entropy_table: EntropyTable): number {
	const entropy_d = toArray(text.toLowerCase().replace(/[0-9]+/g, '0').replace(/[^0a-z]+/g, '_')).reduce((p, c) => { return { previous_char: c, value: p.value + entropy_table[to_charset(p.previous_char)][to_charset(c)] }; }, { previous_char: '_', value: 0 });
	return entropy_d.value + entropy_table[to_charset(entropy_d.previous_char)]['_'];
}

export function tryToEntropyTable(value: unknown): EntropyTable | null {
	if (isEntropyTable(value)) {
		return value as EntropyTable;
	} else {
		return null;
	}
}

function isEntropyTable(value: unknown): boolean {
	return typeof(value) === 'object' && value != null && (['_', '0', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'] as CharSet[]).every((i) => { return Object.entries(value).some((p) => { return p[0] === i && isEntropyRow(p[1]);}); });
}

function isEntropyRow(value: unknown): boolean {
	return typeof(value) === 'object' && value != null && (['_', '0', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'] as CharSet[]).every((i) => { return Object.entries(value).some((p) => p[0] === i && isEntropyValue(p[1])); });
}

function isEntropyValue(value: unknown): boolean {
	return typeof(value) === 'number' && value >= 0;
}
