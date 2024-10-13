<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.root">
	<p :class="$style.infoText">
		{{ props.label }}
		<span v-if="props.mode === 'percentage'" :class="$style.percentage">{{ vp?.toFixed(1) ?? 'NaN' }}%</span>
		<span v-else-if="props.mode === 'fraction'" :class="$style.percentage">{{ props.value }} / {{ denominator }}</span>
		<span v-else-if="props.mode === 'value'" :class="$style.percentage">{{ props.value }}</span>
		<span v-else-if="props.mode === 'remain'" :class="$style.percentage">{{ denominator ? denominator - props.value : null }}</span>
	</p>
	<div :class="$style.meter" :style="{ background: meterBgColor }">
		<div :class="$style.meterVal" :style="[{ width: `${normalize(vp ?? 0, 0, 100)}%` }, { background: meterColor }]"></div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

export interface Props {
	value: number;
	mode?: 'percentage' | 'fraction' | 'value' | 'remain' | 'none';
	label?: string | null;
	minValue?: number;
	maxValue?: number;
	color?: string;
	backgroundColor?: string;
	overflowColor?: string;
	checkPositiveOverflow?: boolean;
	checkNegativeOverflow?: boolean;
};
const props = withDefaults(defineProps<Props>(), {
	mode: 'percentage',
	label: null,
	minValue: 0,
	maxValue: 1,
	color: 'var(--accent)',
	backgroundColor: 'var(--X11)',
	overflowColor: 'var(--error)',
	checkPositiveOverflow: true,
	checkNegativeOverflow: true,
});

const denominator = computed(() => props.maxValue - props.minValue);
const vp = computed(() => denominator.value > 0 ? ((props.value - props.minValue) / denominator.value * 100) : undefined);
const meterColor = computed(() => denominator.value > 0 && (!props.checkPositiveOverflow || props.value <= props.maxValue) ? props.color : props.overflowColor);
const meterBgColor = computed(() => denominator.value > 0 && (!props.checkNegativeOverflow || props.minValue <= props.value) ? props.backgroundColor : props.overflowColor);

function normalize(v: number, min: number, max: number) {
	return v >= min ? (v <= max ? v : max) : min;
}
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
