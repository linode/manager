import { render, waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import { KubernetesLanding } from './KubernetesLanding';

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({ data: { restricted: true } }),
}));

vi.mock('src/queries/profile/profile', async () => {
  const actual = await vi.importActual('src/queries/profile/profile');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

describe('Kubernetes Landing', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });
  it('should have the "Create Cluster" button disabled for restricted users', async () => {
    queryMocks.useProfile.mockReturnValue({ data: { restricted: true } });

    const { container } = render(wrapWithTheme(<KubernetesLanding />));

    const createClusterButton = container.querySelector('button');

    expect(createClusterButton).toBeInTheDocument();
    expect(createClusterButton).toHaveTextContent('Create Cluster');
    expect(createClusterButton).toBeDisabled();
  });

  it('should have the "Create Cluster" button enabled for users with full access', async () => {
    queryMocks.useProfile.mockReturnValue({ data: { restricted: false } });

    const loadingTestId = 'circle-progress';

    const { container, getByTestId } = render(
      wrapWithTheme(<KubernetesLanding />)
    );

    expect(getByTestId(loadingTestId)).toBeInTheDocument();
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const createClusterButton = container.querySelector('button');

    expect(createClusterButton).toBeInTheDocument();
    expect(createClusterButton).toHaveTextContent('Create Cluster');
    expect(createClusterButton).not.toBeDisabled();
  });
});
