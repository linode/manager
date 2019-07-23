import { sortData } from './OrderBy';

const a = {
  name: 'april',
  hobbies: ['this', 'that', 'the other'],
  age: 43
};

const b = {
  name: 'may',
  hobbies: [],
  age: 23
};

const c = {
  name: 'june',
  hobbies: ['traditional Irish bowling'],
  age: 53
};

const d = {
  name: 'july',
  hobbies: ['one', 'two', 'three'],
  age: 53
};

const e = {
  name: 'august',
  hobbies: ['traditional Irish bowling'],
  age: 53
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
});
