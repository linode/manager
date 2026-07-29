import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import * as React from 'react';
import { ThemeListener } from './ThemeListener';

// 1. Mock out the themes so we don't depend on actual complex MUI theme objects
vi.mock('../../manager/src/utilities/theme', () => ({
    themes: {
        light: { id: 'mock-light-theme' },
        dark: { id: 'mock-dark-theme' },
    },
}));

// 2. Mock MUI providers to easily spy on what theme gets injected down the tree
vi.mock('@mui/material/styles', () => ({
    StyledEngineProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="styled-engine-provider">{children}</div>
    ),
    ThemeProvider: ({ theme, children }: { theme: { id: string }; children: React.ReactNode }) => (
        <div data-testid="theme-provider" data-current-theme={theme.id}>
            {children}
        </div>
    ),
}));

describe('ThemeListener', () => {
    // Helper to dispatch the custom event cleanly
    const dispatchThemeEvent = (themeValue: string) => {
        const event = new CustomEvent('theme-preference-changed', {
            detail: { theme: themeValue },
        });
        window.dispatchEvent(event);
    };

    // Helper to mock window.matchMedia for system preference evaluations
    const mockMatchMedia = (matches: boolean) => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            configurable: true,
            value: vi.fn().mockImplementation((query: string) => ({
                matches,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Clean up document classes before every test run
        document.documentElement.className = '';
    });

    afterEach(() => {
        document.documentElement.className = '';
    });

    describe('Initial State Logic', () => {
        it('should prioritize and use the themeOverride prop if provided', () => {
            render(
                <ThemeListener themeOverride="dark">
                    <div data-testid="child">Hello</div>
                </ThemeListener>
            );

            const provider = screen.getByTestId('theme-provider');
            expect(provider.getAttribute('data-current-theme')).toBe('mock-dark-theme');
        });

        it('should default to dark theme if no override is given but DOM class contains "dark"', () => {
            document.documentElement.classList.add('dark');

            render(
                <ThemeListener>
                    <div data-testid="child">Hello</div>
                </ThemeListener>
            );

            const provider = screen.getByTestId('theme-provider');
            expect(provider.getAttribute('data-current-theme')).toBe('mock-dark-theme');
        });

        it('should default to light theme if no override is given and DOM class does not contain "dark"', () => {
            document.documentElement.classList.remove('dark');

            render(
                <ThemeListener>
                    <div data-testid="child">Hello</div>
                </ThemeListener>
            );

            const provider = screen.getByTestId('theme-provider');
            expect(provider.getAttribute('data-current-theme')).toBe('mock-light-theme');
        });
    });

    describe('Custom Event Updates', () => {
        it('should update the active theme when a valid theme-preference-changed event occurs', () => {
            render(
                <ThemeListener>
                    <div data-testid="child">Hello</div>
                </ThemeListener>
            );

            const provider = screen.getByTestId('theme-provider');
            expect(provider.getAttribute('data-current-theme')).toBe('mock-light-theme');

            // Dispatch event to switch to dark
            act(() => {
                dispatchThemeEvent('dark');
            });
            expect(provider.getAttribute('data-current-theme')).toBe('mock-dark-theme');

            // Dispatch event to switch back to light
            act(() => {
                dispatchThemeEvent('light');
            });
            expect(provider.getAttribute('data-current-theme')).toBe('mock-light-theme');
        });

        it('should check system rules when system preference event is targeted (system matches dark)', () => {
            mockMatchMedia(true); // System defaults to Dark mode

            render(
                <ThemeListener>
                    <div data-testid="child">Hello</div>
                </ThemeListener>
            );

            act(() => {
                dispatchThemeEvent('system');
            });

            const provider = screen.getByTestId('theme-provider');
            expect(provider.getAttribute('data-current-theme')).toBe('mock-dark-theme');
        });

        it('should completely ignore preference events if a themeOverride prop is active', () => {
            render(
                <ThemeListener themeOverride="light">
                    <div data-testid="child">Hello</div>
                </ThemeListener>
            );

            const provider = screen.getByTestId('theme-provider');
            expect(provider.getAttribute('data-current-theme')).toBe('mock-light-theme');

            // Attempt to force-switch theme via event
            act(() => {
                dispatchThemeEvent('dark');
            });

            // It stays locked to the light override
            expect(provider.getAttribute('data-current-theme')).toBe('mock-light-theme');
        });
    });

    describe('Lifecycle Cleanups', () => {
        it('should remove the global window listener upon component unmount', () => {
            const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

            const { unmount } = render(
                <ThemeListener>
                    <div data-testid="child">Hello</div>
                </ThemeListener>
            );

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith(
                'theme-preference-changed',
                expect.any(Function)
            );
        });
    });
});