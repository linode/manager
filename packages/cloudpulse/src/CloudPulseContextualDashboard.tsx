import { useMemo, useEffect } from 'react';
import { Provider as ReduxStoreProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClientFactory } from '@linode/queries';
import { storeFactory } from '../../manager/src/store';
import { FeatureFlagProvider, FlagSet } from '../../manager/src/featureFlags';
import { CloudPulseDashboardWithFilters as CloudPulseDashboardWithFiltersWrapper } from '../../manager/src/features/CloudPulse/Dashboard/CloudPulseDashboardWithFilters';
import { FeatureFlagClient, launchDarklyProvider } from '@akamai/compute-ui-core/feature-flags';
import { CLOUDPULSE_ENV_MAP } from './config';
import { ThemeListener } from './ThemeListener';
import { setupInterceptorsForBase } from './request';
import './index.css';

interface Context {
    country: string;
}


export interface CloudPulseContextualDashboardProps {
    /**
     * The id of the dashboard that needs to be rendered
     */
    dashboardId?: number;
    /**
     * The region with which the resource is associated.
     */
    region?: string;
    /**
     * The resource id for which the metrics will be listed
     */
    resource: number | string;
    /**
     * The service type for which the metrics will be listed
     */
    serviceType?:
    | 'ai'
    | 'blockstorage'
    | 'dbaas'
    | 'firewall'
    | 'linode'
    | 'lke'
    | 'logs'
    | 'netloadbalancer'
    | 'nodebalancer'
    | 'objectstorage';
    /**
     * Launch Darkly API key. Required
     */
    launchDarklyId?: string;

    /**
     * Environment in which the library is used
     */
    environment: Environment;

    /**
     * Optional prop to override the theme. If provided, the ThemeListener will not listen for theme preference changes and will always use this theme.
     */
    themeName?: 'light' | 'dark';
}

export type Environment = 'production' | 'staging' | 'devcloud';


export const CloudPulseContextualDashboard = (
    props: CloudPulseContextualDashboardProps
) => {

    const { launchDarklyId, environment, themeName } = props;

    let launchDarklyIdToUse = launchDarklyId ?? CLOUDPULSE_ENV_MAP[environment].ldId;

    // Create feature flag client once
    const featureFlagClient = useMemo(() => {
        return new FeatureFlagClient<FlagSet, Context>({
            provider: launchDarklyProvider({
                clientId: launchDarklyIdToUse,
            }),
        });
    }, [launchDarklyIdToUse]);
    // Initialize feature flags once
    useEffect(() => {
        featureFlagClient.start();
    }, [featureFlagClient]);

    // Create store and set up interceptors once
    const store = useMemo(() => {
        const newStore = storeFactory();
        // Set up request interceptors to automatically add auth token from storage
        // The token will be picked up from the consuming app's oauthClient storage
        setupInterceptorsForBase(CLOUDPULSE_ENV_MAP[environment].apiUrl);
        return newStore;
    }, [environment]);

    return (
        <ReduxStoreProvider store={store}>
            <QueryClientProvider client={queryClientFactory('longLived')}>
                <FeatureFlagProvider client={featureFlagClient}>
                    <ThemeListener themeOverride={themeName}>
                        <CloudPulseDashboardWithFiltersWrapper {...props} />
                    </ThemeListener>
                </FeatureFlagProvider>
            </QueryClientProvider>
        </ReduxStoreProvider>
    );
};