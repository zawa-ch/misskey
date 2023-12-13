<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.root">
	<p :class="$style.infoText">
		{{ props.label }}
		<span v-if="props.mode === 'percentage'" :class="$style.percentage">{{ vp.toFixed(1) }}%</span>
		<span v-else-if="props.mode === 'fraction'" :class="$style.percentage">{{ props.value }} / {{ props.denominator }}</span>
		<span v-else-if="props.mode === 'remain'" :class="$style.percentage">{{ props.denominator ? props.denominator - props.value : null }}</span>
	</p>
	<div :class="$style.meter" :style="{ background: meterBgColor }">
		<div :class="$style.meterVal" :style="[{ width: `${vp}%` }, { background: meterColor }]"></div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';

const props = withDefaults(defineProps<{
	value: number;
	label: string | null;
	mode: 'percentage' | 'fraction' | 'remain' | 'none';
	denominator: number | null;
	color: string | null;
	overflowColor: string | null;
	checkPositiveOverflow: boolean;
	checkNegativeOverflow: boolean;
}>(), {
	label: null,
	mode: 'percentage',
	denominator: null,
	color: null,
	overflowColor: null,
	checkPositiveOverflow: true,
	checkNegativeOverflow: true,
});

const vp = $computed(() => props.value / (props.denominator ?? 1) * 100);
const meterColor = $computed(() => (!props.checkPositiveOverflow || vp <= 100) ? (props.color ?? 'var(--accent)') : (props.overflowColor ?? 'var(--error)'));
const meterBgColor = $computed(() => (!props.checkNegativeOverflow || 0 <= vp) ? 'var(--X11)' : 'var(--error)');
</script>

<style lang="scss" module>
.root {
	padding: 0 12px 8px;
}

.infoText {
	display: flex;
	margin: 0 0 2px 0;
	font-size: 0.75em;
	line-height: 18px;
	opacity: 0.8;
}

.percentage {
	margin-left: auto;
	font-weight: bold;
}

.meter {
	width: 100%;
	overflow: hidden;
	border-radius: 8px;
}

.meterVal {
	height: 4px;
	transition: width .3s cubic-bezier(0.23, 1, 0.32, 1);
}
</style>
