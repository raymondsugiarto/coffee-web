export type Operator = 'eq' | 'lt' | 'lte' | 'gt' | 'gte' | 'ne';

export const useFilter = (config?: Record<string, Operator>) => {
  const toQueryParams = (
    obj: Record<string, string | string[] | undefined>,
    urlSearchParams?: URLSearchParams
  ): URLSearchParams => {
    const searchParams = urlSearchParams
      ? urlSearchParams
      : new URLSearchParams();

    let idx = 0;
    for (const key in obj) {
      if (obj[key]) {
        searchParams.append(`filter[${idx}][field]`, key);
        searchParams.append(`filter[${idx}][op]`, config?.[key] ?? 'eq');
        if (typeof obj[key] === 'string') {
          searchParams.append(`filter[${idx}][val]`, obj[key]);
        } else if (Array.isArray(obj[key])) {
          let i = 0;
          for (const val of obj[key]) {
            searchParams.append(`filter[${idx}][val][${i}]`, val);
            i++;
          }
        }
        idx++;
      }
    }
    return searchParams;
  };

  const toFilterParams = (obj: Record<string, string>): URLSearchParams => {
    const searchParams = new URLSearchParams();

    const objRecord = obj;

    let idx = 0;
    for (const key in objRecord) {
      if (objRecord[key]) {
        searchParams.append(`filter[${idx}][field]`, key);
        searchParams.append(`filter[${idx}][op]`, config?.[key] ?? 'eq');
        searchParams.append(`filter[${idx}][val]`, objRecord[key]);
        idx++;
      }
    }
    return searchParams;
  };

  return { toQueryParams, toFilterParams };
};
