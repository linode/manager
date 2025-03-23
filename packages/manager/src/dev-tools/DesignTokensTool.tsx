import { ThemeProvider } from '@emotion/react';
import { Box, CircleProgress, Select, Stack, light } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import * as React from 'react';

import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { themes } from 'src/utilities/theme';

import { TokenSection } from './components/Tokens/TokenSection';

import type { ThemeName } from '@linode/ui';

const _tokens = Object.entries(light.tokens ?? {});

type TokenObjects = typeof _tokens;
type TokenObject = TokenObjects[number][1];

export type RecursiveTokenObject = {
  [key: string]: RecursiveTokenObject | string;
};
export type TokenCategory = keyof NonNullable<typeof light.tokens>;

const TokenPanelContent = ({
  tokenCategory,
  tokenObject,
}: {
  tokenCategory: TokenCategory;
  tokenObject: TokenObject;
}) => {
  const [
    renderedContent,
    setRenderedContent,
  ] = React.useState<React.ReactNode | null>(null);

  React.useEffect(() => {
    const computeTokens = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = (
        <Stack direction="row" flexWrap="wrap" width="100%">
          {Object.entries(tokenObject).map(([key, value], index) => (
            <TokenSection
              category={tokenCategory}
              key={`${key}-${index}`}
              title={key}
              value={value}
              variant={key}
            />
          ))}
        </Stack>
      );
      setRenderedContent(content);
    };

    computeTokens();
  }, [tokenCategory, tokenObject]);

  if (!renderedContent) {
    return (
      <Stack height={100} justifyContent="center" mt={8} width="100%">
        <CircleProgress />
      </Stack>
    );
  }

  return renderedContent;
};

export const DesignTokensTool = () => {
  const [selectedTheme, setSelectedTheme] = React.useState<ThemeName>('light');
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [computedTokens, setComputedTokens] = React.useState(
    Object.entries(themes[selectedTheme].tokens ?? {})
  );

  const handleThemeChange = React.useCallback(
    async (
      _e: React.SyntheticEvent<Element, Event>,
      value: { value: ThemeName }
    ) => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const newTokens = Object.entries(themes[value.value].tokens ?? {});
      setComputedTokens(newTokens);
      setSelectedTheme(value.value);
      setIsLoading(false);
    },
    []
  );

  return (
    <ThemeProvider theme={themes[selectedTheme]}>
      <Box
        sx={(theme) => ({
          backgroundColor: theme.tokens.alias.Background.Normal,
          flex: 1,
          height: '100%',
          overflow: 'auto',
          position: 'absolute',
          width: '100%',
        })}
        className="dev-tools__design-tokens"
      >
        {isLoading ? (
          <Stack alignItems="center" height="100%" justifyContent="center">
            <CircleProgress />
          </Stack>
        ) : (
          <Tabs index={selectedTab} onChange={setSelectedTab}>
            <TabList>
              {computedTokens.map(([tokenCategory, _tokenObject]) => (
                <Tab key={tokenCategory}>{capitalize(tokenCategory)}</Tab>
              ))}
              <Select
                onChange={(e, value) => {
                  handleThemeChange(e, value as { value: ThemeName });
                }}
                options={Object.entries(themes).map(([themeName]) => ({
                  label: themeName,
                  value: themeName as ThemeName,
                }))}
                sx={{
                  position: 'relative',
                  top: '2px',
                }}
                value={{
                  label: selectedTheme,
                  value: selectedTheme,
                }}
                hideLabel={true}
                label="Theme"
              />
            </TabList>
            <TabPanels>
              {computedTokens.map(([tokenCategory, tokenObject], index) => (
                <SafeTabPanel index={index} key={tokenCategory}>
                  <TokenPanelContent
                    tokenCategory={tokenCategory as TokenCategory}
                    tokenObject={tokenObject}
                  />
                </SafeTabPanel>
              ))}
            </TabPanels>
          </Tabs>
        )}
      </Box>
    </ThemeProvider>
  );
};
