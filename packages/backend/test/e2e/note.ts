/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

process.env.NODE_ENV = 'test';

import * as assert from 'assert';
import { expect } from '@jest/globals';
import { MiNote } from '@/models/Note.js';
import { MAX_NOTE_TEXT_LENGTH } from '@/const.js';
import { api, initTestDb, post, signup, uploadFile, uploadUrl } from '../utils.js';
import type * as misskey from 'misskey-js';

describe('Note', () => {
	let Notes: any;

	let alice: misskey.entities.SignupResponse;
	let bob: misskey.entities.SignupResponse;
	let tom: misskey.entities.SignupResponse;

	beforeAll(async () => {
		const connection = await initTestDb(true);
		Notes = connection.getRepository(MiNote);
		alice = await signup({ username: 'alice' });
		bob = await signup({ username: 'bob' });
		tom = await signup({ username: 'tom', host: 'example.com' });
	}, 1000 * 60 * 2);

	test('投稿できる', async () => {
		const post = {
			text: 'test',
		};

		const res = await api('/notes/create', post, alice);

		assert.strictEqual(res.status, 200);
		assert.strictEqual(typeof res.body === 'object' && !Array.isArray(res.body), true);
		assert.strictEqual(res.body.createdNote.text, post.text);
	});

	test('ファイルを添付できる', async () => {
		const file = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/Lenna.jpg');

		const res = await api('/notes/create', {
			fileIds: [file.id],
		}, alice);

		assert.strictEqual(res.status, 200);
		assert.strictEqual(typeof res.body === 'object' && !Array.isArray(res.body), true);
		assert.deepStrictEqual(res.body.createdNote.fileIds, [file.id]);
	}, 1000 * 10);

	test('他人のファイルで怒られる', async () => {
		const file = await uploadUrl(bob, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/Lenna.jpg');

		const res = await api('/notes/create', {
			text: 'test',
			fileIds: [file.id],
		}, alice);

		assert.strictEqual(res.status, 400);
		assert.strictEqual(res.body.error.code, 'NO_SUCH_FILE');
		assert.strictEqual(res.body.error.id, 'b6992544-63e7-67f0-fa7f-32444b1b5306');
	}, 1000 * 10);

	test('存在しないファイルで怒られる', async () => {
		const res = await api('/notes/create', {
			text: 'test',
			fileIds: ['000000000000000000000000'],
		}, alice);

		assert.strictEqual(res.status, 400);
		assert.strictEqual(res.body.error.code, 'NO_SUCH_FILE');
		assert.strictEqual(res.body.error.id, 'b6992544-63e7-67f0-fa7f-32444b1b5306');
	});

	test('不正なファイルIDで怒られる', async () => {
		const res = await api('/notes/create', {
			fileIds: ['kyoppie'],
		}, alice);
		assert.strictEqual(res.status, 400);
		assert.strictEqual(res.body.error.code, 'NO_SUCH_FILE');
		assert.strictEqual(res.body.error.id, 'b6992544-63e7-67f0-fa7f-32444b1b5306');
	});

	test('返信できる', async () => {
		const bobPost = await post(bob, {
			text: 'foo',
		});

		const alicePost = {
			text: 'bar',
			replyId: bobPost.id,
		};

		const res = await api('/notes/create', alicePost, alice);

		assert.strictEqual(res.status, 200);
		assert.strictEqual(typeof res.body === 'object' && !Array.isArray(res.body), true);
		assert.strictEqual(res.body.createdNote.text, alicePost.text);
		assert.strictEqual(res.body.createdNote.replyId, alicePost.replyId);
		assert.strictEqual(res.body.createdNote.reply.text, bobPost.text);
	});

	test('renoteできる', async () => {
		const bobPost = await post(bob, {
			text: 'test',
		});

		const alicePost = {
			renoteId: bobPost.id,
		};

		const res = await api('/notes/create', alicePost, alice);

		assert.strictEqual(res.status, 200);
		assert.strictEqual(typeof res.body === 'object' && !Array.isArray(res.body), true);
		assert.strictEqual(res.body.createdNote.renoteId, alicePost.renoteId);
		assert.strictEqual(res.body.createdNote.renote.text, bobPost.text);
	});

	test('引用renoteできる', async () => {
		const bobPost = await post(bob, {
			text: 'test',
		});

		const alicePost = {
			text: 'test',
			renoteId: bobPost.id,
		};

		const res = await api('/notes/create', alicePost, alice);

		assert.strictEqual(res.status, 200);
		assert.strictEqual(typeof res.body === 'object' && !Array.isArray(res.body), true);
		assert.strictEqual(res.body.createdNote.text, alicePost.text);
		assert.strictEqual(res.body.createdNote.renoteId, alicePost.renoteId);
		assert.strictEqual(res.body.createdNote.renote.text, bobPost.text);
	});

	test('引用renoteで空白文字のみで構成されたtextにするとレスポンスがtext: nullになる', async () => {
		const bobPost = await post(bob, {
			text: 'test',
		});
		const res = await api('/notes/create', {
			text: ' ',
			renoteId: bobPost.id,
		}, alice);

		assert.strictEqual(res.status, 200);
		assert.strictEqual(res.body.createdNote.text, null);
	});

	test('visibility: followersでrenoteできる', async () => {
		const createRes = await api('/notes/create', {
			text: 'test',
			visibility: 'followers',
		}, alice);

		assert.strictEqual(createRes.status, 200);

		const renoteId = createRes.body.createdNote.id;
		const renoteRes = await api('/notes/create', {
			visibility: 'followers',
			renoteId,
		}, alice);

		assert.strictEqual(renoteRes.status, 200);
		assert.strictEqual(renoteRes.body.createdNote.renoteId, renoteId);
		assert.strictEqual(renoteRes.body.createdNote.visibility, 'followers');

		const deleteRes = await api('/notes/delete', {
			noteId: renoteRes.body.createdNote.id,
		}, alice);

		assert.strictEqual(deleteRes.status, 204);
	});

	test('文字数ぎりぎりで怒られない', async () => {
		const post = {
			text: '!'.repeat(MAX_NOTE_TEXT_LENGTH), // 65536文字
		};
		const res = await api('/notes/create', post, alice);
		assert.strictEqual(res.status, 200);
	});

	test('文字数オーバーで怒られる', async () => {
		const post = {
			text: '!'.repeat(MAX_NOTE_TEXT_LENGTH + 1), // 65537文字
		};
		const res = await api('/notes/create', post, alice);
		assert.strictEqual(res.status, 400);
	});

	test('存在しないリプライ先で怒られる', async () => {
		const post = {
			text: 'test',
			replyId: '000000000000000000000000',
		};
		const res = await api('/notes/create', post, alice);
		assert.strictEqual(res.status, 400);
	});

	test('存在しないrenote対象で怒られる', async () => {
		const post = {
			renoteId: '000000000000000000000000',
		};
		const res = await api('/notes/create', post, alice);
		assert.strictEqual(res.status, 400);
	});

	test('不正なリプライ先IDで怒られる', async () => {
		const post = {
			text: 'test',
			replyId: 'foo',
		};
		const res = await api('/notes/create', post, alice);
		assert.strictEqual(res.status, 400);
	});

	test('不正なrenote対象IDで怒られる', async () => {
		const post = {
			renoteId: 'foo',
		};
		const res = await api('/notes/create', post, alice);
		assert.strictEqual(res.status, 400);
	});

	test('存在しないユーザーにメンションできる', async () => {
		const post = {
			text: '@ghost yo',
		};

		const res = await api('/notes/create', post, alice);

		assert.strictEqual(res.status, 200);
		assert.strictEqual(typeof res.body === 'object' && !Array.isArray(res.body), true);
		assert.strictEqual(res.body.createdNote.text, post.text);
	});

	test('同じユーザーに複数メンションしても内部的にまとめられる', async () => {
		const post = {
			text: '@bob @bob @bob yo',
		};

		const res = await api('/notes/create', post, alice);

		assert.strictEqual(res.status, 200);
		assert.strictEqual(typeof res.body === 'object' && !Array.isArray(res.body), true);
		assert.strictEqual(res.body.createdNote.text, post.text);

		const noteDoc = await Notes.findOneBy({ id: res.body.createdNote.id });
		assert.deepStrictEqual(noteDoc.mentions, [bob.id]);
	});

	describe('添付ファイル情報', () => {
		test('ファイルを添付した場合、投稿成功時にファイル情報入りのレスポンスが帰ってくる', async () => {
			const file = await uploadFile(alice);
			const res = await api('/notes/create', {
				fileIds: [file.body.id],
			}, alice);

			assert.strictEqual(res.status, 200);
			assert.strictEqual(typeof res.body === 'object' && !Array.isArray(res.body), true);
			assert.strictEqual(res.body.createdNote.files.length, 1);
			assert.strictEqual(res.body.createdNote.files[0].id, file.body.id);
		});

		test('ファイルを添付した場合、タイムラインでファイル情報入りのレスポンスが帰ってくる', async () => {
			const file = await uploadFile(alice);
			const createdNote = await api('/notes/create', {
				fileIds: [file.body.id],
			}, alice);

			assert.strictEqual(createdNote.status, 200);

			const res = await api('/notes', {
				withFiles: true,
			}, alice);

			assert.strictEqual(res.status, 200);
			assert.strictEqual(Array.isArray(res.body), true);
			const myNote = res.body.find((note: { id: string; files: { id: string }[] }) => note.id === createdNote.body.createdNote.id);
			assert.notEqual(myNote, null);
			assert.strictEqual(myNote.files.length, 1);
			assert.strictEqual(myNote.files[0].id, file.body.id);
		});

		test('ファイルが添付されたノートをリノートした場合、タイムラインでファイル情報入りのレスポンスが帰ってくる', async () => {
			const file = await uploadFile(alice);
			const createdNote = await api('/notes/create', {
				fileIds: [file.body.id],
			}, alice);

			assert.strictEqual(createdNote.status, 200);

			const renoted = await api('/notes/create', {
				renoteId: createdNote.body.createdNote.id,
			}, alice);
			assert.strictEqual(renoted.status, 200);

			const res = await api('/notes', {
				renote: true,
			}, alice);

			assert.strictEqual(res.status, 200);
			assert.strictEqual(Array.isArray(res.body), true);
			const myNote = res.body.find((note: { id: string }) => note.id === renoted.body.createdNote.id);
			assert.notEqual(myNote, null);
			assert.strictEqual(myNote.renote.files.length, 1);
			assert.strictEqual(myNote.renote.files[0].id, file.body.id);
		});

		test('ファイルが添付されたノートに返信した場合、タイムラインでファイル情報入りのレスポンスが帰ってくる', async () => {
			const file = await uploadFile(alice);
			const createdNote = await api('/notes/create', {
				fileIds: [file.body.id],
			}, alice);

			assert.strictEqual(createdNote.status, 200);

			const reply = await api('/notes/create', {
				replyId: createdNote.body.createdNote.id,
				text: 'this is reply',
			}, alice);
			assert.strictEqual(reply.status, 200);

			const res = await api('/notes', {
				reply: true,
			}, alice);

			assert.strictEqual(res.status, 200);
			assert.strictEqual(Array.isArray(res.body), true);
			const myNote = res.body.find((note: { id: string }) => note.id === reply.body.createdNote.id);
			assert.notEqual(myNote, null);
			assert.strictEqual(myNote.reply.files.length, 1);
			assert.strictEqual(myNote.reply.files[0].id, file.body.id);
		});

		test('ファイルが添付されたノートへの返信をリノートした場合、タイムラインでファイル情報入りのレスポンスが帰ってくる', async () => {
			const file = await uploadFile(alice);
			const createdNote = await api('/notes/create', {
				fileIds: [file.body.id],
			}, alice);

			assert.strictEqual(createdNote.status, 200);

			const reply = await api('/notes/create', {
				replyId: createdNote.body.createdNote.id,
				text: 'this is reply',
			}, alice);
			assert.strictEqual(reply.status, 200);

			const renoted = await api('/notes/create', {
				renoteId: reply.body.createdNote.id,
			}, alice);
			assert.strictEqual(renoted.status, 200);

			const res = await api('/notes', {
				renote: true,
			}, alice);

			assert.strictEqual(res.status, 200);
			assert.strictEqual(Array.isArray(res.body), true);
			const myNote = res.body.find((note: { id: string }) => note.id === renoted.body.createdNote.id);
			assert.notEqual(myNote, null);
			assert.strictEqual(myNote.renote.reply.files.length, 1);
			assert.strictEqual(myNote.renote.reply.files[0].id, file.body.id);
		});

		test('NSFWが強制されている場合変更できない', async () => {
			const file = await uploadFile(alice);

			const res = await api('admin/roles/create', {
				name: 'test',
				description: '',
				color: null,
				iconUrl: null,
				displayOrder: 0,
				target: 'manual',
				condFormula: {},
				isAdministrator: false,
				isModerator: false,
				isPublic: false,
				isExplorable: false,
				asBadge: false,
				canEditMembersByModerator: false,
				policies: {
					alwaysMarkNsfw: {
						useDefault: false,
						priority: 0,
						value: true,
					},
				},
			}, alice);

			assert.strictEqual(res.status, 200);

			const assign = await api('admin/roles/assign', {
				userId: alice.id,
				roleId: res.body.id,
			}, alice);

			assert.strictEqual(assign.status, 204);
			assert.strictEqual(file.body.isSensitive, false);

			const nsfwfile = await uploadFile(alice);

			assert.strictEqual(nsfwfile.status, 200);
			assert.strictEqual(nsfwfile.body.isSensitive, true);

			const liftnsfw = await api('drive/files/update', {
				fileId: nsfwfile.body.id,
				isSensitive: false,
			}, alice);

			assert.strictEqual(liftnsfw.status, 400);
			assert.strictEqual(liftnsfw.body.error.code, 'RESTRICTED_BY_ROLE');

			const oldaddnsfw = await api('drive/files/update', {
				fileId: file.body.id,
				isSensitive: true,
			}, alice);

			assert.strictEqual(oldaddnsfw.status, 200);

			await api('admin/roles/unassign', {
				userId: alice.id,
				roleId: res.body.id,
			});

			await api('admin/roles/delete', {
				roleId: res.body.id,
			}, alice);
		});
	});

	describe('notes/create', () => {
		test('投票を添付できる', async () => {
			const res = await api('/notes/create', {
				text: 'test',
				poll: {
					choices: ['foo', 'bar'],
				},
			}, alice);

			assert.strictEqual(res.status, 200);
			assert.strictEqual(typeof res.body === 'object' && !Array.isArray(res.body), true);
			assert.strictEqual(res.body.createdNote.poll != null, true);
		});

		test('投票の選択肢が無くて怒られる', async () => {
			const res = await api('/notes/create', {
				poll: {},
			}, alice);
			assert.strictEqual(res.status, 400);
		});

		test('投票の選択肢が無くて怒られる (空の配列)', async () => {
			const res = await api('/notes/create', {
				poll: {
					choices: [],
				},
			}, alice);
			assert.strictEqual(res.status, 400);
		});

		test('投票の選択肢が1つで怒られる', async () => {
			const res = await api('/notes/create', {
				poll: {
					choices: ['Strawberry Pasta'],
				},
			}, alice);
			assert.strictEqual(res.status, 400);
		});

		test('投票できる', async () => {
			const { body } = await api('/notes/create', {
				text: 'test',
				poll: {
					choices: ['sakura', 'izumi', 'ako'],
				},
			}, alice);

			const res = await api('/notes/polls/vote', {
				noteId: body.createdNote.id,
				choice: 1,
			}, alice);

			assert.strictEqual(res.status, 204);
		});

		test('複数投票できない', async () => {
			const { body } = await api('/notes/create', {
				text: 'test',
				poll: {
					choices: ['sakura', 'izumi', 'ako'],
				},
			}, alice);

			await api('/notes/polls/vote', {
				noteId: body.createdNote.id,
				choice: 0,
			}, alice);

			const res = await api('/notes/polls/vote', {
				noteId: body.createdNote.id,
				choice: 2,
			}, alice);

			assert.strictEqual(res.status, 400);
		});

		test('許可されている場合は複数投票できる', async () => {
			const { body } = await api('/notes/create', {
				text: 'test',
				poll: {
					choices: ['sakura', 'izumi', 'ako'],
					multiple: true,
				},
			}, alice);

			await api('/notes/polls/vote', {
				noteId: body.createdNote.id,
				choice: 0,
			}, alice);

			await api('/notes/polls/vote', {
				noteId: body.createdNote.id,
				choice: 1,
			}, alice);

			const res = await api('/notes/polls/vote', {
				noteId: body.createdNote.id,
				choice: 2,
			}, alice);

			assert.strictEqual(res.status, 204);
		});

		test('締め切られている場合は投票できない', async () => {
			const { body } = await api('/notes/create', {
				text: 'test',
				poll: {
					choices: ['sakura', 'izumi', 'ako'],
					expiredAfter: 1,
				},
			}, alice);

			await new Promise(x => setTimeout(x, 2));

			const res = await api('/notes/polls/vote', {
				noteId: body.createdNote.id,
				choice: 1,
			}, alice);

			assert.strictEqual(res.status, 400);
		});

		test('センシティブな投稿はhomeになる (単語指定)', async () => {
			const sensitive = await api('admin/update-meta', {
				sensitiveWords: [
					'test',
				],
			}, alice);

			assert.strictEqual(sensitive.status, 204);

			await new Promise(x => setTimeout(x, 2));

			const note1 = await api('/notes/create', {
				text: 'hogetesthuge',
			}, alice);

			assert.strictEqual(note1.status, 200);
			assert.strictEqual(note1.body.createdNote.visibility, 'home');
		});

		test('センシティブな投稿はhomeになる (正規表現)', async () => {
			const sensitive = await api('admin/update-meta', {
				sensitiveWords: [
					'/Test/i',
				],
			}, alice);

			assert.strictEqual(sensitive.status, 204);

			const note2 = await api('/notes/create', {
				text: 'hogetesthuge',
			}, alice);

			assert.strictEqual(note2.status, 200);
			assert.strictEqual(note2.body.createdNote.visibility, 'home');
		});

		test('センシティブな投稿はhomeになる (スペースアンド)', async () => {
			const sensitive = await api('admin/update-meta', {
				sensitiveWords: [
					'Test hoge',
				],
			}, alice);

			assert.strictEqual(sensitive.status, 204);

			const note2 = await api('/notes/create', {
				text: 'hogeTesthuge',
			}, alice);

			assert.strictEqual(note2.status, 200);
			assert.strictEqual(note2.body.createdNote.visibility, 'home');
		});

		test('ロールで禁止されている場合投稿できない', async () => {
			const res = await api('admin/roles/create', {
				name: 'test',
				description: '',
				color: null,
				iconUrl: null,
				displayOrder: 0,
				target: 'manual',
				condFormula: {},
				isAdministrator: false,
				isModerator: false,
				isPublic: false,
				isExplorable: false,
				asBadge: false,
				canEditMembersByModerator: false,
				policies: {
					canPostNote: {
						useDefault: false,
						priority: 0,
						value: false,
					},
				},
			}, alice);

			assert.strictEqual(res.status, 200);

			const assign = await api('admin/roles/assign', {
				userId: bob.id,
				roleId: res.body.id,
			}, alice);

			assert.strictEqual(assign.status, 204);

			const post = {
				text: 'test',
			};
			const postNote = await api('/notes/create', post, bob);

			expect(postNote.status).toStrictEqual(403);
			expect(postNote.body.error.code).toStrictEqual('ROLE_PERMISSION_DENIED');

			await api('admin/roles/unassign', {
				userId: bob.id,
				roleId: res.body.id,
			});

			await api('admin/roles/delete', {
				roleId: res.body.id,
			}, alice);
		});

		test('ロールの文字数制限ギリギリは怒られない', async () => {
			const res = await api('admin/roles/create', {
				name: 'test',
				description: '',
				color: null,
				iconUrl: null,
				displayOrder: 0,
				target: 'manual',
				condFormula: {},
				isAdministrator: false,
				isModerator: false,
				isPublic: false,
				isExplorable: false,
				asBadge: false,
				canEditMembersByModerator: false,
				policies: {
					noteLengthLimit: {
						useDefault: false,
						priority: 0,
						value: 140,
					},
				},
			}, alice);

			assert.strictEqual(res.status, 200);

			const assign = await api('admin/roles/assign', {
				userId: alice.id,
				roleId: res.body.id,
			}, alice);

			assert.strictEqual(assign.status, 204);

			const post = {
				text: '!'.repeat(140),
			};
			const postNote = await api('/notes/create', post, alice);

			assert.strictEqual(postNote.status, 200);

			await api('admin/roles/unassign', {
				userId: alice.id,
				roleId: res.body.id,
			});

			await api('admin/roles/delete', {
				roleId: res.body.id,
			}, alice);
		});

		test('ロールの文字数制限オーバーで怒られる', async () => {
			const res = await api('admin/roles/create', {
				name: 'test',
				description: '',
				color: null,
				iconUrl: null,
				displayOrder: 0,
				target: 'manual',
				condFormula: {},
				isAdministrator: false,
				isModerator: false,
				isPublic: false,
				isExplorable: false,
				asBadge: false,
				canEditMembersByModerator: false,
				policies: {
					noteLengthLimit: {
						useDefault: false,
						priority: 0,
						value: 140,
					},
				},
			}, alice);

			assert.strictEqual(res.status, 200);

			const assign = await api('admin/roles/assign', {
				userId: alice.id,
				roleId: res.body.id,
			}, alice);

			assert.strictEqual(assign.status, 204);

			const post = {
				text: '!'.repeat(141),
			};
			const postNote = await api('/notes/create', post, alice);

			assert.strictEqual(postNote.status, 400);
			assert.strictEqual(postNote.body.error.code, 'NOTE_TOO_LONG_BY_ROLE_LIMIT');

			await api('admin/roles/unassign', {
				userId: alice.id,
				roleId: res.body.id,
			});

			await api('admin/roles/delete', {
				roleId: res.body.id,
			}, alice);
		});

		test('ロールで禁止されている場合メンションできない', async () => {
			const role = await api('admin/roles/create', {
				name: 'test',
				description: '',
				color: null,
				iconUrl: null,
				displayOrder: 0,
				target: 'manual',
				condFormula: {},
				isAdministrator: false,
				isModerator: false,
				isPublic: false,
				isExplorable: false,
				asBadge: false,
				canEditMembersByModerator: false,
				policies: {
					canReply: {
						useDefault: false,
						priority: 0,
						value: false,
					},
				},
			}, alice);

			assert.strictEqual(role.status, 200);

			const assign = await api('admin/roles/assign', {
				userId: alice.id,
				roleId: role.body.id,
			}, alice);

			assert.strictEqual(assign.status, 204);

			const post = {
				text: '@bob yo',
			};
			const postNote = await api('/notes/create', post, alice);

			assert.strictEqual(postNote.status, 400);
			assert.strictEqual(postNote.body.error.code, 'RESTRICTED_BY_ROLE');

			await api('admin/roles/unassign', {
				userId: alice.id,
				roleId: role.body.id,
			});

			await api('admin/roles/delete', {
				roleId: role.body.id,
			}, alice);
		});

		test('ロールで禁止されている場合リモートユーザーでもメンションできない', async () => {
			const role = await api('admin/roles/create', {
				name: 'test',
				description: '',
				color: null,
				iconUrl: null,
				displayOrder: 0,
				target: 'manual',
				condFormula: {},
				isAdministrator: false,
				isModerator: false,
				isPublic: false,
				isExplorable: false,
				asBadge: false,
				canEditMembersByModerator: false,
				policies: {
					canReply: {
						useDefault: false,
						priority: 0,
						value: false,
					},
				},
			}, alice);

			assert.strictEqual(role.status, 200);

			const assign = await api('admin/roles/assign', {
				userId: tom.id,
				roleId: role.body.id,
			}, alice);

			assert.strictEqual(assign.status, 204);

			const post = {
				text: '@bob@misskey.local yo',
			};
			const postNote = await api('/notes/create', post, tom);

			assert.strictEqual(postNote.status, 400);
			assert.strictEqual(postNote.body.error.code, 'RESTRICTED_BY_ROLE');

			await api('admin/roles/unassign', {
				userId: tom.id,
				roleId: role.body.id,
			});

			await api('admin/roles/delete', {
				roleId: role.body.id,
			}, alice);
		});

		test('ロールで禁止されている場合返信できない', async () => {
			const role = await api('admin/roles/create', {
				name: 'test',
				description: '',
				color: null,
				iconUrl: null,
				displayOrder: 0,
				target: 'manual',
				condFormula: {},
				isAdministrator: false,
				isModerator: false,
				isPublic: false,
				isExplorable: false,
				asBadge: false,
				canEditMembersByModerator: false,
				policies: {
					canReply: {
						useDefault: false,
						priority: 0,
						value: false,
					},
				},
			}, alice);

			assert.strictEqual(role.status, 200);

			const assign = await api('admin/roles/assign', {
				userId: alice.id,
				roleId: role.body.id,
			}, alice);

			assert.strictEqual(assign.status, 204);

			const bobPost = await post(bob, {
				text: 'foo',
			});

			const alicePost = {
				text: 'bar',
				replyId: bobPost.id,
			};

			const postNote = await api('/notes/create', alicePost, alice);

			assert.strictEqual(postNote.status, 400);
			assert.strictEqual(postNote.body.error.code, 'RESTRICTED_BY_ROLE');

			await api('admin/roles/unassign', {
				userId: alice.id,
				roleId: role.body.id,
			});

			await api('admin/roles/delete', {
				roleId: role.body.id,
			}, alice);
		});

		test('ロールで禁止されている場合リモートユーザーでも返信できない', async () => {
			const role = await api('admin/roles/create', {
				name: 'test',
				description: '',
				color: null,
				iconUrl: null,
				displayOrder: 0,
				target: 'manual',
				condFormula: {},
				isAdministrator: false,
				isModerator: false,
				isPublic: false,
				isExplorable: false,
				asBadge: false,
				canEditMembersByModerator: false,
				policies: {
					canReply: {
						useDefault: false,
						priority: 0,
						value: false,
					},
				},
			}, alice);

			assert.strictEqual(role.status, 200);

			const assign = await api('admin/roles/assign', {
				userId: tom.id,
				roleId: role.body.id,
			}, alice);

			assert.strictEqual(assign.status, 204);

			const post1 = await post(bob, {
				text: 'foo',
			});

			const post2 = await api('/notes/create', {
				text: 'bar',
				replyId: post1.id,
			}, tom);

			assert.strictEqual(post2.status, 400);
			assert.strictEqual(post2.body.error.code, 'RESTRICTED_BY_ROLE');

			await api('admin/roles/unassign', {
				userId: tom.id,
				roleId: role.body.id,
			});

			await api('admin/roles/delete', {
				roleId: role.body.id,
			}, alice);
		});

		test('ロールで禁止されている場合でも自分には返信できる', async () => {
			const role = await api('admin/roles/create', {
				name: 'test',
				description: '',
				color: null,
				iconUrl: null,
				displayOrder: 0,
				target: 'manual',
				condFormula: {},
				isAdministrator: false,
				isModerator: false,
				isPublic: false,
				isExplorable: false,
				asBadge: false,
				canEditMembersByModerator: false,
				policies: {
					canReply: {
						useDefault: false,
						priority: 0,
						value: false,
					},
				},
			}, alice);

			assert.strictEqual(role.status, 200);

			const assign = await api('admin/roles/assign', {
				userId: alice.id,
				roleId: role.body.id,
			}, alice);

			assert.strictEqual(assign.status, 204);

			const post1 = await post(alice, {
				text: 'foo',
			});

			const post2 = {
				text: 'bar',
				replyId: post1.id,
			};

			const postNote = await api('/notes/create', post2, alice);

			assert.strictEqual(postNote.status, 200);

			await api('admin/roles/unassign', {
				userId: alice.id,
				roleId: role.body.id,
			});

			await api('admin/roles/delete', {
				roleId: role.body.id,
			}, alice);
		});

		test('リモートユーザーがロールで禁止されている場合でも自分には返信できる', async () => {
			const role = await api('admin/roles/create', {
				name: 'test',
				description: '',
				color: null,
				iconUrl: null,
				displayOrder: 0,
				target: 'manual',
				condFormula: {},
				isAdministrator: false,
				isModerator: false,
				isPublic: false,
				isExplorable: false,
				asBadge: false,
				canEditMembersByModerator: false,
				policies: {
					canReply: {
						useDefault: false,
						priority: 0,
						value: false,
					},
				},
			}, alice);

			assert.strictEqual(role.status, 200);

			const assign = await api('admin/roles/assign', {
				userId: tom.id,
				roleId: role.body.id,
			}, alice);

			assert.strictEqual(assign.status, 204);

			const post1 = await post(tom, {
				text: 'foo',
			});

			const post2 = await api('/notes/create', {
				text: 'bar',
				replyId: post1.id,
			}, tom);

			assert.strictEqual(post2.status, 200);

			await api('admin/roles/unassign', {
				userId: tom.id,
				roleId: role.body.id,
			});

			await api('admin/roles/delete', {
				roleId: role.body.id,
			}, alice);
		});

		test('ロールで禁止されている場合DMできない', async () => {
			const role = await api('admin/roles/create', {
				name: 'test',
				description: '',
				color: null,
				iconUrl: null,
				displayOrder: 0,
				target: 'manual',
				condFormula: {},
				isAdministrator: false,
				isModerator: false,
				isPublic: false,
				isExplorable: false,
				asBadge: false,
				canEditMembersByModerator: false,
				policies: {
					canDirectMessage: {
						useDefault: false,
						priority: 0,
						value: false,
					},
				},
			}, alice);

			assert.strictEqual(role.status, 200);

			const assign = await api('admin/roles/assign', {
				userId: alice.id,
				roleId: role.body.id,
			}, alice);

			assert.strictEqual(assign.status, 204);

			const bobPost = await post(bob, {
				text: 'foo',
			});

			const alicePost = {
				text: 'bar',
				replyId: bobPost.id,
				visibility: 'specified',
				visibleUserIds: [bob.id],
			};

			const postNote = await api('/notes/create', alicePost, alice);

			assert.strictEqual(postNote.status, 400);
			assert.strictEqual(postNote.body.error.code, 'RESTRICTED_BY_ROLE');

			await api('admin/roles/unassign', {
				userId: alice.id,
				roleId: role.body.id,
			});

			await api('admin/roles/delete', {
				roleId: role.body.id,
			}, alice);
		});

		test('ロールで禁止されている場合リモートユーザーでもDMできない', async () => {
			const role = await api('admin/roles/create', {
				name: 'test',
				description: '',
				color: null,
				iconUrl: null,
				displayOrder: 0,
				target: 'manual',
				condFormula: {},
				isAdministrator: false,
				isModerator: false,
				isPublic: false,
				isExplorable: false,
				asBadge: false,
				canEditMembersByModerator: false,
				policies: {
					canDirectMessage: {
						useDefault: false,
						priority: 0,
						value: false,
					},
				},
			}, alice);

			assert.strictEqual(role.status, 200);

			const assign = await api('admin/roles/assign', {
				userId: tom.id,
				roleId: role.body.id,
			}, alice);

			assert.strictEqual(assign.status, 204);

			const post1 = await post(bob, {
				text: 'foo',
			});

			const post2 = await api('/notes/create', {
				text: 'bar',
				replyId: post1.id,
				visibility: 'specified',
				visibleUserIds: [bob.id],
			}, tom);

			assert.strictEqual(post2.status, 400);
			assert.strictEqual(post2.body.error.code, 'RESTRICTED_BY_ROLE');

			await api('admin/roles/unassign', {
				userId: tom.id,
				roleId: role.body.id,
			});

			await api('admin/roles/delete', {
				roleId: role.body.id,
			}, alice);
		});

		test('ロールで禁止されている場合でも自分にはDMできる', async () => {
			const role = await api('admin/roles/create', {
				name: 'test',
				description: '',
				color: null,
				iconUrl: null,
				displayOrder: 0,
				target: 'manual',
				condFormula: {},
				isAdministrator: false,
				isModerator: false,
				isPublic: false,
				isExplorable: false,
				asBadge: false,
				canEditMembersByModerator: false,
				policies: {
					canDirectMessage: {
						useDefault: false,
						priority: 0,
						value: false,
					},
				},
			}, alice);

			assert.strictEqual(role.status, 200);

			const assign = await api('admin/roles/assign', {
				userId: alice.id,
				roleId: role.body.id,
			}, alice);

			assert.strictEqual(assign.status, 204);

			const post1 = await post(alice, {
				text: 'foo',
			});

			const post2 = await api('/notes/create', {
				text: 'bar',
				replyId: post1.id,
				visibility: 'specified',
				visibleUserIds: [alice.id],
			}, alice);

			assert.strictEqual(post2.status, 200);

			await api('admin/roles/unassign', {
				userId: alice.id,
				roleId: role.body.id,
			});

			await api('admin/roles/delete', {
				roleId: role.body.id,
			}, alice);
		});

		test('ロールで禁止されている場合renoteできない', async () => {
			const role = await api('admin/roles/create', {
				name: 'test',
				description: '',
				color: null,
				iconUrl: null,
				displayOrder: 0,
				target: 'manual',
				condFormula: {},
				isAdministrator: false,
				isModerator: false,
				isPublic: false,
				isExplorable: false,
				asBadge: false,
				canEditMembersByModerator: false,
				policies: {
					canQuote: {
						useDefault: false,
						priority: 0,
						value: false,
					},
				},
			}, alice);

			assert.strictEqual(role.status, 200);

			const assign = await api('admin/roles/assign', {
				userId: alice.id,
				roleId: role.body.id,
			}, alice);

			assert.strictEqual(assign.status, 204);

			const bobPost = await post(bob, {
				text: 'test',
			});

			const alicePost = {
				renoteId: bobPost.id,
			};

			const res = await api('/notes/create', alicePost, alice);

			assert.strictEqual(res.status, 400);
			assert.strictEqual(res.body.error.code, 'RESTRICTED_BY_ROLE');

			await api('admin/roles/unassign', {
				userId: alice.id,
				roleId: role.body.id,
			});

			await api('admin/roles/delete', {
				roleId: role.body.id,
			}, alice);
		});

		test('ロールで禁止されている場合リモートユーザーでもrenoteできない', async () => {
			const role = await api('admin/roles/create', {
				name: 'test',
				description: '',
				color: null,
				iconUrl: null,
				displayOrder: 0,
				target: 'manual',
				condFormula: {},
				isAdministrator: false,
				isModerator: false,
				isPublic: false,
				isExplorable: false,
				asBadge: false,
				canEditMembersByModerator: false,
				policies: {
					canQuote: {
						useDefault: false,
						priority: 0,
						value: false,
					},
				},
			}, alice);

			assert.strictEqual(role.status, 200);

			const assign = await api('admin/roles/assign', {
				userId: tom.id,
				roleId: role.body.id,
			}, alice);

			assert.strictEqual(assign.status, 204);

			const post1 = await post(bob, {
				text: 'test',
			});

			const post2 = await api('/notes/create', {
				renoteId: post1.id,
			}, tom);

			assert.strictEqual(post2.status, 400);
			assert.strictEqual(post2.body.error.code, 'RESTRICTED_BY_ROLE');

			await api('admin/roles/unassign', {
				userId: tom.id,
				roleId: role.body.id,
			});

			await api('admin/roles/delete', {
				roleId: role.body.id,
			}, alice);
		});

		test('ロールの制限で引用renoteできない', async () => {
			const role = await api('admin/roles/create', {
				name: 'test',
				description: '',
				color: null,
				iconUrl: null,
				displayOrder: 0,
				target: 'manual',
				condFormula: {},
				isAdministrator: false,
				isModerator: false,
				isPublic: false,
				isExplorable: false,
				asBadge: false,
				canEditMembersByModerator: false,
				policies: {
					canQuote: {
						useDefault: false,
						priority: 0,
						value: false,
					},
				},
			}, alice);

			assert.strictEqual(role.status, 200);

			const assign = await api('admin/roles/assign', {
				userId: alice.id,
				roleId: role.body.id,
			}, alice);

			assert.strictEqual(assign.status, 204);

			const bobPost = await post(bob, {
				text: 'test',
			});

			const alicePost = {
				text: 'test',
				renoteId: bobPost.id,
			};

			const res = await api('/notes/create', alicePost, alice);

			assert.strictEqual(res.status, 400);
			assert.strictEqual(res.body.error.code, 'RESTRICTED_BY_ROLE');

			await api('admin/roles/unassign', {
				userId: alice.id,
				roleId: role.body.id,
			});

			await api('admin/roles/delete', {
				roleId: role.body.id,
			}, alice);
		});

		test('ロールの制限でリモートユーザーでも引用renoteできない', async () => {
			const role = await api('admin/roles/create', {
				name: 'test',
				description: '',
				color: null,
				iconUrl: null,
				displayOrder: 0,
				target: 'manual',
				condFormula: {},
				isAdministrator: false,
				isModerator: false,
				isPublic: false,
				isExplorable: false,
				asBadge: false,
				canEditMembersByModerator: false,
				policies: {
					canQuote: {
						useDefault: false,
						priority: 0,
						value: false,
					},
				},
			}, alice);

			assert.strictEqual(role.status, 200);

			const assign = await api('admin/roles/assign', {
				userId: tom.id,
				roleId: role.body.id,
			}, alice);

			assert.strictEqual(assign.status, 204);

			const post1 = await post(bob, {
				text: 'test',
			});

			const post2 = await api('/notes/create', {
				text: 'test',
				renoteId: post1.id,
			}, tom);

			assert.strictEqual(post2.status, 400);
			assert.strictEqual(post2.body.error.code, 'RESTRICTED_BY_ROLE');

			await api('admin/roles/unassign', {
				userId: tom.id,
				roleId: role.body.id,
			});

			await api('admin/roles/delete', {
				roleId: role.body.id,
			}, alice);
		});

		test('禁止ワードを含む投稿はエラーになる (単語指定)', async () => {
			const prohibited = await api('admin/update-meta', {
				prohibitedWords: [
					'test',
				],
			}, alice);

			assert.strictEqual(prohibited.status, 204);

			await new Promise(x => setTimeout(x, 2));

			const note1 = await api('/notes/create', {
				text: 'hogetesthuge',
			}, alice);

			assert.strictEqual(note1.status, 400);
			assert.strictEqual(note1.body.error.code, 'CONTAINS_PROHIBITED_WORDS');
		});

		test('禁止ワードを含む投稿はエラーになる (正規表現)', async () => {
			const prohibited = await api('admin/update-meta', {
				prohibitedWords: [
					'/Test/i',
				],
			}, alice);

			assert.strictEqual(prohibited.status, 204);

			const note2 = await api('/notes/create', {
				text: 'hogetesthuge',
			}, alice);

			assert.strictEqual(note2.status, 400);
			assert.strictEqual(note2.body.error.code, 'CONTAINS_PROHIBITED_WORDS');
		});

		test('禁止ワードを含む投稿はエラーになる (スペースアンド)', async () => {
			const prohibited = await api('admin/update-meta', {
				prohibitedWords: [
					'Test hoge',
				],
			}, alice);

			assert.strictEqual(prohibited.status, 204);

			const note2 = await api('/notes/create', {
				text: 'hogeTesthuge',
			}, alice);

			assert.strictEqual(note2.status, 400);
			assert.strictEqual(note2.body.error.code, 'CONTAINS_PROHIBITED_WORDS');
		});

		test('禁止ワードを含んでるリモートノートもエラーになる', async () => {
			const prohibited = await api('admin/update-meta', {
				prohibitedWords: [
					'test',
				],
			}, alice);

			assert.strictEqual(prohibited.status, 204);

			await new Promise(x => setTimeout(x, 2));

			const note1 = await api('/notes/create', {
				text: 'hogetesthuge',
			}, tom);

			assert.strictEqual(note1.status, 400);
		});
	});

	test('禁止パターン無効化時は投稿できる', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const note1 = await api('/notes/create', {
			text: 'hoge',
		}, alice);
		assert.strictEqual(note1.status, 200);
	});

	test('禁止パターンを含む投稿はエラーになる (無条件マッチ)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'true',
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const note1 = await api('/notes/create', {
			text: 'hoge',
		}, alice);
		assert.strictEqual(note1.status, 400);
		assert.strictEqual(note1.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (ユーザーロール)', async () => {
		const role = await api('admin/roles/create', {
			name: 'test',
			description: '',
			color: null,
			iconUrl: null,
			displayOrder: 0,
			target: 'manual',
			condFormula: {},
			isAdministrator: false,
			isModerator: false,
			isPublic: false,
			isExplorable: false,
			asBadge: false,
			canEditMembersByModerator: false,
			policies: { },
		}, alice);
		assert.strictEqual(role.status, 200);

		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'roleAssignedOf',
				roleId: role.body.id,
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		const assign = await api('admin/roles/assign', {
			userId: alice.id,
			roleId: role.body.id,
		}, alice);

		assert.strictEqual(assign.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const note1 = await api('/notes/create', {
			text: 'hoge',
		}, alice);
		assert.strictEqual(note1.status, 400);
		assert.strictEqual(note1.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		const note2 = await api('/notes/create', {
			text: 'hoge',
		}, bob);
		assert.strictEqual(note2.status, 200);

		await api('admin/roles/unassign', {
			userId: alice.id,
			roleId: role.body.id,
		});

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);

		await api('admin/roles/delete', {
			roleId: role.body.id,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (テキスト有無)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'hasText',
			},
		}, alice);

		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const note1 = await api('/notes/create', {
			text: 'hoge',
		}, alice);
		assert.strictEqual(note1.status, 400);
		assert.strictEqual(note1.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		const note2 = await api('/notes/create', {
			text: 'hoge',
		}, bob);
		assert.strictEqual(note2.status, 400);
		assert.strictEqual(note2.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (テキストマッチ)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'textMatchOf',
				pattern: 'foo',
			},
		}, alice);

		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const note1 = await api('/notes/create', {
			text: 'hoge',
		}, alice);
		assert.strictEqual(note1.status, 200);

		const note2 = await api('/notes/create', {
			text: 'hogefoohuga',
		}, alice);
		assert.strictEqual(note2.status, 400);
		assert.strictEqual(note2.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		const note3 = await api('/notes/create', {
			text: 'bar',
		}, bob);
		assert.strictEqual(note3.status, 200);

		const note4 = await api('/notes/create', {
			text: 'hofooge',
		}, bob);
		assert.strictEqual(note4.status, 400);
		assert.strictEqual(note4.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (メンション有無)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'hasMentions',
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const note1 = await api('/notes/create', {
			text: '@bob yo',
		}, alice);
		assert.strictEqual(note1.status, 400);
		assert.strictEqual(note1.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		const note2 = await api('/notes/create', {
			text: 'yo',
		}, alice);
		assert.strictEqual(note2.status, 200);

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (メンション個数一致)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'mentionCountIs',
				value: 2,
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const note1 = await api('/notes/create', {
			text: '@alice @bob yo',
		}, alice);
		assert.strictEqual(note1.status, 400);
		assert.strictEqual(note1.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		const note2 = await api('/notes/create', {
			text: '@bob yo',
		}, alice);
		assert.strictEqual(note2.status, 200);

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (メンション個数以上)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'mentionCountMoreThanOrEq',
				value: 2,
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const note1 = await api('/notes/create', {
			text: '@alice @bob yo',
		}, alice);
		assert.strictEqual(note1.status, 400);
		assert.strictEqual(note1.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		const note2 = await api('/notes/create', {
			text: '@alice yo',
		}, alice);
		assert.strictEqual(note2.status, 200);

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (メンション個数未満)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'mentionCountLessThan',
				value: 2,
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const note1 = await api('/notes/create', {
			text: 'yo',
		}, alice);
		assert.strictEqual(note1.status, 400);
		assert.strictEqual(note1.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		const note2 = await api('/notes/create', {
			text: '@alice @bob yo',
		}, alice);
		assert.strictEqual(note2.status, 200);

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (返信)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'isReply',
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const bpost = await post(bob, {
			text: 'foo',
		});

		const note1 = await api('/notes/create', {
			text: 'foo',
		}, alice);
		assert.strictEqual(note1.status, 200);

		const note2 = await api('/notes/create', {
			text: 'bar',
			replyId: bpost.id,
		}, alice);
		assert.strictEqual(note2.status, 400);
		assert.strictEqual(note2.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (引用/Renote)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'isQuoted',
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const bpost = await post(bob, {
			text: 'foo',
		});

		const note1 = await api('/notes/create', {
			text: 'foo',
		}, alice);
		assert.strictEqual(note1.status, 200);

		const note2 = await api('/notes/create', {
			text: 'bar',
			renoteId: bpost.id,
		}, alice);
		assert.strictEqual(note2.status, 400);
		assert.strictEqual(note2.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (ファイル有無)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'hasFiles',
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const file = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/Lenna.jpg');

		const note1 = await api('/notes/create', {
			text: 'foo',
		}, alice);
		assert.strictEqual(note1.status, 200);

		const note2 = await api('/notes/create', {
			text: 'foo',
			fileIds: [file.id],
		}, alice);
		assert.strictEqual(note2.status, 400);
		assert.strictEqual(note2.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (ファイル数一致)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'fileCountIs',
				value: 2,
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const file1 = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/Lenna.jpg');
		const file2 = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/emptyfile');

		const note1 = await api('/notes/create', {
			text: 'foo',
			fileIds: [file1.id],
		}, alice);
		assert.strictEqual(note1.status, 200);

		const note2 = await api('/notes/create', {
			text: 'foo',
			fileIds: [file1.id, file2.id],
		}, alice);
		assert.strictEqual(note2.status, 400);
		assert.strictEqual(note2.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (ファイル数以上)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'fileCountMoreThanOrEq',
				value: 2,
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const file1 = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/Lenna.jpg');
		const file2 = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/emptyfile');

		const note1 = await api('/notes/create', {
			text: 'foo',
			fileIds: [file1.id],
		}, alice);
		assert.strictEqual(note1.status, 200);

		const note2 = await api('/notes/create', {
			text: 'foo',
			fileIds: [file1.id, file2.id],
		}, alice);
		assert.strictEqual(note2.status, 400);
		assert.strictEqual(note2.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (ファイル数未満)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'fileCountLessThan',
				value: 2,
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const file1 = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/Lenna.jpg');
		const file2 = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/emptyfile');

		const note1 = await api('/notes/create', {
			text: 'foo',
			fileIds: [file1.id, file2.id],
		}, alice);
		assert.strictEqual(note1.status, 200);

		const note2 = await api('/notes/create', {
			text: 'foo',
		}, alice);
		assert.strictEqual(note2.status, 400);
		assert.strictEqual(note2.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (ファイル総サイズ以上)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'fileTotalSizeMoreThanOrEq',
				size: 65536,
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const file1 = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/Lenna.jpg');
		const file2 = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/kick_gaba7.wav');

		const note1 = await api('/notes/create', {
			text: 'foo',
			fileIds: [file1.id],
		}, alice);
		assert.strictEqual(note1.status, 200);

		const note2 = await api('/notes/create', {
			text: 'foo',
			fileIds: [file2.id],
		}, alice);
		assert.strictEqual(note2.status, 400);
		assert.strictEqual(note2.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (ファイル総サイズ未満)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'fileTotalSizeLessThan',
				size: 1024,
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const file1 = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/Lenna.jpg');
		const file2 = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/emptyfile');

		const note1 = await api('/notes/create', {
			text: 'foo',
			fileIds: [file1.id],
		}, alice);
		assert.strictEqual(note1.status, 200);

		const note2 = await api('/notes/create', {
			text: 'foo',
			fileIds: [file2.id],
		}, alice);
		assert.strictEqual(note2.status, 400);
		assert.strictEqual(note2.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (ファイルサイズ以上)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'hasFileSizeMoreThanOrEq',
				size: 65536,
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const file1 = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/Lenna.jpg');
		const file2 = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/kick_gaba7.wav');

		const note1 = await api('/notes/create', {
			text: 'foo',
			fileIds: [file1.id],
		}, alice);
		assert.strictEqual(note1.status, 200);

		const note2 = await api('/notes/create', {
			text: 'foo',
			fileIds: [file1.id, file2.id],
		}, alice);
		assert.strictEqual(note2.status, 400);
		assert.strictEqual(note2.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (ファイルサイズ未満)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'hasFileSizeLessThan',
				size: 1024,
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const file1 = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/Lenna.jpg');
		const file2 = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/emptyfile');

		const note1 = await api('/notes/create', {
			text: 'foo',
			fileIds: [file1.id],
		}, alice);
		assert.strictEqual(note1.status, 200);

		const note2 = await api('/notes/create', {
			text: 'foo',
			fileIds: [file1.id, file2.id],
		}, alice);
		assert.strictEqual(note2.status, 400);
		assert.strictEqual(note2.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (ファイルMD5一致)', async () => {
		const file1 = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/emptyfile');
		const file2 = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/Lenna.jpg');

		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'hasFileMD5Is',
				hash: file2.md5,
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const note1 = await api('/notes/create', {
			text: 'foo',
			fileIds: [file1.id],
		}, alice);
		assert.strictEqual(note1.status, 200);

		const note2 = await api('/notes/create', {
			text: 'foo',
			fileIds: [file2.id],
		}, alice);
		assert.strictEqual(note2.status, 400);
		assert.strictEqual(note2.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (非ブラウザセーフファイル)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'hasBrowserInsafe',
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const file1 = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/Lenna.jpg');
		const file2 = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/emptyfile');

		const note1 = await api('/notes/create', {
			text: 'foo',
			fileIds: [file1.id],
		}, alice);
		assert.strictEqual(note1.status, 200);

		const note2 = await api('/notes/create', {
			text: 'foo',
			fileIds: [file1.id, file2.id],
		}, alice);
		assert.strictEqual(note2.status, 400);
		assert.strictEqual(note2.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (画像ファイル)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'hasPictures',
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const file1 = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/emptyfile');
		const file2 = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/Lenna.jpg');

		const note1 = await api('/notes/create', {
			text: 'foo',
			fileIds: [file1.id],
		}, alice);
		assert.strictEqual(note1.status, 200);

		const note2 = await api('/notes/create', {
			text: 'foo',
			fileIds: [file1.id, file2.id],
		}, alice);
		assert.strictEqual(note2.status, 400);
		assert.strictEqual(note2.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (Blurhash近似)', async () => {
		const file1 = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/with-alpha.png');
		const file2 = await uploadUrl(alice, 'https://raw.githubusercontent.com/misskey-dev/misskey/develop/packages/backend/test/resources/Lenna.jpg');
		assert.notEqual(file2.blurhash, null);

		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'hasLikelyBlurhash',
				hash: file2.blurhash ?? '',
				diff: 0,
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const note1 = await api('/notes/create', {
			text: 'foo',
			fileIds: [file1.id],
		}, alice);
		assert.strictEqual(note1.status, 200);

		const note2 = await api('/notes/create', {
			text: 'foo',
			fileIds: [file1.id, file2.id],
		}, alice);
		assert.strictEqual(note2.status, 400);
		assert.strictEqual(note2.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (ハッシュタグ有無)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'hasHashtags',
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const note1 = await api('/notes/create', {
			text: '#foo yo',
		}, alice);
		assert.strictEqual(note1.status, 400);
		assert.strictEqual(note1.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		const note2 = await api('/notes/create', {
			text: 'yo',
		}, alice);
		assert.strictEqual(note2.status, 200);

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (ハッシュタグ個数一致)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'hashtagCountIs',
				value: 2,
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const note1 = await api('/notes/create', {
			text: '#foo #bar yo',
		}, alice);
		assert.strictEqual(note1.status, 400);
		assert.strictEqual(note1.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		const note2 = await api('/notes/create', {
			text: '#bar yo',
		}, alice);
		assert.strictEqual(note2.status, 200);

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (ハッシュタグ個数以上)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'hashtagCountMoreThanOrEq',
				value: 2,
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const note1 = await api('/notes/create', {
			text: '#foo #bar yo',
		}, alice);
		assert.strictEqual(note1.status, 400);
		assert.strictEqual(note1.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		const note2 = await api('/notes/create', {
			text: '#foo yo',
		}, alice);
		assert.strictEqual(note2.status, 200);

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (ハッシュタグ個数未満)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'hashtagCountLessThan',
				value: 2,
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const note1 = await api('/notes/create', {
			text: 'yo',
		}, alice);
		assert.strictEqual(note1.status, 400);
		assert.strictEqual(note1.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		const note2 = await api('/notes/create', {
			text: '#foo #bar yo',
		}, alice);
		assert.strictEqual(note2.status, 200);

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	test('禁止パターンを含む投稿はエラーになる (ハッシュタグパターン一致)', async () => {
		const prohibited = await api('admin/update-meta', {
			prohibitedNotePattern: {
				type: 'hasHashtagMatchOf',
				value: 'foo',
			},
		}, alice);
		assert.strictEqual(prohibited.status, 204);

		await new Promise(x => setTimeout(x, 2));

		const note1 = await api('/notes/create', {
			text: '#foobar yo',
		}, alice);
		assert.strictEqual(note1.status, 400);
		assert.strictEqual(note1.body.error.code, 'MATCHED_PROHIBITED_PATTERNS');

		const note2 = await api('/notes/create', {
			text: 'foobar',
		}, alice);
		assert.strictEqual(note2.status, 200);

		await api('admin/update-meta', {
			prohibitedNotePattern: null,
		}, alice);
	});

	describe('notes/delete', () => {
		test('delete a reply', async () => {
			const mainNoteRes = await api('notes/create', {
				text: 'main post',
			}, alice);
			const replyOneRes = await api('notes/create', {
				text: 'reply one',
				replyId: mainNoteRes.body.createdNote.id,
			}, alice);
			const replyTwoRes = await api('notes/create', {
				text: 'reply two',
				replyId: mainNoteRes.body.createdNote.id,
			}, alice);

			const deleteOneRes = await api('notes/delete', {
				noteId: replyOneRes.body.createdNote.id,
			}, alice);

			assert.strictEqual(deleteOneRes.status, 204);
			let mainNote = await Notes.findOneBy({ id: mainNoteRes.body.createdNote.id });
			assert.strictEqual(mainNote.repliesCount, 1);

			const deleteTwoRes = await api('notes/delete', {
				noteId: replyTwoRes.body.createdNote.id,
			}, alice);

			assert.strictEqual(deleteTwoRes.status, 204);
			mainNote = await Notes.findOneBy({ id: mainNoteRes.body.createdNote.id });
			assert.strictEqual(mainNote.repliesCount, 0);
		});
	});
});
