import { isDataEmpty } from './LongviewLineGraph';

describe('isDataEmpty helper function', () => {
  it('should return true for an empty data set', () => {
    expect(
      isDataEmpty([
        {
          label: 'Series 1',
          data: [],
          borderColor: 'blue',
        },
      ])
    ).toBe(true);
  });

  it('should return true for an empty data set with multiple (empty) entries', () => {
    expect(
      isDataEmpty([
        {
          label: 'Series 1',
          data: [],
          borderColor: 'blue',
        },
        {
          label: 'Series 2',
          data: [],
          borderColor: 'green',
        },
      ])
    ).toBe(true);
  });

  it('should return false if the dataset is not empty', () => {
    expect(
      isDataEmpty([
        {
          label: 'Series 1',
          data: [
            [1, 2],
            [2, 3],
          ],
          borderColor: 'blue',
        },
        {
          label: 'Series 2',
          data: [],
          borderColor: 'green',
        },
      ])
    ).toBe(false);
  });
});
