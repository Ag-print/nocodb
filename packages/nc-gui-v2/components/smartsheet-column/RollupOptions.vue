<script setup lang="ts">
import { UITypes, isSystemColumn, isVirtualCol } from 'nocodb-sdk'
import { useColumnCreateStoreOrThrow } from '#imports'
import { MetaInj } from '~/context'

const { formState, validateInfos, onDataTypeChange, setAdditionalValidations } = $(useColumnCreateStoreOrThrow())
const { tables } = $(useProject())
const meta = $(inject(MetaInj))
const { metas } = $(useMetas())

setAdditionalValidations({
  fk_relation_column_id: [{ required: true, message: 'Required' }],
  fk_rollup_column_id: [{ required: true, message: 'Required' }],
  rollup_function: [{ required: true, message: 'Required' }],
})

const relationNames = {
  mm: 'Many To Many',
  hm: 'Has Many',
}

const aggrFunctionsList = [
  { text: 'count', value: 'count' },
  { text: 'min', value: 'min' },
  { text: 'max', value: 'max' },
  { text: 'avg', value: 'avg' },
  { text: 'min', value: 'min' },
  { text: 'sum', value: 'sum' },
  { text: 'countDistinct', value: 'countDistinct' },
  { text: 'sumDistinct', value: 'sumDistinct' },
  { text: 'avgDistinct', value: 'avgDistinct' },
]

if (!formState.fk_relation_column_id) formState.fk_relation_column_id = null
if (!formState.fk_rollup_column_id) formState.fk_rollup_column_id = null
if (!formState.rollup_function) formState.rollup_function = null

const refTables = $computed(() => {
  if (!tables || !tables.length) {
    return []
  }

  return meta.columns
    .filter((c) => c.uidt === UITypes.LinkToAnotherRecord && c.colOptions.type !== 'bt' && !c.system)
    .map((c) => ({
      col: c.colOptions,
      column: c,
      ...tables.find((t) => t.id === c.colOptions.fk_related_model_id),
    }))
})

const columns = $computed(() => {
  const selectedTable = refTables.find((t) => t.column.id === formState.fk_relation_column_id)
  if (!selectedTable?.id) {
    return []
  }

  return metas[selectedTable.id].columns.filter((c) => !isVirtualCol(c.uidt) && !isSystemColumn(c))
})
</script>

<template>
  <div class="p-4 w-full flex flex-col border-2 mb-2 mt-4">
    <div class="w-full flex flex-row space-x-2">
      <a-form-item class="flex w-1/2 pb-2" :label="$t('labels.childTable')" v-bind="validateInfos.fk_relation_column_id">
        <a-select v-model:value="formState.fk_relation_column_id" size="small" @change="onDataTypeChange">
          <a-select-option v-for="(table, index) in refTables" :key="index" :value="table.col.fk_column_id">
            <div class="flex flex-row items-center space-x-0.5">
              <div class="font-weight-bold text-xs">{{ table.column.title }}</div>
              <div class="text-[0.45rem]">({{ relationNames[table.col.type] }} {{ table.title || table.table_name }})</div>
            </div>
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item class="flex w-1/2" :label="$t('labels.childColumn')" v-bind="validateInfos.fk_rollup_column_id">
        <a-select
          v-model:value="formState.fk_rollup_column_id"
          name="fk_rollup_column_id"
          size="small"
          @change="onDataTypeChange"
        >
          <a-select-option v-for="(column, index) in columns" :key="index" :value="column.id">
            {{ column.title }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </div>
    <a-form-item label="Aggregate function" v-bind="validateInfos.rollup_function">
      <a-select v-model:value="formState.rollup_function" size="small" @change="onDataTypeChange">
        <a-select-option v-for="(func, index) in aggrFunctionsList" :key="index" :value="func.value">
          {{ func.text }}
        </a-select-option>
      </a-select>
    </a-form-item>
  </div>
</template>

<style scoped></style>
