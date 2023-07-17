import { isDataEmpty } from './LongviewLineGraph';

describe('isDataEmpty helper function', () => {
  it('should return true for an empty data set', () => {
    expect(
      isDataEmpty([
        {
          borderColor: 'blue',
          data: [],
          label: 'Series 1',
        },
      ])
    ).toBe(true);
  });

  it('should return true for an empty data set with multiple (empty) entries', () => {
    expect(
      isDataEmpty([
        {
          borderColor: 'blue',
          data: [],
          label: 'Series 1',
        },
        {
          borderColor: 'green',
          data: [],
          label: 'Series 2',
        },
      ])
    ).toBe(true);
  });

  it('should return false if the dataset is not empty', () => {
    expect(
      isDataEmpty([
        {
          borderColor: 'blue',
          data: [
            [1, 2],
            [2, 3],
          ],
          label: 'Series 1',
        },
        {
          borderColor: 'green',
          data: [],
          label: 'Series 2',
        },
      ])
    ).toBe(false);
  });
});
