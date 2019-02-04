import { filterMatched, getMatchingIps, getMatchingTags } from './utils';

describe('getMatchingTags method', () => {
  it('should find all lowercase and uppercase matches', () => {
    const query = 'tag';
    const tags = ['tag1', 'TAG2', 'Tag3', 'something else'];
    expect(getMatchingTags(tags, query)).toHaveLength(3);
  });
});

describe('getMatchingIps method', () => {
  it('should find all matching IPs', () => {
    const query = '122.122';
    const ips = [
      '122.122.122.123',
      '123.123.123.123',
      '125.255.122.122',
      '2342::2342:A234'
    ];
    expect(getMatchingIps(ips, query)).toHaveLength(2);
  });
  it('should return empty array if no IP is provided', () => {
    const query = '122.122';
    expect(getMatchingIps(undefined, query)).toHaveLength(0);
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

  it('should find entities by IP', () => {
    expect(
      filterMatched(
        '3023::4502',
        'TAG',
        ['tag1', 'tag2', 'tag3'],
        ['2222::3023::4502']
      )
    ).toBeTruthy();
    expect(filterMatched('tags', 'TAG', [], ['2222::3021::4502'])).toBeFalsy();
  });
});
