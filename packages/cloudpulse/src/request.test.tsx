import { AxiosHeaders } from 'axios';
import { setupInterceptorsForBase } from './request';
import { storage } from '../../manager/src/utilities/storage';
import { baseRequest } from '@linode/api-v4/lib/request';

vi.mock('../../manager/src/utilities/storage', () => ({
    storage: {
        authentication: {
            token: {
                get: vi.fn(),
            },
        },
    },
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

describe('setupInterceptorsForBase', () => {
    // Extract the exact type of the interceptor callback function from Axios/Linode SDK
    let requestInterceptor: Parameters<typeof baseRequest.interceptors.request.use>[0];
    const mockUrl = 'https://api.test.com/v4';
    const originalLocation = globalThis.window?.location;

    beforeEach(() => {
        vi.clearAllMocks();

        // Capture the interceptor function when it's registered
        vi.mocked(baseRequest.interceptors.request.use).mockImplementation((interceptor) => {
            requestInterceptor = interceptor;
            return 0; // Return interceptor ID
        });

        // Mock window.location
        Object.defineProperty(globalThis, 'window', {
            value: {
                location: {
                    pathname: '/dashboard',
                    href: 'http://localhost/dashboard',
                },
            },
            writable: true,
            configurable: true,
        });
    });

    afterEach(() => {
        if (originalLocation) {
            Object.defineProperty(globalThis, 'window', {
                value: { location: originalLocation },
                writable: true,
                configurable: true,
            });
        }
    });

    it('should register a request interceptor', () => {
        setupInterceptorsForBase(mockUrl);

        expect(baseRequest.interceptors.request.use).toHaveBeenCalledTimes(1);
        expect(baseRequest.interceptors.request.use).toHaveBeenCalledWith(
            expect.any(Function)
        );
    });

    describe('interceptor behavior', () => {
        beforeEach(() => {
            setupInterceptorsForBase(mockUrl);
        });

        it('should throw error when on oauth callback path', async () => {
            window.location.pathname = '/oauth/callback';

            const config = {
                url: '/account',
                headers: new AxiosHeaders(),
            };

            // Ensure the interceptor is defined before calling
            await expect(requestInterceptor!(config)).rejects.toThrow(
                'API calls blocked during authentication callback processing'
            );
        });

        it('should throw error when on admin callback path', async () => {
            window.location.pathname = '/admin/callback';

            const config = {
                url: '/account',
                headers: new AxiosHeaders(),
            } ;

            await expect(requestInterceptor!(config)).rejects.toThrow(
                'API calls blocked during authentication callback processing'
            );
        });

        it('should add auth token from storage when no explicit token', async () => {
            const mockToken = 'test-token-from-storage';
            vi.mocked(storage.authentication.token.get).mockReturnValue(mockToken);

            const config = {
                url: '/account',
                headers: new AxiosHeaders(),
                baseURL: 'https://old-api.com/v4',
            } ;

            const result = await requestInterceptor!(config);
            const headers = result.headers as AxiosHeaders;

            expect(headers.getAuthorization()).toBe(mockToken);
        });

        it('should use explicit auth token when provided in headers', async () => {
            const explicitToken = 'explicit-auth-token';
            const storageToken = 'storage-token';
            vi.mocked(storage.authentication.token.get).mockReturnValue(storageToken);

            const headers = new AxiosHeaders();
            headers.setAuthorization(explicitToken);

            const config = {
                url: '/account',
                headers,
                baseURL: 'https://old-api.com/v4',
            } ;

            const result = await requestInterceptor!(config);
            const resultHeaders = result.headers as AxiosHeaders;

            expect(resultHeaders.getAuthorization()).toBe(explicitToken);
        });

        it('should replace baseURL with provided url', async () => {
            vi.mocked(storage.authentication.token.get).mockReturnValue('token');

            const config = {
                url: 'https://old-api.com/v4/account',
                headers: new AxiosHeaders(),
                baseURL: 'https://old-api.com/v4',
            } ;

            const result = await requestInterceptor!(config);

            expect(result.url).toBe('https://api.test.com/v4/account');
        });

        it('should handle url without baseURL in config', async () => {
            vi.mocked(storage.authentication.token.get).mockReturnValue('token');

            const config = {
                url: 'https://api.test.com/v4/account',
                headers: new AxiosHeaders(),
            } ;

            const result = await requestInterceptor!(config);

            expect(result.url).toBe('https://api.test.com/v4/account');
        });

        it('should preserve other config properties', async () => {
            vi.mocked(storage.authentication.token.get).mockReturnValue('token');

            const config = {
                url: '/account',
                headers: new AxiosHeaders(),
                method: 'POST',
                data: { test: 'data' },
                timeout: 5000,
            } ;

            const result = await requestInterceptor!(config);

            expect(result.method).toBe('POST');
            expect(result.data).toEqual({ test: 'data' });
            expect(result.timeout).toBe(5000);
        });

        it('should work with AxiosHeaders instance', async () => {
            const mockToken = 'test-token';
            vi.mocked(storage.authentication.token.get).mockReturnValue(mockToken);

            const headers = new AxiosHeaders({
                'Content-Type': 'application/json',
            });

            const config = {
                url: '/account',
                headers,
                baseURL: 'https://old-api.com/v4',
            } ;

            const result = await requestInterceptor!(config);
            const resultHeaders = result.headers as AxiosHeaders;

            expect(resultHeaders.getAuthorization()).toBe(mockToken);
            expect(resultHeaders.get('Content-Type')).toBe('application/json');
        });
    });
});