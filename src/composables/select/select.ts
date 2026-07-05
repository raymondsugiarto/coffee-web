// import { Ref, ref } from 'vue';
// import { QSelectScrollOption, QSelectValue } from './select.dto';
// import {
//   QTablePropsOnRequest,
//   QTablePropsOnRequestPagination,
// } from '../pagination/pagination.dto';
// import { usePagination } from '../pagination/pagination';
// import { QSelect } from 'quasar';

// const { paginationRequest } = usePagination();

// export const useSelect = () => {
//   const loading = ref(false);
//   const pagination: Ref<NonNullable<QTablePropsOnRequestPagination>> = ref({
//     sortBy: 'created_at',
//     descending: true,
//     page: 1,
//     rowsPerPage: 20,
//     rowsNumber: 0,
//   });

//   const options = ref([] as QSelectValue[]) as Ref<QSelectValue[]>;
//   const lastPage = ref(10);
//   const seaarchParams = ref('');

//   const resetOptionValue = () => {
//     options.value = [];
//   };

//   const loadData = async <T>(opt: QSelectScrollOption<T>, reset?: boolean) => {
//     const { endpoint, mapper, params } = opt;
//     loading.value = true;
//     const props: QTablePropsOnRequest = {
//       pagination: pagination.value,
//       getCellValue: (col: unknown, row: unknown) => {
//         return '';
//       },
//       params: params,
//     };
//     if (reset) options.value = [];
//     await paginationRequest<T>(endpoint, props, pagination)
//       .then((response) => {
//         // reset data when first page
//         if (pagination.value.page === 1) {
//           options.value = [];
//         }
//         lastPage.value = response.totalPages;
//         options.value = options.value.concat(response.content.map(mapper));
//       })
//       .catch((err: unknown) => {
//         // Logger.error('error', err, TagCustomer.SelectCustomer);
//       })
//       .finally(() => {
//         loading.value = false;
//       });
//   };

//   const onSelectScroll = async <T>(
//     { to, index }: any,
//     opt: QSelectScrollOption<T>
//   ) => {
//     const lastIndex = options.value.length - 1;
//     // const { loading, pagination, lastPage } = request;

//     if (
//       loading.value !== true &&
//       pagination.value.page < lastPage.value &&
//       index === lastIndex
//     ) {
//       pagination.value.page += 1;

//       if (seaarchParams.value) {
//         if (!opt.params) {
//           opt.params = new URLSearchParams();
//         }
//         opt.params?.set('query', seaarchParams.value);
//       }

//       loadData<T>(opt);
//     }
//   };

//   const onFilterFn = async <T>(
//     { val, update, abort }: unknown,
//     opt: QSelectScrollOption<T>
//   ) => {
//     if (val.length > 1 && val.length < 3) {
//       abort();
//       return;
//     }
//     seaarchParams.value = val;
//     if (!opt.params) {
//       opt.params = new URLSearchParams();
//     }
//     opt.params?.set('query', val);
//     pagination.value.page = 1;
//     update(
//       loadData<T>(opt),
//       // "ref" is the Vue reference to the QSelect
//       (ref: QSelect) => {
//         if (val !== '' && ref.options && ref.options.length > 0) {
//           ref.setOptionIndex(-1); // reset optionIndex in case there is something selected
//           ref.moveOptionSelection(1, true); // focus the first selectable option and do not update the input-value
//         }
//       }
//     );
//   };

//   return {
//     onFilterFn,
//     onSelectScroll,
//     options,
//     loading,
//     loadData,
//     pagination,
//     resetOptionValue,
//   };
// };
