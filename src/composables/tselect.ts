import { ref, shallowRef } from 'vue';
import type { AxiosInstance } from 'axios';
import type {
  PageTableDto,
  QTablePropsOnRequest,
  QTablePropsOnRequestPagination,
} from '@/types/pagination/pagination';
import type { Ref } from 'vue';
import type { QSelectScrollOption, QSelectValue } from '@/types/components/tselect';
import { usePagination } from './pagination/pagination';
import type { filterFnArgs } from '@/types/components/tselect';
import { useQuasar } from 'quasar';
import type { DefaultResponse } from '@/types/response';

const ROWS_PER_PAGE = 20;
const INITIAL_PAGE = 1;
const INDEX_PAGE = 1;
const INCREMENT_PAGE = 1;

const MIN_SKIP_SEARCH_LENGTH = 0;
const MAX_SKIP_SEARCH_LENGTH = 3;

export const useSelect = <T>(api: AxiosInstance) => {
  const loading = ref(false);
  const previousSearch = ref('');
  const $q = useQuasar();

  const pagination: Ref<NonNullable<QTablePropsOnRequestPagination>> = ref({
    sortBy: 'created_at',
    descending: true,
    page: INITIAL_PAGE,
    rowsPerPage: ROWS_PER_PAGE,
  });

  const DEFAULT_LAST_PAGE = ROWS_PER_PAGE;
  const { paginationRequest } = usePagination(api);
  const options = shallowRef<QSelectValue<T>[]>([]);
  const lastPage = ref(DEFAULT_LAST_PAGE);
  const searchValue = ref('');

  const resetOptions = () => {
    pagination.value.page = INITIAL_PAGE;
    lastPage.value = DEFAULT_LAST_PAGE;
    options.value = [];
  };

  const loadData = async (opt: QSelectScrollOption<T>) => {
    const { endpoint, mapper, params } = opt;
    loading.value = true;
    const tablePropsRequest: QTablePropsOnRequest = {
      pagination: pagination.value,
      getCellValue: () => {
        return '';
      },
      params: params,
    };

    await paginationRequest<T>(endpoint, tablePropsRequest, pagination)
      .then((response: DefaultResponse<PageTableDto<T>>) => {
        loading.value = false;
        const { data } = response;

        lastPage.value = data.totalPages;
        options.value = options.value.concat(data.contents.map(mapper));
      })
      .catch((err) => {
        $q.notify({
          message: err.toString(),
          type: 'negative',
        });
      });
  };

  const onSelectScroll = async (
    { index }: { index: number; to: number },
    opt: QSelectScrollOption<T>
  ) => {
    const lastIndex = options.value.length - INDEX_PAGE;

    if (
      !loading.value &&
      pagination.value.page < lastPage.value &&
      index === lastIndex
    ) {
      // Load more data
      pagination.value.page += INCREMENT_PAGE;

      if (searchValue.value) {
        if (!opt.params) {
          opt.params = new URLSearchParams();
        }
        opt.params?.set('query', searchValue.value);
      }

      await loadData(opt);
    }
  };

  const onFilterFn = (
    { val, doneFn, abortFn }: filterFnArgs,
    opt: QSelectScrollOption<T>
  ) => {
    if (
      val.length > MIN_SKIP_SEARCH_LENGTH &&
      val.length < MAX_SKIP_SEARCH_LENGTH
    ) {
      abortFn();
      return;
    }

    searchValue.value = val;
    if (!opt.params) {
      opt.params = new URLSearchParams();
    }
    opt.params?.set('query', val);

    if (
      (pagination.value.page === 1 && previousSearch.value === '') ||
      previousSearch.value !== val
    ) {
      resetOptions();
      pagination.value.page = 1;
      previousSearch.value = val;

      doneFn(() => {
        void loadData(opt);
      });
    } else {
      doneFn(() => {});
    }
  };

  return {
    loading,
    pagination,
    options,
    loadData,
    onFilterFn,
    onSelectScroll,
    resetOptions,
  };
};
