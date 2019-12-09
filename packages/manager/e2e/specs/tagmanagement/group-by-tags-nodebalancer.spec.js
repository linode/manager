const { constants } = require('../../constants');
const {
  apiCreateNodeBalancers,
  removeNodeBalancers,
  timestamp
} = require('../../utils/common');
import ListNodeBalancers from '../../pageobjects/list-nodebalancers.page';

describe('Group by Tags - NodeBalancers', () => {
  const tags = ['beta', 'alpha', 'gamma'];
  let nodebalancers = [];

  const generateTagGroups = () => {
    tags.forEach(tag => {
      const nb = {
        label: `a${tag}${timestamp()}`,
        tags: [tag]
      };
      const nb1 = {
        label: `b${tag}${timestamp()}`,
        tags: [tag]
      };
      nodebalancers.push(nb);
      nodebalancers.push(nb1);
    });
  };

  const checkSortOrder = () => {
    const sortAttribute = ListNodeBalancers.sortNodeBalancersByLabel.selector.slice(
      1,
      -1
    );
    const preSort = ListNodeBalancers.sortNodeBalancersByLabel.getAttribute(
      sortAttribute
    );
    ListNodeBalancers.sortNodeBalancersByLabel.$('svg').click();
    browser.pause(500);
    browser.waitUntil(() => {
      return (
        ListNodeBalancers.sortNodeBalancersByLabel.getAttribute(
          sortAttribute
        ) !== preSort
      );
    }, constants.wait.normal);
    const postSort = ListNodeBalancers.sortNodeBalancersByLabel.getAttribute(
      sortAttribute
    );
    tags.forEach(tag => {
      const tagGroup = ListNodeBalancers.getNodeBalancersInTagGroup(tag);
      postSort === 'asc'
        ? expect(tagGroup).toEqual(tagGroup.sort().reverse())
        : expect(tagGroup).toEqual(tagGroup.sort());
    });
  };

  beforeAll(() => {
    generateTagGroups();
    apiCreateNodeBalancers(nodebalancers);
  });

  afterAll(() => {
    removeNodeBalancers('do not remove linodes');
  });

  xit('Group by tag toggle is present on NodeBalancer listing and off by default', () => {
    expect(ListNodeBalancers.groupByTagsToggle.isDisplayed()).toBe(true);
    expect(ListNodeBalancers.tagHeaders.length).toBe(0);
  });

  it('NodeBalancers can be grouped by tags', () => {
    ListNodeBalancers.groupByTags(true);
  });

  it('NodeBalancers are grouped properly by tag', () => {
    tags.forEach(tag => {
      const displayedInGroup = ListNodeBalancers.getNodeBalancersInTagGroup(
        tag
      );
      const expectedInGroup = nodebalancers
        .filter(nodebalancer => nodebalancer.tags[0] === tag)
        .map(nodebalancer => nodebalancer.label);
      expect(displayedInGroup.sort()).toEqual(expectedInGroup.sort());
    });
  });

  it('Tags headers are displayed in alphabetical order', () => {
    ListNodeBalancers.tagGroupsInAlphabeticalOrder(tags);
  });

  it('NodeBalancers are sortable within tag groups', () => {
    //Check ascending descending
    [1, 2].forEach(it => checkSortOrder());
  });

  it('NodeBalancers can be ungrouped', () => {
    ListNodeBalancers.groupByTags(false);
    expect(ListNodeBalancers.tagHeaders.length).toBe(0);
  });
});
