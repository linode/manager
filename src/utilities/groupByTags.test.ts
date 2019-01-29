import { groupByTags, NONE } from './groupByTags';
/**
 * [Tag, Linode.Linode[]]s
 */
describe('groupByTags', () => {
  it('return return a tuple[0] _ for entities without tags', () => {
    const values = [
      { id: 1, tags: [] },
      { id: 2, tags: [] },
      { id: 3, tags: [] }
    ];
    const expected = [[NONE, values]];
    const result = groupByTags(values);

    expect(result).toEqual(expected);
  });

  it('should create a Record for reach tag.', () => {
    const a = { id: 1, tags: ['ccc'] };
    const b = { id: 2, tags: ['aaa'] };
    const c = { id: 3, tags: ['bbb'] };

    const values = [a, b, c];
    const result = groupByTags(values);
    const expected = [['ccc', [a]], ['aaa', [b]], ['bbb', [c]]];
    expect(result).toEqual(expected);
  });

  it('should append to the entities list', () => {
    const a = { id: 1, tags: ['aaa'] };
    const b = { id: 2, tags: ['bbb'] };
    const c = { id: 3, tags: ['bbb'] };
    const values = [a, b, c];
    const result = groupByTags(values);
    const expected = [['aaa', [a]], ['bbb', [b, c]]];
    expect(result).toEqual(expected);
  });

  it('entities can appear in multiple entity lists.', () => {
    const a = { id: 1, tags: ['aaa'] };
    const b = { id: 2, tags: ['bbb', 'aaa'] };
    const c = { id: 3, tags: ['bbb'] };
    const values = [a, b, c];
    const result = groupByTags(values);
    const expected = [['aaa', [a, b]], ['bbb', [b, c]]];
    expect(result).toEqual(expected);
  });
});
