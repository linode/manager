import { AxiosHeaders } from 'axios';

import { storage } from '../../manager/src/utilities/storage';
import { baseRequest } from '@linode/api-v4/lib/request';

export const setupInterceptorsForBase = (url: string) => {
    baseRequest.interceptors.request.use(async (config) => {
        if (
            window.location.pathname === '/oauth/callback' ||
            window.location.pathname === '/admin/callback'
        ) {
            throw new Error(
                'API calls blocked during authentication callback processing'
            );
        }

        const headers = new AxiosHeaders(config.headers);

        // If headers are explicitly passed to our endpoint via
        // setHeaders(), we don't want this overridden.
        const hasExplicitAuthToken = headers.hasAuthorization();

        const token = storage.authentication.token.get() ?? null;
        const bearer = hasExplicitAuthToken ? headers.getAuthorization() : token;
        headers.setAuthorization(bearer);

        const modifiedUrl = config.url?.replace(config.baseURL ?? url, url);

        return {
            ...config,
            headers,
            url: modifiedUrl,
        };
    });
};