import { sortByImageVersion } from './ImageSelect';

const debianItems = [
  {
    label: 'Debian 8.2',
    value: 'debian-8'
  },
  {
    label: 'Debian 10',
    value: 'debian-10'
  },
  {
    label: 'Debian 8.7',
    value: 'value-not-important'
  },
  {
    label: 'Debian 9',
    value: 'fake-value'
  }
];

const versionlessItems = [
  {
    label: 'Arch Bits',
    value: 'no-value'
  },
  {
    label: 'Arch Awesome',
    value: 'No value'
  },
  {
    label: 'B Linux',
    value: 'noValue'
  },
  {
    label: 'Arch Cloud',
    value: 'no value'
  }
];

describe('ImageSelect component', () => {
  it('should sort images by their version descending', () => {
    expect(
      debianItems.sort(sortByImageVersion).map(thisItem => thisItem.label)
    ).toEqual(['Debian 10', 'Debian 9', 'Debian 8.7', 'Debian 8.2']);
  });

  it("should sort by value if version can't be determined", () => {
    expect(versionlessItems.sort(sortByImageVersion).map(t => t.label)).toEqual(
      ['Arch Awesome', 'Arch Bits', 'Arch Cloud', 'B Linux']
    );
  });
});
