<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps">
	<div :class="$style.header">
		<MkSelect v-model="type" :class="$style.typeSelect">
			<option value="isLocal">{{ i18n.ts._role._condition.isLocal }}</option>
			<option value="isRemote">{{ i18n.ts._role._condition.isRemote }}</option>
			<option value="isFederated">{{ i18n.ts._role._condition.isFederated }}</option>
			<option value="isSubscribing">{{ i18n.ts._role._condition.isSubscribing }}</option>
			<option value="isPublishing">{{ i18n.ts._role._condition.isPublishing }}</option>
			<option value="isForeign">{{ i18n.ts._role._condition.isForeign }}</option>
			<option value="isSuspended">{{ i18n.ts._role._condition.isSuspended }}</option>
			<option value="isLocked">{{ i18n.ts._role._condition.isLocked }}</option>
			<option value="isBot">{{ i18n.ts._role._condition.isBot }}</option>
			<option value="isCat">{{ i18n.ts._role._condition.isCat }}</option>
			<option value="isExplorable">{{ i18n.ts._role._condition.isExplorable }}</option>
			<option value="isMfaEnabled">{{ i18n.ts._role._condition.isMfaEnabled }}</option>
			<option value="isSecurityKeyAvailable">{{ i18n.ts._role._condition.isSecurityKeyAvailable }}</option>
			<option value="isUsingPwlessLogin">{{ i18n.ts._role._condition.isUsingPwlessLogin }}</option>
			<option value="isNoCrawle">{{ i18n.ts._role._condition.isNoCrawle }}</option>
			<option value="isNoAI">{{ i18n.ts._role._condition.isNoAI }}</option>
			<option value="roleAssignedTo">{{ i18n.ts._role._condition.roleAssignedTo }}</option>
			<option value="usernameMatchOf">{{ i18n.ts._role._condition.usernameMatchOf }}</option>
			<option value="usernameEntropyMoreThanOrEq">{{ i18n.ts._role._condition.usernameEntropyMoreThanOrEq }}</option>
			<option value="usernameEntropyLessThanOrEq">{{ i18n.ts._role._condition.usernameEntropyLessThanOrEq }}</option>
			<option value="usernameEntropyMeanMoreThanOrEq">{{ i18n.ts._role._condition.usernameEntropyMeanMoreThanOrEq }}</option>
			<option value="usernameEntropyMeanLessThanOrEq">{{ i18n.ts._role._condition.usernameEntropyMeanLessThanOrEq }}</option>
			<option value="nameMatchOf">{{ i18n.ts._role._condition.nameMatchOf }}</option>
			<option value="hostMatchOf">{{ i18n.ts._role._condition.hostMatchOf }}</option>
			<option value="nameIsDefault">{{ i18n.ts._role._condition.nameIsDefault }}</option>
			<option value="emailVerified">{{ i18n.ts._role._condition.emailVerified }}</option>
			<option value="emailMatchOf">{{ i18n.ts._role._condition.emailMatchOf }}</option>
			<option value="createdLessThan">{{ i18n.ts._role._condition.createdLessThan }}</option>
			<option value="createdMoreThan">{{ i18n.ts._role._condition.createdMoreThan }}</option>
			<option value="loggedInLessThanOrEq">{{ i18n.ts._role._condition.loggedInLessThanOrEq }}</option>
			<option value="loggedInMoreThanOrEq">{{ i18n.ts._role._condition.loggedInMoreThanOrEq }}</option>
			<option value="followersLessThanOrEq">{{ i18n.ts._role._condition.followersLessThanOrEq }}</option>
			<option value="followersMoreThanOrEq">{{ i18n.ts._role._condition.followersMoreThanOrEq }}</option>
			<option value="followingLessThanOrEq">{{ i18n.ts._role._condition.followingLessThanOrEq }}</option>
			<option value="followingMoreThanOrEq">{{ i18n.ts._role._condition.followingMoreThanOrEq }}</option>
			<option value="notesLessThanOrEq">{{ i18n.ts._role._condition.notesLessThanOrEq }}</option>
			<option value="notesMoreThanOrEq">{{ i18n.ts._role._condition.notesMoreThanOrEq }}</option>
			<option value="avatarUnset">{{ i18n.ts._role._condition.avatarUnset }}</option>
			<option value="avatarLikelyBlurhash">{{ i18n.ts._role._condition.avatarLikelyBlurhash }}</option>
			<option value="bannerUnset">{{ i18n.ts._role._condition.bannerUnset }}</option>
			<option value="bannerLikelyBlurhash">{{ i18n.ts._role._condition.bannerLikelyBlurhash }}</option>
			<option value="hasTags">{{ i18n.ts._role._condition.hasTags }}</option>
			<option value="tagCountIs">{{ i18n.ts._role._condition.tagCountIs }}</option>
			<option value="tagCountMoreThanOrEq">{{ i18n.ts._role._condition.tagCountMoreThanOrEq }}</option>
			<option value="tagCountLessThan">{{ i18n.ts._role._condition.tagCountLessThan }}</option>
			<option value="hasTagMatchOf">{{ i18n.ts._role._condition.hasTagMatchOf }}</option>
			<option value="hasFields">{{ i18n.ts._role._condition.hasFields }}</option>
			<option value="fieldCountIs">{{ i18n.ts._role._condition.fieldCountIs }}</option>
			<option value="fieldCountMoreThanOrEq">{{ i18n.ts._role._condition.fieldCountMoreThanOrEq }}</option>
			<option value="fieldCountLessThanOrEq">{{ i18n.ts._role._condition.fieldCountLessThanOrEq }}</option>
			<option value="hasFieldNameMatchOf">{{ i18n.ts._role._condition.hasFieldNameMatchOf }}</option>
			<option value="hasFieldValueMatchOf">{{ i18n.ts._role._condition.hasFieldValueMatchOf }}</option>
			<option value="and">{{ i18n.ts._role._condition.and }}</option>
			<option value="or">{{ i18n.ts._role._condition.or }}</option>
			<option value="not">{{ i18n.ts._role._condition.not }}</option>
		</MkSelect>
		<button v-if="draggable" class="drag-handle _button" :class="$style.dragHandle">
			<i class="ti ti-menu-2"></i>
		</button>
		<button v-if="draggable" class="_button" :class="$style.remove" @click="removeSelf">
			<i class="ti ti-x"></i>
		</button>
	</div>

	<div v-if="type === 'and' || type === 'or'" class="_gaps">
		<Sortable v-model="v.values" tag="div" class="_gaps" itemKey="id" handle=".drag-handle" :group="{ name: 'roleFormula' }" :animation="150" :swapThreshold="0.5">
			<template #item="{element}">
				<div :class="$style.item">
					<!-- divが無いとエラーになる https://github.com/SortableJS/vue.draggable.next/issues/189 -->
					<RolesEditorFormula :modelValue="element" draggable @update:modelValue="updated => valuesItemUpdated(updated)" @remove="removeItem(element)"/>
				</div>
			</template>
		</Sortable>
		<MkButton rounded style="margin: 0 auto;" @click="addValue"><i class="ti ti-plus"></i> {{ i18n.ts.add }}</MkButton>
	</div>

	<div v-else-if="type === 'not'" :class="$style.item">
		<RolesEditorFormula v-model="v.value"/>
	</div>

	<MkInput v-else-if="type === 'createdLessThan' || type === 'createdMoreThan'" v-model="v.sec" type="number">
		<template #suffix>sec</template>
	</MkInput>

	<MkInput v-else-if="type === 'loggedInMoreThanOrEq' || type === 'loggedInLessThanOrEq'" v-model="v.day" type="number">
		<template #suffix>day</template>
	</MkInput>

	<MkInput v-else-if="['usernameEntropyMoreThanOrEq', 'usernameEntropyLessThanOrEq', 'usernameEntropyMeanMoreThanOrEq', 'usernameEntropyMeanLessThanOrEq'].includes(type)" v-model="v.value" :min="0" :step="0.1" type="number">
		<template #suffix>bit</template>
	</MkInput>

	<MkInput v-else-if="['followersLessThanOrEq', 'followersMoreThanOrEq', 'followingLessThanOrEq', 'followingMoreThanOrEq', 'notesLessThanOrEq', 'notesMoreThanOrEq', 'tagCountIs', 'tagCountMoreThanOrEq', 'tagCountLessThan', 'fieldCountIs', 'fieldCountMoreThanOrEq', 'fieldCountLessThan'].includes(type)" v-model="v.value" type="number">
	</MkInput>

	<MkInput v-else-if="['usernameMatchOf', 'nameMatchOf', 'hostMatchOf', 'hasTagMatchOf', 'emailMatchOf', 'hasFieldNameMatchOf', 'hasFieldValueMatchOf'].includes(type)" v-model="v.pattern" type="text">
		<template #caption>{{ i18n.ts._role.patternEditDescription }}</template>
	</MkInput>

	<MkSelect v-else-if="type === 'roleAssignedTo'" v-model="v.roleId">
		<option v-for="role in roles.filter(r => r.target === 'manual')" :key="role.id" :value="role.id">{{ role.name }}</option>
	</MkSelect>

	<div v-else-if="['avatarLikelyBlurhash', 'bannerLikelyBlurhash'].includes(type)">
		<MkInput v-model="v.hash" type="text">
			<template #label>{{ i18n.ts._role.hash }}</template>
		</MkInput>
		<MkInput v-model="v.diff" type="number">
			<template #label>{{ i18n.ts._role.allowDifference }}</template>
		</MkInput>
	</div>
</div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import { v4 as uuid } from 'uuid';
import MkInput from '@/components/MkInput.vue';
import MkSelect from '@/components/MkSelect.vue';
import MkButton from '@/components/MkButton.vue';
import { i18n } from '@/i18n.js';
import { deepClone } from '@/scripts/clone.js';
import { rolesCache } from '@/cache.js';

const Sortable = defineAsyncComponent(() => import('vuedraggable').then(x => x.default));

const emit = defineEmits<{
	(ev: 'update:modelValue', value: any): void;
	(ev: 'remove'): void;
}>();

const props = defineProps<{
	modelValue: any;
	draggable?: boolean;
}>();

const v = ref(deepClone(props.modelValue));

const roles = await rolesCache.fetch();

watch(() => props.modelValue, () => {
	if (JSON.stringify(props.modelValue) === JSON.stringify(v.value)) return;
	v.value = deepClone(props.modelValue);
}, { deep: true });

watch(v, () => {
	emit('update:modelValue', v.value);
}, { deep: true });

const type = computed({
	get: () => v.value.type,
	set: (t) => {
		if (t === 'and') v.value.values = [];
		if (t === 'or') v.value.values = [];
		if (t === 'not') v.value.value = { id: uuid(), type: 'isRemote' };
		if (t === 'roleAssignedTo') v.value.roleId = '';
		if (t === 'usernameMatchOf') v.value.pattern = '';
		if (t === 'usernameEntropyMoreThanOrEq') v.value.value = 47;
		if (t === 'usernameEntropyLessThanOrEq') v.value.value = 47;
		if (t === 'usernameEntropyMeanMoreThanOrEq') v.value.value = 4.7;
		if (t === 'usernameEntropyMeanLessThanOrEq') v.value.value = 4.7;
		if (t === 'nameMatchOf') v.value.pattern = '';
		if (t === 'hostMatchOf') v.value.pattern = '';
		if (t === 'emailMatchOf') v.value.pattern = '';
		if (t === 'createdLessThan') v.value.sec = 86400;
		if (t === 'createdMoreThan') v.value.sec = 86400;
		if (t === 'loggedInMoreThanOrEq') v.value.day = 10;
		if (t === 'loggedInLessThanOrEq') v.value.day = 10;
		if (t === 'followersLessThanOrEq') v.value.value = 10;
		if (t === 'followersMoreThanOrEq') v.value.value = 10;
		if (t === 'followingLessThanOrEq') v.value.value = 10;
		if (t === 'followingMoreThanOrEq') v.value.value = 10;
		if (t === 'notesLessThanOrEq') v.value.value = 10;
		if (t === 'notesMoreThanOrEq') v.value.value = 10;
		if (t === 'avatarLikelyBlurhash') v.value.hash = '';
		if (t === 'avatarLikelyBlurhash') v.value.diff = 0;
		if (t === 'bannerLikelyBlurhash') v.value.hash = '';
		if (t === 'bannerLikelyBlurhash') v.value.diff = 0;
		if (t === 'tagCountIs') v.value.value = 10;
		if (t === 'tagCountMoreThanOrEq') v.value.value = 10;
		if (t === 'tagCountLessThan') v.value.value = 10;
		if (t === 'hasTagMatchOf') v.value.pattern = '';
		if (t === 'fieldCountIs') v.value.value = 4;
		if (t === 'fieldCountMoreThanOrEq') v.value.value = 4;
		if (t === 'fieldCountLessThan') v.value.value = 4;
		if (t === 'hasFieldNameMatchOf') v.value.pattern = '';
		if (t === 'hasFieldValueMatchOf') v.value.pattern = '';
		v.value.type = t;
	},
});

function addValue() {
	v.value.values.push({ id: uuid(), type: 'isRemote' });
}

function valuesItemUpdated(item) {
	const i = v.value.values.findIndex(_item => _item.id === item.id);
	v.value.values[i] = item;
}

function removeItem(item) {
	v.value.values = v.value.values.filter(_item => _item.id !== item.id);
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
	border: solid 2px var(--MI_THEME-divider);
	border-radius: var(--MI-radius);
	padding: 12px;

	&:hover {
		border-color: var(--MI_THEME-accent);
	}
}
</style>
