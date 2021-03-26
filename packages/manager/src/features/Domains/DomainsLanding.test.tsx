import { render, waitFor } from '@testing-library/react';
import * as React from 'react';
import { domainFactory } from 'src/factories/domain';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import {
  mockMatchMedia,
  wrapWithTheme,
  assertOrder,
} from 'src/utilities/testHelpers';
import {
  CombinedProps,
  DomainsLanding,
  getReduxCopyOfDomains,
} from './DomainsLanding';
const domains = domainFactory.buildList(5);

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
  classes: {
    domain: '',
    root: '',
    titleWrapper: '',
    tagWrapper: '',
    tagGroup: '',
    title: '',
    breadcrumbs: '',
    importButton: '',
  },
  domainsByID: {},
  upsertMultipleDomains: jest.fn(),
  ...reactRouterProps,
};

beforeAll(() => mockMatchMedia());

describe('Domains Landing', () => {
  it('should render a notice when there are no Linodes but at least 1 domain', () => {
    const { getByText } = render(wrapWithTheme(<DomainsLanding {...props} />));
    expect(getByText(/not being served/));
  });

  it('should sort by Domain name ascending by default', async () => {
    const { container } = render(wrapWithTheme(<DomainsLanding {...props} />));

    await waitFor(() =>
      assertOrder(container, '[data-qa-domain-label]', [
        'domain-0',
        'domain-1',
        'domain-2',
        'domain-3',
        'domain-4',
      ])
    );
  });
});

describe('getReduxCopyOfDomains fn', () => {
  it('returns corresponding domains', () => {
    const domain1 = domainFactory.build({ id: 1 });
    const domain2 = domainFactory.build({ id: 2 });
    const domain3 = domainFactory.build({ id: 3 });

    expect(
      getReduxCopyOfDomains([domain1, domain2], {
        1: domain1,
        2: domain2,
        3: domain3,
      })
    ).toEqual([domain1, domain2]);
  });
});
