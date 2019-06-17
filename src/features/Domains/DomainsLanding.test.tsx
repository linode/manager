import * as React from 'react';
import { render } from 'react-testing-library';
import { domains } from 'src/__data__/domains';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { CombinedProps, DomainsLanding } from './DomainsLanding';

const props: CombinedProps = {
  domainsData: domains,
  domainsLoading: false,
  howManyLinodesOnAccount: 0,
  domainActions: {
    createDomain: jest.fn(),
    updateDomain: jest.fn(),
    deleteDomain: jest.fn()
  },
  groupByTag: true,
  toggleGroupByTag: jest.fn(),
  classes: {
    domain: '',
    dnsWarning: '',
    root: '',
    titleWrapper: '',
    tagWrapper: '',
    tagGroup: '',
    title: ''
  },
  ...reactRouterProps
};

window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn()
  };
});

describe('Domains Landing', () => {
  it('should render a notice when there are no Linodes but at least 1 domain', () => {
    const { getByText } = render(wrapWithTheme(<DomainsLanding {...props} />));
    expect(getByText(/not being served/));
  });
});
