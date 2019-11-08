const { constants } = require('../../constants');
import {
  timestamp,
  createVolumes,
  apiDeleteAllVolumes
} from '../../utils/common';
import VolumeDetail from '../../pageobjects/linode-detail/linode-detail-volume.page';

xdescribe('Group by Tag - Volumes', () => {
  const tags = [
    `b${timestamp().toLowerCase()}`,
    `a${timestamp().toLowerCase()}`,
    `c${timestamp().toLowerCase()}`
  ];
  let volumes = [];

  const generateTagGroups = () => {
    tags.forEach(tag => {
      const vol = {
        label: `a${tag[0]}${timestamp()}.org`,
        tags: [tag]
      };
      const vol1 = {
        label: `b${tag[0]}${timestamp()}.org`,
        tags: [tag]
      };
      volumes.push(vol);
      volumes.push(vol1);
    });
  };

  const checkSortOrder = () => {
    const sortAttribute = VolumeDetail.sortVolumesByLabel.selector.slice(1, -1);
    const preSort = VolumeDetail.sortVolumesByLabel.getAttribute(sortAttribute);
    VolumeDetail.sortVolumesByLabel.$('svg').click();
    browser.pause(500);
    browser.waitUntil(() => {
      return (
        VolumeDetail.sortVolumesByLabel.getAttribute(sortAttribute) !== preSort
      );
    }, constants.wait.normal);
    const postSort = VolumeDetail.sortVolumesByLabel.getAttribute(
      sortAttribute
    );
    tags.forEach(tag => {
      const tagGroup = VolumeDetail.getVolumesInTagGroup(tag);
      postSort === 'asc'
        ? expect(tagGroup).toEqual(tagGroup.sort().reverse())
        : expect(tagGroup).toEqual(tagGroup.sort());
    });
  };

  beforeAll(() => {
    generateTagGroups();
    createVolumes(volumes);
  });

  afterAll(() => {
    apiDeleteAllVolumes();
  });

  xit('Group by tag toggle is present on Volume listing and off by default', () => {
    expect(VolumeDetail.groupByTagsToggle.isDisplayed()).toBe(true);
    expect(VolumeDetail.tagHeaders.length).toBe(0);
  });

  it('Volumes can be grouped by tags', () => {
    VolumeDetail.groupByTags(true);
  });

  it('Volumes are grouped properly by tag', () => {
    tags.forEach(tag => {
      const displayedInGroup = VolumeDetail.getVolumesInTagGroup(tag);
      const expectedInGroup = volumes
        .filter(volume => volume.tags[0] === tag)
        .map(volume => volume.label);
      expect(displayedInGroup.sort()).toEqual(expectedInGroup.sort());
    });
  });

  it('Tags headers are displayed in alphabetical order', () => {
    VolumeDetail.tagGroupsInAlphabeticalOrder(tags);
  });

  it('Volumes are sortable within tag groups', () => {
    //Check ascending descending
    [1, 2].forEach(it => checkSortOrder());
  });

  it('Volumes can be ungrouped', () => {
    VolumeDetail.groupByTags(false);
    expect(VolumeDetail.tagHeaders.length).toBe(0);
  });
});
