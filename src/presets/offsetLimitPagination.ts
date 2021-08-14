import { FieldPolicy, Reference, StoreObject } from '@apollo/client';
import uniqBy from 'lodash.uniqby';

export const offsetLimitPagination = (
  idField: string = 'id'
): FieldPolicy<any> => ({
  merge(existing, incoming, { readField }) {
    return uniqBy(
      (existing ?? []).concat(incoming),
      (item: Reference | StoreObject) => readField(idField, item)
    );
  },
});
