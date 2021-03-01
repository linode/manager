import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { assertOrder, wrapWithTheme } from 'src/utilities/testHelpers';
import {
  getInitialValuesFromUserPreferences,
  OrderBy,
  sortData,
} from './OrderBy';

const a = {
  name: 'april',
  hobbies: ['this', 'that', 'the other'],
  age: 43,
};

const b = {
  name: 'may',
  hobbies: [],
  age: 23,
};

const c = {
  name: 'june',
  hobbies: ['traditional Irish bowling'],
  age: 53,
};

const d = {
  name: 'july',
  hobbies: ['one', 'two', 'three'],
  age: 53,
};

const e = {
  name: 'august',
  hobbies: ['traditional Irish bowling'],
  age: 53,
};

describe('OrderBy', () => {
  describe('sortData function', () => {
    const data = [a, b, c, d, e];
    it('should sort by string', () => {
      const order = sortData('name', 'asc')(data);
      expect(order).toEqual([a, e, d, c, b]);
    });
    it('should handle the selected order (asc or desc)', () => {
      const order = sortData('name', 'desc')(data);
      expect(order).toEqual([b, c, d, e, a]);
    });
    it('should sort by number', () => {
      const order = sortData('age', 'asc')(data);
      expect(order).toEqual([b, a, c, d, e]);
    });
    it('should sort by array length', () => {
      const order = sortData('hobbies', 'asc')(data);
      expect(order).toEqual([b, c, e, a, d]);
    });
  });

  describe('getInitialValuesFromUserPreferences', () => {
    const preferences = {
      sortKeys: {
        ['listening-services']: {
          orderBy: 'test-order',
          order: 'desc' as any,
        },
      },
    };
    it('should return values from query params if available', () => {
      expect(
        getInitialValuesFromUserPreferences(
          '',
          preferences,
          { order: 'desc', orderBy: 'test-key' },
          'default',
          'asc'
        )
      ).toEqual({ order: 'desc', orderBy: 'test-key' });
    });
    it('should return values from preferences if the preference key exists', () => {
      expect(
        getInitialValuesFromUserPreferences(
          'listening-services',
          preferences,
          {},
          'default',
          'desc'
        )
      ).toEqual({ orderBy: 'test-order', order: 'desc' });
    });

    it("should return the defaults if the key isn't found", () => {
      expect(
        getInitialValuesFromUserPreferences(
          'listening-services',
          {},
          {},
          'default',
          'asc'
        )
      ).toEqual({ order: 'asc', orderBy: 'default' });
    });

    it('should return the defaults if there is no preference key provided', () => {
      expect(
        getInitialValuesFromUserPreferences(
          '',
          preferences,
          {},
          'default',
          'asc'
        )
      ).toEqual({ order: 'asc', orderBy: 'default' });
    });
  });

  describe('component', () => {
    const componentProps = {
      preferences: {},
      getUserPreferences: jest.fn(),
      updateUserPreferences: jest.fn(),
    };

    it('re-sorts (previously) sorted data when the order changes', () => {
      const data = [
        { name: 'april', age: 50 },
        { name: 'may', age: 50 },
      ];

      const { container, getByTestId } = render(
        wrapWithTheme(
          <OrderBy data={data} order="desc" orderBy="name" {...componentProps}>
            {({ data, handleOrderChange }) => {
              return (
                <>
                  {data.map((d) => (
                    <div key={d.name} data-qa-name>
                      {d.name}
                    </div>
                  ))}
                  <button
                    data-testid="change-order"
                    onClick={() => handleOrderChange('age', 'asc')}
                  >
                    Change Order
                  </button>
                </>
              );
            }}
          </OrderBy>
        )
      );
      // First, the data should be sorted according to props.
      assertOrder(container, '[data-qa-name]', ['may', 'april']);

      // Now, change the order to sort by age.
      fireEvent.click(getByTestId('change-order'));

      // Since the ages are the same, the data doesn't need to be re-sorted.
      assertOrder(container, '[data-qa-name]', ['may', 'april']);
    });
  });
});
