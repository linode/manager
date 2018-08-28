import * as moment from 'moment';
import { sort } from 'ramda';

type SortOrder = 'asc' | 'desc';

type PropertyToCompare = 'label' | 'updated' | 'deployments_active';

export const sortByString = (order: SortOrder, propertyToCompare: PropertyToCompare) =>
  sort((a, b) => {
    let result = 1; // by default a > b
    if (a[propertyToCompare].toLowerCase() < b[propertyToCompare].toLowerCase()) {
      result = -1; // otherwise result is -1
    }
    if (order === 'desc') {
      return result; // descending order
    }
    return -result; // ascending order
  });

export const sortByUTFDate = (order: SortOrder, propertyToCompare: PropertyToCompare) =>
  sort((a, b) => {
    const result = moment.utc(b[propertyToCompare]).diff(moment.utc(a[propertyToCompare]));
    if (order === 'desc') {
      return -result; // descending order
    }
    return result; // ascending order
  });

export const sortByNumber = (order: SortOrder, propertyToCompare: PropertyToCompare) =>
  sort((a, b) => {
    let result = 1; // by default a > b
    if (a[propertyToCompare] < b[propertyToCompare]) {
      result = -1; // otherwise result is -1
    }
    if (order === 'desc') {
      return result; // descending order
    }
    return -result; // ascending order
  });
