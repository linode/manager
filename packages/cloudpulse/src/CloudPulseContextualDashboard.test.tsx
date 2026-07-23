import { render, screen } from '@testing-library/react';
import * as React from 'react';

import { CloudPulseContextualDashboard } from './CloudPulseContextualDashboard';

const mockStart = vi.fn().mockResolvedValue(undefined);

vi.mock('@akamai/compute-ui-core/feature-flags', () => ({
    FeatureFlagClient: vi.fn().mockImplementation(function () {
        return {
            start: mockStart,
            ready: vi.fn().mockResolvedValue(undefined),
        };
    }),
    launchDarklyProvider: vi.fn().mockReturnValue({
        initialize: vi.fn(),
    }),
}));

// Mock manager dependencies
vi.mock('../../manager/src/store', () => ({
    storeFactory: vi.fn(() => ({
        getState: vi.fn(() => ({})),
        subscribe: vi.fn(),
        dispatch: vi.fn(),
        replaceReducer: vi.fn(),
    })),
}));

vi.mock('../../manager/src/featureFlags', () => ({
    FeatureFlagProvider: ({ children }: { children: React.ReactNode }) => children,
    FlagSet: {},
}));

vi.mock('../../manager/src/features/CloudPulse/Dashboard/CloudPulseDashboardWithFilters', () => ({
    CloudPulseDashboardWithFilters: (props: Record<string, unknown>) => (
        <div data-testid="dashboard-content" data-props={JSON.stringify(props)}>
            Dashboard Content
        </div>
    ),
}));

vi.mock('../../manager/src/utilities/storage', () => ({
    storage: {
        authentication: {
            token: {
                get: vi.fn(() => 'test-token'),
            },
        },
    },
}));

vi.mock('@linode/queries', () => ({
    queryClientFactory: vi.fn(() => ({
        clear: vi.fn(),
        getQueryCache: vi.fn(),
        getMutationCache: vi.fn(),
        mount: vi.fn(),
        unmount: vi.fn(),
        isFetching: vi.fn(() => 0),
        isMutating: vi.fn(() => 0),
        getDefaultOptions: vi.fn(() => ({})),
        setDefaultOptions: vi.fn(),
        getQueryDefaults: vi.fn(() => ({})),
        setQueryDefaults: vi.fn(),
        getMutationDefaults: vi.fn(() => ({})),
        setMutationDefaults: vi.fn(),
    })),
}));

vi.mock('@linode/api-v4/lib/request', () => ({
    baseRequest: {
        interceptors: {
            request: {
                use: vi.fn(),
            },
        },
    },
}));

describe('CloudPulseDashboardWithFilters component tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const getWrappedProps = (element: HTMLElement): Record<string, unknown> => {
        return JSON.parse(element.getAttribute('data-props') || '{}');
    };

    it('renders the CloudPulseContextualDashboard component for production environment', () => {
        render(
            <CloudPulseContextualDashboard
                resource={1}
                serviceType="dbaas"
                environment='production'
            />
        );

        const dashboardContent = screen.getByTestId('dashboard-content');
        expect(dashboardContent).toBeInTheDocument();

        expect(mockStart).toHaveBeenCalledTimes(1);
        expect(getWrappedProps(dashboardContent).environment).toBe('production');
    });

    it('renders the CloudPulseContextualDashboard component for staging environment', () => {
        render(
            <CloudPulseContextualDashboard
                resource={1}
                serviceType="linode"
                environment='staging'
            />
        );

        const dashboardContent = screen.getByTestId('dashboard-content');
        expect(getWrappedProps(dashboardContent).environment).toBe('staging');
    });

    it('renders the CloudPulseContextualDashboard component for devcloud environment', () => {
        render(
            <CloudPulseContextualDashboard
                resource={1}
                serviceType="lke"
                environment='devcloud'
            />
        );

        const dashboardContent = screen.getByTestId('dashboard-content');
        expect(getWrappedProps(dashboardContent).environment).toBe('devcloud');
    });

    it('accepts optional launchDarklyId prop', () => {
        const customLdId = 'custom-ld-id-12345';

        render(
            <CloudPulseContextualDashboard
                resource={1}
                serviceType="dbaas"
                environment='production'
                launchDarklyId={customLdId}
            />
        );

        const dashboardContent = screen.getByTestId('dashboard-content');
        expect(getWrappedProps(dashboardContent).launchDarklyId).toBe(customLdId);
    });

    it('accepts optional themeName prop', () => {
        render(
            <CloudPulseContextualDashboard
                resource={1}
                serviceType="dbaas"
                environment='production'
                themeName='dark'
            />
        );

        const dashboardContent = screen.getByTestId('dashboard-content');
        expect(getWrappedProps(dashboardContent).themeName).toBe('dark');
    });

    it('handles dashboardId prop', () => {
        render(
            <CloudPulseContextualDashboard
                resource={1}
                serviceType="dbaas"
                environment='production'
                dashboardId={123}
            />
        );

        const dashboardContent = screen.getByTestId('dashboard-content');
        expect(getWrappedProps(dashboardContent).dashboardId).toBe(123);
    });

    it('handles region prop for objectstorage', () => {
        render(
            <CloudPulseContextualDashboard
                resource="test-bucket"
                serviceType="objectstorage"
                environment='production'
                region="us-east"
            />
        );

        const dashboardContent = screen.getByTestId('dashboard-content');
        expect(getWrappedProps(dashboardContent).region).toBe('us-east');
    });
});