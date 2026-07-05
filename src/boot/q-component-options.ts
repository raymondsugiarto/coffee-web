import {
  QFile,
  QInput,
  QSelect,
  QTable,
} from 'quasar';
import type {
  ComponentConstructor,
  QInputProps,
  QSelectProps,
  QTableProps,
} from 'quasar';
import { boot } from 'quasar/wrappers';

export default boot(() => {
  SetComponentDefaults<QInputProps>(QInput, {
    outlined: true,
    dense: true,
  });
  SetComponentDefaults<QSelectProps>(QSelect, {
    outlined: true,
    dense: true,
  });
  SetComponentDefaults<QSelectProps>(QFile, {
    outlined: true,
    dense: true,
  });
  SetComponentDefaults<QTableProps>(QTable, {
    bordered: false,
    dense: false,
    flat: true,
    tableHeaderClass: 'bg-grey-2 pt-text-gray-1050',
    tableClass: 'bg-white',
    cardClass: 'bg-grey-2',
    noDataLabel: 'Data tidak ditemukan',
    rowsPerPageLabel: 'Baris per halaman',
  });
});

/**
 * Set some default properties on a component
 */
const SetComponentDefaults = <T>(
  component: ComponentConstructor<T>,
  defaults: Partial<T>
): void => {
  Object.keys(defaults).forEach((prop: string) => {
    component.props[prop] =
      Array.isArray(component.props[prop]) === true ||
      typeof component.props[prop] === 'function'
        ? {
            type: component.props[prop],
            default: (defaults as Record<string, unknown>)[prop],
          }
        : {
            ...component.props[prop],
            default: (defaults as Record<string, unknown>)[prop],
          };
  });
};
