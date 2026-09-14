import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Quotas } from './Quotas';
import {
  objectStorageQuotaService,
  volumesQuotaService,
} from './quotaServices';

const mocks = vi.hoisted(() => ({
  useQuotaServices: vi.fn(),
  useIsQuotasIamEnabled: vi.fn(),
  useNavigate: vi.fn(),
  usePermissions: vi.fn(),
  useSearch: vi.fn(),
}));

vi.mock('src/features/Account/Quotas/hooks/useQuotaServices', () => ({
  useQuotaServices: mocks.useQuotaServices,
}));

vi.mock('src/features/IAM/hooks/useIsQuotasIamEnabled', () => ({
  useIsQuotasIamEnabled: mocks.useIsQuotasIamEnabled,
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: mocks.usePermissions,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: mocks.useNavigate,
    useSearch: mocks.useSearch,
  };
});

vi.mock('src/features/Account/Quotas/QuotaServicePanel', () => ({
  QuotaServicePanel: (props: Record<string, any>) => (
    <div data-testid="quota-service-panel">
      isFetching:{String(props.isFetchingServices)}
      selectedService:{String(Boolean(props.selectedService))}
      availableServicesLength:{String(props.availableServices?.length ?? 0)}
    </div>
  ),
}));

vi.mock('src/features/Account/Quotas/QuotasPanel/QuotasPanel', () => ({
  QuotasPanel: (props: Record<string, any>) => (
    <div data-testid="quotas-panel">scope:{String(props.scope)}</div>
  ),
}));

/** The usage banner passes its copy via the `text` prop, which lands on the custom element. */
const getUsageBannerText = () =>
  Array.from(
    document.querySelectorAll<HTMLElement & { text?: string }>(
      'cds-notification-banner'
    )
  )
    .map(
      (banner) =>
        banner.text ??
        banner.getAttribute('text') ??
        banner.shadowRoot?.textContent ??
        ''
    )
    .find((text) => text.includes('view usage for'));

describe('Quotas', () => {
  beforeEach(() => {
    mocks.useQuotaServices.mockReset();
    mocks.useIsQuotasIamEnabled.mockReset();
    mocks.useIsQuotasIamEnabled.mockReturnValue({ isQuotasIamEnabled: true });
    mocks.useNavigate.mockReset();
    mocks.useSearch.mockReset();
    mocks.usePermissions.mockReset();
    mocks.usePermissions.mockReturnValue({
      data: { view_volume_quota_usage: true },
    });
  });

  it('renders loading state when services are being fetched', () => {
    mocks.useQuotaServices.mockReturnValue({ data: null, isFetching: true });
    // useSearch not used in this branch but stub anyway
    mocks.useSearch.mockReturnValue({});
    mocks.useNavigate.mockReturnValue(vi.fn());

    const { getByTestId, queryByTestId } = renderWithTheme(<Quotas />);

    expect(getByTestId('quota-service-panel')).toHaveTextContent(
      'isFetching:true'
    );
    expect(queryByTestId('quotas-panel')).toBeNull();
  });

  it('renders service panel when services available and no service selected', () => {
    const service = objectStorageQuotaService();
    mocks.useQuotaServices.mockReturnValue({
      data: [service],
      isFetching: false,
    });
    mocks.useSearch.mockReturnValue({});
    mocks.useNavigate.mockReturnValue(vi.fn());

    const { getByTestId, queryByTestId } = renderWithTheme(<Quotas />);

    const panel = getByTestId('quota-service-panel');
    expect(panel).toHaveTextContent('isFetching:false');
    expect(panel).toHaveTextContent('selectedService:false');
    expect(panel).toHaveTextContent('availableServicesLength:1');

    // no QuotasPanel rendered because no service selected via search
    expect(queryByTestId('quotas-panel')).toBeNull();
  });

  it('renders QuotasPanel for each available scope when a service is selected via search', () => {
    const service = objectStorageQuotaService();
    mocks.useQuotaServices.mockReturnValue({
      data: [service],
      isFetching: false,
    });
    mocks.useSearch.mockReturnValue({ service: service.type });
    mocks.useNavigate.mockReturnValue(vi.fn());

    const { getAllByTestId } = renderWithTheme(<Quotas />);

    // objectStorageQuotaService defines scopes that include 'obj-endpoint' (and possibly 'global') depending on flag
    const panels = getAllByTestId('quotas-panel');
    // at least one panel should be rendered for the service scopes
    expect(panels.length).toBeGreaterThanOrEqual(1);
    // ensure the first panel contains its scope prop
    expect(panels[0]).toHaveTextContent('scope:');
  });

  it('resets search if the provided service query param is not available', () => {
    const service = objectStorageQuotaService();
    // available services do not include the invalid type
    mocks.useQuotaServices.mockReturnValue({
      data: [service],
      isFetching: false,
    });
    mocks.useSearch.mockReturnValue({ service: 'unknown-service' });

    const navigateMock = vi.fn();
    mocks.useNavigate.mockReturnValue(navigateMock);

    renderWithTheme(<Quotas />);

    // useEffect should call navigate to update search and clear the invalid service param
    expect(navigateMock).toHaveBeenCalled();
    // ensure it was called with an object that includes a `search` function
    const calledWith = navigateMock.mock.calls[0][0];
    expect(typeof calledWith.search).toBe('function');
    // invoking the provided search updater should not throw (it returns an object)
    expect(() => calledWith.search(() => ({}))).not.toThrow();
  });

  it('renders a restricted services banner when Quotas RBAC is active and services are restricted', () => {
    mocks.useQuotaServices.mockReturnValue({
      data: [],
      isFetching: false,
      restrictedServices: [volumesQuotaService],
    });
    mocks.useSearch.mockReturnValue({});
    mocks.useNavigate.mockReturnValue(vi.fn());

    const { getByText } = renderWithTheme(<Quotas />);

    getByText(/You don't have permissions to view quotas for the following/);
    getByText('Volumes');
  });

  it('does not render the restricted services banner when Quotas RBAC is not active', () => {
    mocks.useIsQuotasIamEnabled.mockReturnValue({ isQuotasIamEnabled: false });
    mocks.useQuotaServices.mockReturnValue({
      data: [],
      isFetching: false,
      restrictedServices: [],
    });
    mocks.useSearch.mockReturnValue({});
    mocks.useNavigate.mockReturnValue(vi.fn());

    const { queryByText } = renderWithTheme(<Quotas />);

    expect(
      queryByText(/You don't have permissions to view quotas for the following/)
    ).toBeNull();
  });

  it('does not render the restricted services banner when there are no restricted services', () => {
    mocks.useQuotaServices.mockReturnValue({
      data: [],
      isFetching: false,
      restrictedServices: [],
    });
    mocks.useSearch.mockReturnValue({});
    mocks.useNavigate.mockReturnValue(vi.fn());

    const { queryByText } = renderWithTheme(<Quotas />);

    expect(
      queryByText(/You don't have permissions to view quotas for the following/)
    ).toBeNull();
  });

  it('does not render the restricted services banner while services are still fetching', () => {
    mocks.useQuotaServices.mockReturnValue({
      data: null,
      isFetching: true,
      restrictedServices: [volumesQuotaService],
    });
    mocks.useSearch.mockReturnValue({});
    mocks.useNavigate.mockReturnValue(vi.fn());

    const { queryByText } = renderWithTheme(<Quotas />);

    expect(
      queryByText(/You don't have permissions to view quotas for the following/)
    ).toBeNull();
  });

  it('renders a usage permission banner when a volumes service is selected and the user lacks usage permission', () => {
    mocks.useQuotaServices.mockReturnValue({
      data: [volumesQuotaService],
      isFetching: false,
      restrictedServices: [],
    });
    mocks.useSearch.mockReturnValue({ service: volumesQuotaService.type });
    mocks.useNavigate.mockReturnValue(vi.fn());
    mocks.usePermissions.mockReturnValue({
      data: { view_volume_quota_usage: false },
    });

    renderWithTheme(<Quotas />);

    expect(getUsageBannerText()).toMatch(
      /You don't have permissions to view usage for Volumes quotas/
    );
  });

  it('does not render the usage permission banner when the user has usage permission', () => {
    mocks.useQuotaServices.mockReturnValue({
      data: [volumesQuotaService],
      isFetching: false,
      restrictedServices: [],
    });
    mocks.useSearch.mockReturnValue({ service: volumesQuotaService.type });
    mocks.useNavigate.mockReturnValue(vi.fn());
    mocks.usePermissions.mockReturnValue({
      data: { view_volume_quota_usage: true },
    });

    renderWithTheme(<Quotas />);

    expect(getUsageBannerText()).toBeUndefined();
  });

  it('does not render the usage permission banner when Quotas RBAC is not active', () => {
    mocks.useIsQuotasIamEnabled.mockReturnValue({ isQuotasIamEnabled: false });
    mocks.useQuotaServices.mockReturnValue({
      data: [volumesQuotaService],
      isFetching: false,
      restrictedServices: [],
    });
    mocks.useSearch.mockReturnValue({ service: volumesQuotaService.type });
    mocks.useNavigate.mockReturnValue(vi.fn());
    mocks.usePermissions.mockReturnValue({
      data: { view_volume_quota_usage: false },
    });

    renderWithTheme(<Quotas />);

    expect(getUsageBannerText()).toBeUndefined();
  });

  it('does not render the usage permission banner when no service is selected', () => {
    mocks.useQuotaServices.mockReturnValue({
      data: [volumesQuotaService],
      isFetching: false,
      restrictedServices: [],
    });
    mocks.useSearch.mockReturnValue({});
    mocks.useNavigate.mockReturnValue(vi.fn());
    mocks.usePermissions.mockReturnValue({
      data: { view_volume_quota_usage: false },
    });

    renderWithTheme(<Quotas />);

    expect(getUsageBannerText()).toBeUndefined();
  });
});
