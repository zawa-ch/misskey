<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps">
	<div :class="$style.header">
		<MkSelect v-model="type" :class="$style.typeSelect">
			<option v-if="!child" value="disable">{{ i18n.ts._prohibitedNote.disable }}</option>
			<option value="false">{{ i18n.ts._prohibitedNote._condition.false_value }}</option>
			<option value="true">{{ i18n.ts._prohibitedNote._condition.true_value }}</option>
			<option value="and">{{ i18n.ts._prohibitedNote._condition.and }}</option>
			<option value="or">{{ i18n.ts._prohibitedNote._condition.or }}</option>
			<option value="not">{{ i18n.ts._prohibitedNote._condition.not }}</option>
			<option value="usernameMatchOf">{{ i18n.ts._prohibitedNote._condition.usernameMatchOf }}</option>
			<option value="nameMatchOf">{{ i18n.ts._prohibitedNote._condition.nameMatchOf }}</option>
			<option value="nameIsDefault">{{ i18n.ts._prohibitedNote._condition.nameIsDefault }}</option>
			<option value="roleAssignedOf">{{ i18n.ts._prohibitedNote._condition.roleAssignedOf }}</option>
			<option value="hasText">{{ i18n.ts._prohibitedNote._condition.hasText }}</option>
			<option value="textMatchOf">{{ i18n.ts._prohibitedNote._condition.textMatchOf }}</option>
			<option value="hasMentions">{{ i18n.ts._prohibitedNote._condition.hasMentions }}</option>
			<option value="mentionCountIs">{{ i18n.ts._prohibitedNote._condition.mentionCountIs }}</option>
			<option value="mentionCountMoreThanOrEq">{{ i18n.ts._prohibitedNote._condition.mentionCountMoreThanOrEq }}</option>
			<option value="mentionCountLessThan">{{ i18n.ts._prohibitedNote._condition.mentionCountLessThan }}</option>
			<option value="isReply">{{ i18n.ts._prohibitedNote._condition.isReply }}</option>
			<option value="isQuoted">{{ i18n.ts._prohibitedNote._condition.isQuoted }}</option>
			<option value="hasFiles">{{ i18n.ts._prohibitedNote._condition.hasFiles }}</option>
			<option value="fileCountIs">{{ i18n.ts._prohibitedNote._condition.fileCountIs }}</option>
			<option value="fileCountMoreThanOrEq">{{ i18n.ts._prohibitedNote._condition.fileCountMoreThanOrEq }}</option>
			<option value="fileCountLessThan">{{ i18n.ts._prohibitedNote._condition.fileCountLessThan }}</option>
			<option value="fileTotalSizeMoreThanOrEq">{{ i18n.ts._prohibitedNote._condition.fileTotalSizeMoreThanOrEq }}</option>
			<option value="fileTotalSizeLessThan">{{ i18n.ts._prohibitedNote._condition.fileTotalSizeLessThan }}</option>
			<option value="hasFileSizeMoreThanOrEq">{{ i18n.ts._prohibitedNote._condition.hasFileSizeMoreThanOrEq }}</option>
			<option value="hasFileSizeLessThan">{{ i18n.ts._prohibitedNote._condition.hasFileSizeLessThan }}</option>
			<option value="hasFileMD5Is">{{ i18n.ts._prohibitedNote._condition.hasFileMD5Is }}</option>
			<option value="hasBrowserInsafe">{{ i18n.ts._prohibitedNote._condition.hasBrowserInsafe }}</option>
			<option value="hasPictures">{{ i18n.ts._prohibitedNote._condition.hasPictures }}</option>
			<option value="hasLikelyBlurhash">{{ i18n.ts._prohibitedNote._condition.hasLikelyBlurhash }}</option>
			<option value="hasHashtags">{{ i18n.ts._prohibitedNote._condition.hasHashtags }}</option>
			<option value="hashtagCountIs">{{ i18n.ts._prohibitedNote._condition.hashtagCountIs }}</option>
			<option value="hashtagCountMoreThanOrEq">{{ i18n.ts._prohibitedNote._condition.hashtagCountMoreThanOrEq }}</option>
			<option value="hashtagCountLessThan">{{ i18n.ts._prohibitedNote._condition.hashtagCountLessThan }}</option>
			<option value="hasHashtagMatchOf">{{ i18n.ts._prohibitedNote._condition.hasHashtagMatchOf }}</option>
		</MkSelect>
		<button v-if="draggable" class="drag-handle _button" :class="$style.dragHandle">
			<i class="ti ti-menu-2"></i>
		</button>
		<button v-if="draggable" class="_button" :class="$style.remove" @click="removeSelf">
			<i class="ti ti-x"></i>
		</button>
	</div>

	<div v-if="type === 'and' || type === 'or'" class="_gaps">
		<Sortable v-model="values" tag="div" class="_gaps" itemKey="key" handle=".drag-handle" :group="{ name: 'prohibitedNoteFormula' }" :animation="150" :swapThreshold="0.5">
			<template #item="{element}">
				<div :class="$style.item">
					<!-- divが無いとエラーになる https://github.com/SortableJS/vue.draggable.next/issues/189 -->
					<ProhibitedNoteFormula :modelValue="element.value" child draggable @update:modelValue="updated => valuesItemUpdated(element.key, updated)" @remove="removeItem(element)"/>
				</div>
			</template>
		</Sortable>
		<MkButton rounded style="margin: 0 auto;" @click="addValue"><i class="ti ti-plus"></i> {{ i18n.ts.add }}</MkButton>
	</div>

	<div v-else-if="type === 'not'" :class="$style.item">
		<ProhibitedNoteFormula v-model="subformula" child/>
	</div>

	<MkSelect v-else-if="type === 'roleAssignedOf'" v-model="roleId">
		<option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
	</MkSelect>

	<MkInput v-else-if="type === 'hasFileMD5Is'" v-model="md5hash" type="text"/>

	<MkInput v-else-if="['fileTotalSizeMoreThanOrEq', 'fileTotalSizeLessThan', 'hasFileSizeMoreThanOrEq', 'hasFileSizeLessThan'].includes(type)" v-model="size" type="number">
		<template #suffix>byte</template>
	</MkInput>

	<MkInput v-else-if="['mentionCountIs', 'mentionCountMoreThanOrEq', 'mentionCountLessThan', 'fileCountIs', 'fileCountMoreThanOrEq', 'fileCountLessThan', 'hashtagCountIs', 'hashtagCountMoreThanOrEq', 'hashtagCountLessThan'].includes(type)" v-model="count" type="number"/>

	<MkInput v-else-if="['usernameMatchOf', 'nameMatchOf', 'textMatchOf', 'hasHashtagMatchOf'].includes(type)" v-model="pattern" type="text">
		<template #caption>{{ i18n.ts._prohibitedNote.patternEditDescription }}</template>
	</MkInput>

	<div v-else-if="type === 'hasLikelyBlurhash'">
		<MkInput v-model="blurhash" type="text">
			<template #label>{{ i18n.ts._prohibitedNote.hash }}</template>
		</MkInput>
		<MkInput v-model="blurhashdiff" type="number">
			<template #label>{{ i18n.ts._prohibitedNote.allowDifference }}</template>
		</MkInput>
	</div>
</div>
</template>

<script lang="ts" setup>
import * as Misskey from 'misskey-js';
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import { v4 as uuid } from 'uuid';
import MkInput from '@/components/MkInput.vue';
import MkSelect from '@/components/MkSelect.vue';
import MkButton from '@/components/MkButton.vue';
import { i18n } from '@/i18n.js';
import { deepClone } from '@/scripts/clone.js';
import { rolesCache } from '@/cache.js';

const Sortable = defineAsyncComponent(() => import('vuedraggable').then(x => x.default));

const roles = await rolesCache.fetch();

const emit = defineEmits<{
		(ev: 'update:modelValue', value: Misskey.entities.ProhibitedNoteFormulaValue | null): void;
		(ev: 'remove'): void;
	}>();

const props = defineProps<{
		modelValue: Misskey.entities.ProhibitedNoteFormulaValue | null;
		draggable?: boolean;
		child?: boolean;
	}>();

function cloneModelValue() {
	return deepClone(props.modelValue);
}

const formula = ref(cloneModelValue());
const subValueKeys = ref<string[]>([]);
if (['and', 'or'].some(t => formula.value && (t === formula.value.type))) {
	(formula.value as Misskey.entities.ProhibitedNoteFormulaLogics).values.forEach(() => { subValueKeys.value.push(uuid()); });
}

watch(() => props.modelValue, () => {
	if (JSON.stringify(props.modelValue) === JSON.stringify(formula.value)) return;
	subValueKeys.value = [];
	(formula.value as Misskey.entities.ProhibitedNoteFormulaLogics).values.forEach(() => { subValueKeys.value.push(uuid()); });
	formula.value = cloneModelValue();
}, { deep: true });

watch(formula, () => {
	emit('update:modelValue', formula.value);
}, { deep: true });

const type = computed({
	get: () => formula.value?.type ?? 'disable',
	set: (t) => {
		switch (t) {
			case 'true':
			case 'false': {
				formula.value = { type: t };
				break;
			}
			case 'and':
			case 'or': {
				formula.value = { type: t, values: [] };
				break;
			}
			case 'not': {
				formula.value = { type: t, value: { type: 'false' } };
				break;
			}
			case 'nameIsDefault':
			case 'hasText':
			case 'hasMentions':
			case 'isReply':
			case 'isQuoted':
			case 'hasFiles':
			case 'hasBrowserInsafe':
			case 'hasPictures':
			case 'hasHashtags': {
				formula.value = { type: t };
				break;
			}
			case 'usernameMatchOf':
			case 'nameMatchOf':
			case 'textMatchOf':
			case 'hasHashtagMatchOf': {
				formula.value = { type: t, pattern: '' };
				break;
			}
			case 'mentionCountIs':
			case 'mentionCountMoreThanOrEq':
			case 'mentionCountLessThan':
			case 'fileCountIs':
			case 'fileCountMoreThanOrEq':
			case 'fileCountLessThan':
			case 'hashtagCountIs':
			case 'hashtagCountMoreThanOrEq':
			case 'hashtagCountLessThan': {
				formula.value = { type: t, value: 3 };
				break;
			}
			case 'fileTotalSizeMoreThanOrEq':
			case 'fileTotalSizeLessThan':
			case 'hasFileSizeMoreThanOrEq':
			case 'hasFileSizeLessThan': {
				formula.value = { type: t, size: 10240 };
				break;
			}
			case 'roleAssignedOf': {
				formula.value = { type: t, roleId: '' };
				break;
			}
			case 'hasFileMD5Is': {
				formula.value = { type: t, hash: '' };
				break;
			}
			case 'hasLikelyBlurhash': {
				formula.value = { type: t, hash: '', diff: 0 };
				break;
			}
			case 'disable': {
				formula.value = null;
			}
		}
	},
});

const values = computed({
	get: () => (formula.value as Misskey.entities.ProhibitedNoteFormulaLogics).values.map((v, i) => { return { key: subValueKeys.value[i], value: v }; }),
	set: (nv) => {
		subValueKeys.value = nv.map(v => v.key);
		(formula.value as Misskey.entities.ProhibitedNoteFormulaLogics).values = nv.map(v => v.value);
	},
});
const subformula = computed({
	get: () => (formula.value as Misskey.entities.ProhibitedNoteFormulaNot).value,
	set: (nv) => (formula.value as Misskey.entities.ProhibitedNoteFormulaNot).value = nv,
});
const roleId = computed({
	get: () => (formula.value as Misskey.entities.ProhibitedNoteFormulaAssignsRole).roleId,
	set: (nv) => (formula.value as Misskey.entities.ProhibitedNoteFormulaAssignsRole).roleId = nv,
});
const md5hash = computed({
	get: () => (formula.value as Misskey.entities.ProhibitedNoteFormulaMD5HashMatch).hash,
	set: (nv) => (formula.value as Misskey.entities.ProhibitedNoteFormulaMD5HashMatch).hash = nv,
});
const size = computed({
	get: () => (formula.value as Misskey.entities.ProhibitedNoteFormulaSizeComp).size,
	set: (nv) => (formula.value as Misskey.entities.ProhibitedNoteFormulaSizeComp).size = nv,
});
const count = computed({
	get: () => (formula.value as Misskey.entities.ProhibitedNoteFormulaCountComp).value,
	set: (nv) => (formula.value as Misskey.entities.ProhibitedNoteFormulaCountComp).value = nv,
});
const pattern = computed({
	get: () => (formula.value as Misskey.entities.ProhibitedNoteFormulaPatternMatch).pattern,
	set: (nv) => (formula.value as Misskey.entities.ProhibitedNoteFormulaPatternMatch).pattern = nv,
});
const blurhash = computed({
	get: () => (formula.value as Misskey.entities.ProhibitedNoteFormulaBlurhashLikely).hash,
	set: (nv) => (formula.value as Misskey.entities.ProhibitedNoteFormulaBlurhashLikely).hash = nv,
});
const blurhashdiff = computed({
	get: () => (formula.value as Misskey.entities.ProhibitedNoteFormulaBlurhashLikely).diff,
	set: (nv) => (formula.value as Misskey.entities.ProhibitedNoteFormulaBlurhashLikely).diff = nv,
});

function addValue() {
	(formula.value as Misskey.entities.ProhibitedNoteFormulaLogics).values.push({ type: 'false' });
	subValueKeys.value.push(uuid());
}

function valuesItemUpdated(key: string, value: Misskey.entities.ProhibitedNoteFormulaValue | null) {
	const wi = subValueKeys.value.findIndex(k => k === key);
	if (value) {
		(formula.value as Misskey.entities.ProhibitedNoteFormulaLogics).values[wi] = value;
	} else {
		(formula.value as Misskey.entities.ProhibitedNoteFormulaLogics).values = (formula.value as Misskey.entities.ProhibitedNoteFormulaLogics).values.filter((_, i) => i !== wi);
		subValueKeys.value = subValueKeys.value.filter((_, i) => i !== wi);
	}
}

function removeItem(item) {
	values.value = values.value.filter((v) => v.key !== item.key);
}

function removeSelf() {
	emit('remove');
}
</script>

	<style lang="scss" module>
	.header {
		display: flex;
	}

	.typeSelect {
		flex: 1;
	}

	.dragHandle {
		cursor: move;
		margin-left: 10px;
	}

	.remove {
		margin-left: 10px;
	}

	.item {
		border: solid 2px var(--divider);
		border-radius: var(--radius);
		padding: 12px;

		&:hover {
			border-color: var(--accent);
		}
	}
	</style>

