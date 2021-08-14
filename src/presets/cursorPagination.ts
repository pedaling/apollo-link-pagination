import { FieldPolicy, Reference, StoreObject } from '@apollo/client';
import mergeWith from 'lodash.mergewith';
import uniqBy from 'lodash.uniqby';

export const cursorPagination = (idField: string = 'id'): FieldPolicy<any> => ({
  merge(existing, incoming, { readField }) {
    return mergeWith(
      { ...existing },
      { ...incoming },
      (value: Object, srcValue: Object) => {
        if (Array.isArray(value)) {
          const result = value.concat(srcValue);

          return uniqBy(result, (item: Reference | StoreObject) =>
            readField(idField, item)
          );
        }
        return undefined;
      }
    );
  },
});
