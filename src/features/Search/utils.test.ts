import { filterMatched, getMatchingTags } from './utils';

describe('getMatchingTags method', () => {
  it('should find all lowercase and uppercase matches', () => {
    const query = 'tag';
    const tags = ['tag1', 'TAG2', 'Tag3', 'something else'];
    expect(getMatchingTags(tags, query)).toHaveLength(3);
  });
});

describe('filterMatched method', () => {
  it('should find return true if either tags or label match', () => {
    expect(
      filterMatched('tags', 'TAGS', ['tag1', 'tag2', 'tag3'])
    ).toBeTruthy();
    expect(
      filterMatched('tags', 'TAG', ['tags1', 'tag2', 'tag3'])
    ).toBeTruthy();
    expect(
      filterMatched('tags', 'TAGS', ['tags1', 'tag2', 'tag3'])
    ).toBeTruthy();
  });

  it('should find return false if neither tags nor label match', () => {
    expect(filterMatched('tags', 'TAG', ['tag1', 'tag2', 'tag3'])).toBeFalsy();
    expect(filterMatched('tags', 'TAG', [])).toBeFalsy();
  });
});
