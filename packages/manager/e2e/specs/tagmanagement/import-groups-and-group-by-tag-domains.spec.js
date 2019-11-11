const { constants } = require('../../constants');
import {
  apiCreateDomains,
  apiDeleteAllDomains,
  timestamp
} from '../../utils/common';
import Dashboard from '../../pageobjects/dashboard.page';
import ImportGroupsAsTagsDrawer from '../../pageobjects/import-groups-as-tags-drawer.page';
import ListDomains from '../../pageobjects/list-domains.page';

xdescribe('Domain Tag Management Suite', () => {
  const groupsAsTags = [
    `a${timestamp().toLowerCase()}`,
    `b${timestamp().toLowerCase()}`
  ];
  let domains = [];

  const generateDomainGroups = () => {
    groupsAsTags.forEach(group => {
      for (let i = 0; i < 3; i++) {
        const domain = {
          domain: `test${group}${i}.com`,
          group: group
        };
        domains.push(domain);
      }
    });
  };

  const domainsInGroup = group => {
    return domains
      .filter(domain => domain.group === group)
      .map(domain => domain.domain);
  };

  const checkSortOrder = () => {
    const order = ListDomains.sortTableByHeader('Domain');
    groupsAsTags.forEach(tag => {
      const expectedDomainsInGroup = domainsInGroup(tag);
      const expectedOrder =
        order === 'asc'
          ? expectedDomainsInGroup.sort()
          : expectedDomainsInGroup.sort().reverse();
      expect(ListDomains.getDomainsInTagGroup(tag)).toEqual(expectedOrder);
    });
  };

  beforeAll(() => {
    generateDomainGroups();
    apiCreateDomains(domains);
    browser.url(constants.routes.dashboard);
    Dashboard.baseElemsDisplay();
  });

  afterAll(() => {
    apiDeleteAllDomains();
  });

  describe('Import Domain Groups as Tags', function() {
    it('Import domain groups as tags', () => {
      Dashboard.openImportDrawerButton.click();
      ImportGroupsAsTagsDrawer.drawerDisplays();
      const groupsToImport = ImportGroupsAsTagsDrawer.domainGroups.map(group =>
        group.getText().replace('- ', '')
      );
      expect(groupsToImport.sort()).toEqual(groupsAsTags.sort());
      ImportGroupsAsTagsDrawer.submitButton.click();
      Dashboard.drawerBase.waitForDisplayed(constants.wait.minute, true);
      Dashboard.toastDisplays(
        'Your display groups have been imported successfully.'
      );
    });

    it('Verify display groups are applied as tags to Domains', () => {
      browser.url(constants.routes.domains);
      ListDomains.baseElemsDisplay();
      /* we are no longer displaying tags on the domains page so this will never pass need to refactor
      groupsAsTags.forEach(tag => {
        const domainsInGroup = domains.filter(domain => domain.group === tag);
        console.log(`domains in group => ${domainsInGroup}`);
        domainsInGroup.forEach(domain => {
          const domainTag = ListDomains.getDomainTags(domain.domain);
          expect(domainTag).toEqual([domain.group]);
          });
      });
      */
    });
  });

  describe('Group Domains by Tag', () => {
    it('Group Domain by Tag', () => {
      expect(ListDomains.groupByTagsToggle.isDisplayed()).toBe(true);
      ListDomains.groupByTags(true);
    });

    it('Domains are properly grouped', () => {
      groupsAsTags.forEach(tag => {
        const expectedDomainsInGroup = domainsInGroup(tag);
        expect(ListDomains.getDomainsInTagGroup(tag).sort()).toEqual(
          expectedDomainsInGroup.sort()
        );
      });
    });

    it('Tag Groups are displayed in alphabetical order', () => {
      ListDomains.tagGroupsInAlphabeticalOrder(groupsAsTags);
    });

    it('Domains are sortable within tag groups', () => {
      [1, 2].forEach(i => checkSortOrder());
    });

    it('Domains can be ungrouped by tags', () => {
      ListDomains.groupByTags(false);
      expect(ListDomains.tagHeaders.length).toBe(0);
    });
  });
});
