import { createDisplayPage } from './Paginate';

describe('createDisplayPage', () => {
  it('creates a page', () => {
    const values = ['a', 'b', 'c', 'd', 'e'];

    expect(createDisplayPage(1, 2)(values)).toStrictEqual(['a', 'b']);
    expect(createDisplayPage(2, 2)(values)).toStrictEqual(['c', 'd']);
    expect(createDisplayPage(3, 2)(values)).toStrictEqual(['e']);

    // Verify our source array was not modified
    expect(values).toHaveLength(5);
  });
});
