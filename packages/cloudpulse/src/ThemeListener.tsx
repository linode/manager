import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { themes } from '../../manager/src/utilities/theme';
import * as React from 'react';

type ThemeName = 'light' | 'dark';

interface ThemeListenerProps {
    /**
     * The children to be rendered within the ThemeListener component
     */
    children: React.ReactNode;
    /**
     * Optional prop to override the theme. If provided, the ThemeListener will not listen for theme preference changes and will always use this theme.
     */
    themeOverride?: ThemeName;
}

export const ThemeListener = (props: ThemeListenerProps) => {
    const { children, themeOverride } = props;

    // 1. Helper to extract the absolute truth of what the page looks like right now
    const getActiveThemeFromDOM = (): ThemeName => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        }
        return 'light';
    };
    const [activeTheme, setActiveTheme] = React.useState<ThemeName>(() => themeOverride ?? getActiveThemeFromDOM());

    // Update theme when themeOverride prop changes
    React.useEffect(() => {
        if (themeOverride) {
            setActiveTheme(themeOverride);
        }
    }, [themeOverride]);

    React.useEffect(() => {
        const handleThemeEvent = (e: Event) => {
            if (themeOverride) { // No need to listen for events if the theme is overridden
                return;
            }

            if (!(e instanceof CustomEvent) || e.type !== 'theme-preference-changed') { 
                // Ignore events that are not CustomEvents or not of the expected type
                return;
            }
            const preference = e.detail?.theme;

            if (preference === 'dark' || preference === 'light') {
                setActiveTheme(preference);
            } else if (preference === 'system') {
                const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setActiveTheme(systemIsDark ? 'dark' : 'light');
            }
        };

        // Listen globally on window because your custom event bubbles and penetrates shadows
        window.addEventListener('theme-preference-changed', handleThemeEvent);

        return () => {
            window.removeEventListener('theme-preference-changed', handleThemeEvent);
        };
    }, []);


    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={themes[activeTheme]}>
                {children}
            </ThemeProvider>
        </StyledEngineProvider>
    );
};