<template>
  <div>
    <q-table
      ref="tableRef"
      :rows="rows"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :loading="loading"
      class="sticky-table"
      @request="onRequest"
    >
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { usePagination } from '@/composables/pagination/pagination';
import type {
  QTablePropsOnRequest,
  QTablePropsOnRequestPagination,
} from '@/composables/pagination/pagination.dto';
import type { QTable, QTableColumn, QTableProps } from 'quasar';
import { useQuasar, date } from 'quasar';
import type { Ref } from 'vue';
import { ref, onMounted } from 'vue';
import { api } from '@/boot/axios';
import type { DefaultResponse } from '@/types/response';
import type { PageTableDto } from '@/types/pagination/pagination';
import type { OrderDto } from './types/order';

interface Props {
  contactId?: string;
}
const props = defineProps<Props>();
const $q = useQuasar();
const { paginationRequest } = usePagination(api);
const rows = ref([] as OrderDto[]);
const tableRef = ref() as Ref<QTable>;
const loading = ref(false);

const columns: QTableColumn[] = [
  {
    name: 'id',
    label: '#',
    align: 'left',
    field: 'id',
    sortable: false,
  },
  {
    name: 'orderAt',
    label: 'Order At',
    align: 'left',
    field: (row) => date.formatDate(row.orderAt, 'DD-MM-YYYY'),
    sortable: false,
  },
  {
    name: 'totalQty',
    label: 'Total Qty',
    align: 'left',
    field: 'totalQty',
    sortable: false,
  },
  {
    name: 'totalAmount',
    label: 'Total Amount',
    align: 'left',
    field: 'totalAmount',
    sortable: false,
  },
];

const pagination: Ref<NonNullable<QTablePropsOnRequestPagination>> = ref({
  sortBy: 'created_at',
  descending: true,
  page: 0,
  rowsPerPage: 20,
  rowsNumber: 0,
});

const onRequest: QTableProps['onRequest'] = (tableProps) => {
  loading.value = true;

  const searchParams = new URLSearchParams();
  const tablePropsRequest: QTablePropsOnRequest = tableProps;
  if (props.contactId) {
    searchParams.set('contactID', props.contactId);
  }
  tablePropsRequest.params = searchParams;

  paginationRequest<OrderDto>(
    '/api/orders',
    tablePropsRequest,
    pagination
  )
    .then((response: DefaultResponse<PageTableDto<OrderDto>>) => {
      rows.value = response.data.contents;
    })
    .catch(() => {
      $q.notify({
        color: 'negative',
        message: 'Gagal memuat data',
      });
    })
    .finally(() => {
      loading.value = false;
    });
};

onMounted(() => {
  // get initial data from server (1st page)
  tableRef.value.requestServerInteraction();
});
</script>
