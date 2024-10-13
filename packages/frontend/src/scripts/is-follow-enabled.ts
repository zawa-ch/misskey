/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'misskey-js';
import { $i } from '@/account.js';

export function isFollowEnabled(user: Misskey.entities.UserDetailed): boolean {
	return (user.id !== $i?.id) && !(user.isBlocking ?? false) && !(user.isBlocked ?? false) && !(user.isSuspended);
}
