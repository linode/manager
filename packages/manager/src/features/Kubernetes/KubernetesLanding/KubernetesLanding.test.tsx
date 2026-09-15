import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { KubernetesLanding } from './KubernetesLanding';

const queryMocks = vi.hoisted(() => ({
  useLkePermissions: vi.fn(() => ({
    data: {
      create_lkecluster: false,
    },
  })),
  useProfile: vi.fn().mockReturnValue({ data: { restricted: true } }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

vi.mock('src/features/IAM/hooks/useLkePermissions', () => ({
  useLkePermissions: queryMocks.useLkePermissions,
}));

describe('Kubernetes Landing', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });
  it('should have the "Create Cluster" button disabled for restricted users', async () => {
    queryMocks.useProfile.mockReturnValue({ data: { restricted: true } });
    queryMocks.useLkePermissions.mockReturnValue({
      data: { create_lkecluster: false },
    });

    const loadingTestId = 'circle-progress';

    const { container, getByTestId } = renderWithTheme(<KubernetesLanding />);

    expect(getByTestId(loadingTestId)).toBeInTheDocument();
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const createClusterButton = container.querySelector('button');

    expect(createClusterButton).toBeInTheDocument();
    expect(createClusterButton).toHaveTextContent('Create Cluster');
    expect(createClusterButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('should have the "Create Cluster" button enabled for users with full access', async () => {
    queryMocks.useProfile.mockReturnValue({ data: { restricted: false } });
    queryMocks.useLkePermissions.mockReturnValue({
      data: { create_lkecluster: true },
    });

    const loadingTestId = 'circle-progress';

    const { container, getByTestId } = renderWithTheme(<KubernetesLanding />);

    expect(getByTestId(loadingTestId)).toBeInTheDocument();
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const createClusterButton = container.querySelector('button');

    expect(createClusterButton).toBeInTheDocument();
    expect(createClusterButton).toHaveTextContent('Create Cluster');
    expect(createClusterButton).not.toHaveAttribute('aria-disabled', 'true');
  });
});
