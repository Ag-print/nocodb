import { Modal } from 'ant-design-vue'
import type { LinkToAnotherRecordType, TableType } from 'nocodb-sdk'
import { UITypes } from 'nocodb-sdk'
import { useToast } from 'vue-toastification'
import { useProject } from './useProject'
import { TabType } from '~/composables/useTabs'
import { extractSdkResponseErrorMsg } from '~/utils'
import { useNuxtApp } from '#app'

export function useTable(onTableCreate?: (tableMeta: TableType) => void) {
  const table = reactive<{ title: string; table_name: string; columns: string[] }>({
    title: '',
    table_name: '',
    columns: ['id', 'title', 'created_at', 'updated_at'],
  })

  const { $e, $api } = useNuxtApp()
  const toast = useToast()
  const { getMeta, removeMeta } = useMetas()
  const { loadTables } = useProject()
  const { closeTab } = useTabs()
  const { sqlUi, project, tables } = useProject()

  const createTable = async () => {
    if (!sqlUi?.value) return
    const columns = sqlUi?.value?.getNewTableColumns().filter((col) => {
      if (col.column_name === 'id' && table.columns.includes('id_ag')) {
        Object.assign(col, sqlUi?.value?.getDataTypeForUiType({ uidt: UITypes.ID }, 'AG'))
        col.dtxp = sqlUi?.value?.getDefaultLengthForDatatype(col.dt)
        col.dtxs = sqlUi?.value?.getDefaultScaleForDatatype(col.dt)
        return true
      }
      return table.columns.includes(col.column_name)
    })

    const tableMeta = await $api.dbTable.create(project?.value?.id as string, {
      ...table,
      columns,
    })

    onTableCreate?.(tableMeta)
  }

  watch(
    () => table.title,
    (title) => {
      table.table_name = `${project?.value?.prefix || ''}${title}`
    },
  )

  const generateUniqueTitle = () => {
    let c = 1
    while (tables?.value?.some((t) => t.title === `Sheet${c}`)) {
      c++
    }
    table.title = `Sheet${c}`
  }

  const deleteTable = (table: TableType) => {
    $e('c:table:delete')
    // 'Click Submit to Delete The table'
    Modal.confirm({
      title: `Click Yes to Delete The table : ${table.title}`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      async onOk() {
        try {
          const meta = (await getMeta(table.id as string)) as TableType
          const relationColumns = meta?.columns?.filter((c) => c.uidt === UITypes.LinkToAnotherRecord)

          if (relationColumns?.length) {
            const refColMsgs = await Promise.all(
              relationColumns.map(async (c, i) => {
                const refMeta = (await getMeta(
                  (c?.colOptions as LinkToAnotherRecordType)?.fk_related_model_id as string,
                )) as TableType
                return `${i + 1}. ${c.title} is a LinkToAnotherRecord of ${(refMeta && refMeta.title) || c.title}`
              }),
            )
            toast.info(
              h('div', {
                innerHTML: `<div style="padding:10px 4px">Unable to delete tables because of the following.
                <br><br>${refColMsgs.join('<br>')}<br><br>
                Delete them & try again</div>`,
              }),
            )
            return
          }

          await $api.dbTable.delete(table?.id as string)

          closeTab({
            type: TabType.TABLE,
            id: table.id,
            title: table.title,
          })

          await loadTables()

          removeMeta(table.id as string)
          toast.info(`Deleted table ${table.title} successfully`)
          $e('a:table:delete')
        } catch (e: any) {
          toast.error(await extractSdkResponseErrorMsg(e))
        }
      },
    })
  }

  return { table, createTable, generateUniqueTitle, tables, project, deleteTable }
}
