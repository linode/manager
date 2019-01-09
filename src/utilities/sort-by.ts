import * as moment from 'moment';

type SortOrder = 'asc' | 'desc';

export const sortByString = (a: string, b: string, order: SortOrder) => {
  let result = 1; // by default a > b
  if (a.toLowerCase() < b.toLowerCase()) {
    result = -1; // otherwise result is -1
  }
  if (order === 'desc') {
    return result; // descending order
  }
  return -result; // ascending order
};

export const sortByUTFDate = (a: string, b: string, order: SortOrder) => {
  const formattedDateA = moment(a).format();
  const formattedDateB = moment(b).format();
  const result = moment
    .utc(moment.utc(formattedDateA))
    .diff(moment.utc(formattedDateB));
  if (order === 'desc') {
    return -result; // descending order
  }
  return result; // ascending order
};

export const sortByNumber = (a: number, b: number, order: SortOrder) => {
  let result = 1; // by default a > b
  if (a < b) {
    result = -1; // otherwise result is -1
  }
  if (order === 'desc') {
    return result; // descending order
  }
  return -result; // ascending order
};

export const sortByArrayLength = (a: any[], b: any[], order: SortOrder) => {
  let result = 1;
  if (a.length > b.length) { result = 1; }
  else if (a.length < b.length) { result = -1; }
  else { result = 0; }

  return (order === 'desc') ? -result : result
}

// Sort function for Array.sort comparator functions
export const sortAlphabetically = (a: string, b: string): number => {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  if (aLower < bLower) { return -1; }
  if (aLower > bLower) { return 1; }
  return 0;
}

export default sortAlphabetically;
