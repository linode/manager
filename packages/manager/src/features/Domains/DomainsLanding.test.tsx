import { render, cleanup, waitFor } from '@testing-library/react';
import * as React from 'react';
import { domainFactory } from 'src/factories/domain';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { wrapWithTheme, assertOrder } from 'src/utilities/testHelpers';
import { CombinedProps, DomainsLanding } from './DomainsLanding';
const domains = domainFactory.buildList(5);

afterEach(cleanup);

const props: CombinedProps = {
  domainsData: domains,
  domainsLoading: false,
  domainsError: {},
  domainsLastUpdated: 0,
  domainsResults: domains.length,
  isRestrictedUser: false,
  isLargeAccount: false,
  howManyLinodesOnAccount: 0,
  shouldGroupDomains: false,
  createDomain: jest.fn(),
  updateDomain: jest.fn(),
  deleteDomain: jest.fn(),
  getAllDomains: jest.fn(),
  getDomainsPage: jest.fn(),
  upsertDomain: jest.fn(),
  linodesLoading: false,
  openForCloning: jest.fn(),
  openForCreating: jest.fn(),
  openForEditing: jest.fn(),
  enqueueSnackbar: jest.fn(),
  closeSnackbar: jest.fn(),
  ldClient: {} as any,
  flags: {},
  classes: {
    domain: '',
    dnsWarning: '',
    root: '',
    titleWrapper: '',
    tagWrapper: '',
    tagGroup: '',
    title: '',
    breadcrumbs: '',
    importButton: ''
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

  // @todo remove skip once large accounts logic is in place
  it('should sort by Domain name ascending by default', async () => {
    const { container } = render(wrapWithTheme(<DomainsLanding {...props} />));

    await waitFor(() =>
      assertOrder(container, '[data-qa-label]', [
        'domain-0',
        'domain-1',
        'domain-2',
        'domain-3',
        'domain-4'
      ])
    );
  });
});
