import {
  sortByString,
  sortByUTFDate,
  sortByNumber,
  sortByArrayLength,
  sortByRegionLabel,
  toComparator,
} from './sort-by';

describe('sortByString', () => {
  it('returns -1 when the first value comes first alphabetically', () => {
    expect(sortByString('hello', 'HELLO')).toBe(-1);
    expect(sortByString('hello', 'world')).toBe(-1);
    expect(sortByString('hello', 'world', 'asc')).toBe(-1);
    expect(sortByString('Hello', 'Hello!')).toBe(-1);
    expect(sortByString('Linode 1', 'Linode 2')).toBe(-1);
    expect(sortByString('Linode 1', 'Linode 10')).toBe(-1);
  });

  it('returns 1 when the second value comes first alphabetically', () => {
    expect(sortByString('HELLO', 'hello')).toBe(1);
    expect(sortByString('world', 'hello')).toBe(1);
    expect(sortByString('world', 'hello', 'asc')).toBe(1);
    expect(sortByString('Hello!', 'Hello')).toBe(1);
    expect(sortByString('Linode 2', 'Linode 1')).toBe(1);
    expect(sortByString('Linode 10', 'Linode 1')).toBe(1);
  });

  it('returns 0 when the values are equal', () => {
    expect(sortByString('hello', 'hello')).toBe(0);
    expect(sortByString('hello', 'hello', 'asc')).toBe(0);
    expect(sortByString('hello', 'hello', 'desc')).toBe(0);
  });

  it('returns inverted values when sort order is descending', () => {
    expect(sortByString('hello', 'world', 'desc')).toBe(1);
    expect(sortByString('world', 'hello', 'desc')).toBe(-1);
    expect(sortByString('hello', 'hello', 'desc')).toBe(0);
  });
});

describe('sortByUTFDate', () => {
  const dateA = '2022-01-01T00:00:00';
  const dateB = '2022-06-01T12:15:30';
  const dateC = '2022-06-02T00:00:00';
  const dateD = '2023-01-01T00:00:00';

  it('returns -1 when the first value comes first chronologically', () => {
    expect(sortByUTFDate(dateA, dateB)).toBe(-1);
    expect(sortByUTFDate(dateC, dateD, 'asc')).toBe(-1);
    expect(sortByUTFDate(dateA, dateD)).toBe(-1);
    expect(sortByUTFDate(dateB, dateC, 'asc')).toBe(-1);
  });

  it('returns 1 when the second value comes first chronologically', () => {
    expect(sortByUTFDate(dateB, dateA)).toBe(1);
    expect(sortByUTFDate(dateD, dateC, 'asc')).toBe(1);
    expect(sortByUTFDate(dateD, dateA)).toBe(1);
    expect(sortByUTFDate(dateC, dateB, 'asc')).toBe(1);
  });

  it('returns 0 when the values are equal', () => {
    expect(sortByUTFDate(dateA, dateA)).toBe(0);
    expect(sortByUTFDate(dateB, dateB, 'asc')).toBe(0);
    expect(sortByUTFDate(dateC, dateC)).toBe(0);
    expect(sortByUTFDate(dateD, dateD, 'desc')).toBe(0);
  });

  it('returns inverted values when the sort order is descending', () => {
    expect(sortByUTFDate(dateA, dateB, 'desc')).toBe(1);
    expect(sortByUTFDate(dateD, dateC, 'desc')).toBe(-1);
    expect(sortByUTFDate(dateD, dateD, 'desc')).toBe(0);
  });
});

describe('sortByNumber', () => {
  it('returns -1 when the first value comes first numerically', () => {
    expect(sortByNumber(1, 2)).toBe(-1);
    expect(sortByNumber(2, 10, 'asc')).toBe(-1);
    expect(sortByNumber(30, 100)).toBe(-1);
    expect(sortByNumber(0, 1, 'asc')).toBe(-1);
    expect(sortByNumber(-1, 0, 'asc')).toBe(-1);
    expect(sortByNumber(-1, 1, 'asc')).toBe(-1);
  });

  it('returns 1 when the second value comes first numerically', () => {
    expect(sortByNumber(2, 1)).toBe(1);
    expect(sortByNumber(10, 2, 'asc')).toBe(1);
    expect(sortByNumber(100, 30)).toBe(1);
    expect(sortByNumber(1, 0, 'asc')).toBe(1);
    expect(sortByNumber(0, -1, 'asc')).toBe(1);
    expect(sortByNumber(1, -1, 'asc')).toBe(1);
  });

  it('returns 0 when the values are equal', () => {
    expect(sortByNumber(123, 123)).toBe(0);
    expect(sortByNumber(15, 15, 'asc')).toBe(0);
    expect(sortByNumber(0, 0, 'asc')).toBe(0);
    expect(sortByNumber(-100, -100, 'desc')).toBe(0);
  });

  it('returns inverted values when the sort order is descending', () => {
    expect(sortByNumber(1, 2, 'desc')).toBe(1);
    expect(sortByNumber(2, 1, 'desc')).toBe(-1);
    expect(sortByNumber(1, 1, 'desc')).toBe(0);
  });
});

describe('sortByArrayLength', () => {
  const arrayA: number[] = [];
  const arrayB: number[] = [1];
  const arrayC: number[] = [1, 2];
  const arrayD: number[] = [1, 2, 3];

  it('returns -1 when the first value has a shorter length than the second value', () => {
    expect(sortByArrayLength(arrayA, arrayB)).toBe(-1);
    expect(sortByArrayLength(arrayC, arrayD, 'asc')).toBe(-1);
    expect(sortByArrayLength(arrayA, arrayD)).toBe(-1);
    expect(sortByArrayLength(arrayB, arrayC, 'asc')).toBe(-1);
  });

  it('returns 1 when the first value has a longer length than the second value', () => {
    expect(sortByArrayLength(arrayB, arrayA)).toBe(1);
    expect(sortByArrayLength(arrayD, arrayC, 'asc')).toBe(1);
    expect(sortByArrayLength(arrayD, arrayA)).toBe(1);
    expect(sortByArrayLength(arrayC, arrayB, 'asc')).toBe(1);
  });

  it('returns 0 when the first value and second value have equal lengths', () => {
    expect(sortByArrayLength(arrayA, arrayA)).toBe(0);
    expect(sortByArrayLength(arrayB, arrayB, 'asc')).toBe(0);
    expect(sortByArrayLength(arrayC, arrayC, 'desc')).toBe(0);
    expect(sortByArrayLength(arrayD, arrayD)).toBe(0);
  });

  it('returns inverted values when the sort order is descending', () => {
    expect(sortByArrayLength(arrayA, arrayB, 'desc')).toBe(1);
    expect(sortByArrayLength(arrayD, arrayC, 'desc')).toBe(-1);
    expect(sortByArrayLength(arrayB, arrayB, 'desc')).toBe(0);
  });
});

describe('sortByRegionLabel', () => {
  const regionA = 'us-southeast'; // Atlanta, GA.
  const regionB = 'eu-central'; // Frankfurt, DE.
  const regionC = 'us-west'; // Fremont, CA.
  const regionD = 'ca-central'; // Toronto, ON.

  it('returns -1 when the first value has a region label which comes first alphabetically', () => {
    expect(sortByRegionLabel(regionA, regionB)).toBe(-1);
    expect(sortByRegionLabel(regionC, regionD, 'asc')).toBe(-1);
    expect(sortByRegionLabel(regionA, regionD)).toBe(-1);
    expect(sortByRegionLabel(regionB, regionC, 'asc')).toBe(-1);
  });

  it('returns 1 when the second value has a region label which comes first alphabetically', () => {
    expect(sortByRegionLabel(regionB, regionA)).toBe(1);
    expect(sortByRegionLabel(regionD, regionC, 'asc')).toBe(1);
    expect(sortByRegionLabel(regionD, regionA)).toBe(1);
    expect(sortByRegionLabel(regionC, regionB, 'asc')).toBe(1);
  });

  it('returns 0 when the first and second values are equal', () => {
    expect(sortByRegionLabel(regionA, regionA)).toBe(0);
    expect(sortByRegionLabel(regionB, regionB, 'asc')).toBe(0);
    expect(sortByRegionLabel(regionC, regionC, 'desc')).toBe(0);
    expect(sortByRegionLabel(regionD, regionD)).toBe(0);
  });

  it('returns inverted values when the sort order is descending', () => {
    expect(sortByRegionLabel(regionA, regionB, 'desc')).toBe(1);
    expect(sortByRegionLabel(regionD, regionC, 'desc')).toBe(-1);
    expect(sortByRegionLabel(regionB, regionB, 'desc')).toBe(0);
  });
});

describe('toComparator', () => {
  const arrayStr = ['a 10', 'a 1', 'c', 'b', 'a 2'];
  const arrayNumber = [8, 100, -3, 45, 0];
  const arrayRegions = ['ca-central', 'eu-central', 'us-east'];
  const arrayDates = [
    '2022-06-01T12:15:30',
    '2023-01-01T00:00:00',
    '2022-01-01T00:00:00',
  ];

  it('creates comparators that return ascending-sorted arrays', () => {
    arrayStr.sort(toComparator(sortByString, 'asc'));
    arrayNumber.sort(toComparator(sortByNumber));
    arrayRegions.sort(toComparator(sortByRegionLabel, 'asc'));
    arrayDates.sort(toComparator(sortByUTFDate));

    expect(arrayStr).toEqual(['a 1', 'a 2', 'a 10', 'b', 'c']);
    expect(arrayNumber).toEqual([-3, 0, 8, 45, 100]);
    expect(arrayRegions).toEqual(['eu-central', 'us-east', 'ca-central']);
    expect(arrayDates).toEqual([
      '2022-01-01T00:00:00',
      '2022-06-01T12:15:30',
      '2023-01-01T00:00:00',
    ]);
  });

  it('creates comparators that return descending-sorted arrays', () => {
    arrayStr.sort(toComparator(sortByString, 'desc'));
    arrayNumber.sort(toComparator(sortByNumber, 'desc'));
    arrayRegions.sort(toComparator(sortByRegionLabel, 'desc'));
    arrayDates.sort(toComparator(sortByUTFDate, 'desc'));

    expect(arrayStr).toEqual(['c', 'b', 'a 10', 'a 2', 'a 1']);
    expect(arrayNumber).toEqual([100, 45, 8, 0, -3]);
    expect(arrayRegions).toEqual(['ca-central', 'us-east', 'eu-central']);
    expect(arrayDates).toEqual([
      '2023-01-01T00:00:00',
      '2022-06-01T12:15:30',
      '2022-01-01T00:00:00',
    ]);
  });
});
