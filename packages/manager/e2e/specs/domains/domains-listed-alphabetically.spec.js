const { constants } = require('../../constants');
import {
  apiCreateDomains,
  apiDeleteAllDomains,
  timestamp
} from '../../utils/common';
import ListDomains from '../../pageobjects/list-domains.page';

describe('Domain listing page', () => {
  let domains = [
    { domain: `asortingtest${timestamp()}.com` },
    { domain: `bsortingtest${timestamp()}.com` },
    { domain: `100-sortingtest${timestamp()}.com` },
    { domain: `001-sortingtest${timestamp()}.com` }
  ];

  beforeAll(() => {
    apiCreateDomains(domains);
  });

  afterAll(() => {
    apiDeleteAllDomains();
  });

  it('Domains are listed in alphabetical order by default', () => {
    expect(ListDomains.getListedDomains()).toEqual(
      domains.map(it => it.domain).sort()
    );
  });
});
