import { ThemeProvider } from '@emotion/react';
import {
  Box,
  CircleProgress,
  Select,
  Stack,
  Typography,
  light,
} from '@linode/ui';
import { capitalize } from '@linode/utilities';
import * as React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { themes } from 'src/utilities/theme';

import { TokenSection } from './components/Tokens/TokenSection';
import { countTokens, filterTokenObject } from './components/Tokens/utils';

import type { ThemeName } from '@linode/ui';

const _tokens = Object.entries(light.tokens ?? {});

export type TokenObjects = typeof _tokens;
export type TokenObject = TokenObjects[number][1];
export type RecursiveTokenObject = {
  [key: string]: RecursiveTokenObject | string;
};
export type TokenCategory = keyof NonNullable<typeof light.tokens>;

const TokenPanelContent = ({
  searchValue,
  tokenCategory,
  tokenObject,
}: {
  searchValue: string;
  tokenCategory: TokenCategory;
  tokenObject: TokenObject;
}) => {
  const [
    renderedContent,
    setRenderedContent,
  ] = React.useState<React.ReactNode | null>(null);
  const [isSearching, setIsSearching] = React.useState(false);

  React.useEffect(() => {
    const computeTokens = async () => {
      setIsSearching(true);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const filteredObject = searchValue
        ? filterTokenObject(tokenObject, searchValue.toLowerCase())
        : tokenObject;

      const totalResults = filteredObject ? countTokens(filteredObject) : 0;

      const content =
        totalResults > 0 ? (
          <Stack direction="row" flexWrap="wrap" width="100%">
            {Object.entries(filteredObject).map(([key, value], index) => (
              <TokenSection
                category={tokenCategory}
                key={`${key}-${index}`}
                title={key}
                value={value}
                variant={key}
              />
            ))}
          </Stack>
        ) : (
          <Stack sx={{ m: 2 }}>
            <Typography>
              No matching tokens found for &quot;{searchValue}&quot;
            </Typography>
          </Stack>
        );
      setRenderedContent(content);
      setIsSearching(false);
    };

    computeTokens();
  }, [tokenCategory, tokenObject, searchValue]);

  if (!renderedContent || isSearching) {
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
  const [filteredTokens, setFilteredTokens] = React.useState(computedTokens);
  const [searchValue, setSearchValue] = React.useState('');

  const handleThemeChange = React.useCallback(
    async (
      _e: React.SyntheticEvent<Element, Event>,
      value: { value: ThemeName }
    ) => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const newTokens = Object.entries(themes[value.value].tokens ?? {});
      setComputedTokens(newTokens);
      setFilteredTokens(newTokens);
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
            <Stack direction="row" sx={{ overflowX: 'auto', pr: 2 }}>
              <Stack sx={{ mx: 2 }}>
                <TabList>
                  {computedTokens.map(([tokenCategory, _tokenObject]) => (
                    <Tab disabled={searchValue !== ''} key={tokenCategory}>
                      {capitalize(tokenCategory)}
                    </Tab>
                  ))}
                </TabList>
              </Stack>
              <Select
                onChange={(e, value) => {
                  handleThemeChange(e, value as { value: ThemeName });
                }}
                options={Object.entries(themes).map(([themeName]) => ({
                  label: themeName,
                  value: themeName as ThemeName,
                }))}
                sx={{
                  mr: 1,
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
              <DebouncedSearchTextField
                errorText={
                  searchValue !== '' && searchValue.length < 3
                    ? 'Search must be at least 3 characters'
                    : ''
                }
                sx={{
                  minWidth: 275,
                  position: 'relative',
                  top: '4px',
                }}
                clearable
                hideLabel={true}
                label="Search"
                onSearch={setSearchValue}
                placeholder="Search tokens"
                value={searchValue}
              />
            </Stack>
            <TabPanels>
              <Stack sx={{ pb: 8 }}>
                {filteredTokens.map(([tokenCategory, tokenObject], index) => (
                  <SafeTabPanel index={index} key={tokenCategory}>
                    <TokenPanelContent
                      searchValue={searchValue}
                      tokenCategory={tokenCategory as TokenCategory}
                      tokenObject={tokenObject}
                    />
                  </SafeTabPanel>
                ))}
              </Stack>
            </TabPanels>
          </Tabs>
        )}
      </Box>
    </ThemeProvider>
  );
};
