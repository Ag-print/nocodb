<script setup lang="ts">
import { inject, ref, useVModel } from '#imports'
import { EditModeInj } from '~/context'

interface Props {
  modelValue: number | null
}

interface Emits {
  (event: 'update:modelValue', model: number): void
}

const props = defineProps<Props>()

const emits = defineEmits<Emits>()

const editEnabled = inject(EditModeInj, ref(false))

const vModel = useVModel(props, 'modelValue', emits)

const focus = (el: HTMLInputElement) => el?.focus()

function onKeyDown(evt: KeyboardEvent) {
  return evt.key === '.' && evt.preventDefault()
}
</script>

<template>
  <input
    v-if="editEnabled"
    :ref="focus"
    v-model="vModel"
    class="outline-none pa-0 border-none w-full h-full prose-sm"
    type="number"
    @blur="editEnabled = false"
    @keydown="onKeyDown"
  />
  <span v-else class="prose-sm">{{ vModel }}</span>
</template>

<style scoped lang="scss">
input[type='number']:focus {
  @apply ring-transparent;
}
</style>
