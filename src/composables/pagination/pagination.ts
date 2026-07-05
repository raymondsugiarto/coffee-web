import { ref } from 'vue';
import type { QTableProps } from 'quasar';
import type { Ref } from 'vue';
import type { AxiosInstance } from 'axios';
import type {
  PageTableDto,
  QTablePropsOnRequest,
  QTablePropsOnRequestPagination,
} from '@/types/pagination/pagination';
import type { DefaultResponse } from '@/types/response';

export class PageRequestDto {
  page: number | undefined = 1;
  size: number | undefined = 10;
}

export const usePagination = (api: AxiosInstance) => {
  const paginationRequest = async <T>(
    endpoint: string,
    props: QTablePropsOnRequest,
    pagination: Ref<NonNullable<QTableProps['pagination']>>
  ): Promise<DefaultResponse<PageTableDto<T>>> => {
    const { page, rowsPerPage, sortBy, descending } = props.pagination;
    const searchParams = new URLSearchParams();
    searchParams.set('page', (page - 1).toString());
    searchParams.set('size', rowsPerPage.toString());
    if (sortBy) {
      searchParams.set('sort', sortBy + ',' + (descending ? 'desc' : 'asc'));
      searchParams.set('sortBy', sortBy);
      searchParams.set('sortDir', descending ? 'desc' : 'asc');
    }
    if (props.params) {
      props.params.forEach((value, key) => {
        searchParams.set(key, value);
      });
    }
    return api
      .get<DefaultResponse<PageTableDto<T>>>(
        endpoint + '?' + searchParams.toString()
      )
      .then((response: DefaultResponse<PageTableDto<T>>) => {
        if (response) {
          const { data } = response;
          pagination.value.rowsNumber = data.totalElements;
          pagination.value.page = page;
          pagination.value.rowsPerPage = rowsPerPage;
          pagination.value.sortBy = sortBy;
          pagination.value.descending = descending;
        }
        return response;
      })
      .catch((err: Error) => {
        return Promise.reject(err);
      });
  };

  const paginationDefault: Ref<NonNullable<QTablePropsOnRequestPagination>> =
    ref({
      sortBy: 'created_at',
      descending: true,
      page: 0,
      rowsPerPage: 20,
      rowsNumber: 0,
    });

  return { paginationRequest, paginationDefault };
};
