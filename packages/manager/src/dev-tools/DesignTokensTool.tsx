import { ThemeProvider } from '@emotion/react';
import { light } from '@linode/ui';
import { Box, Stack } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import * as React from 'react';

import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { themes } from 'src/utilities/theme';

import { TokenSection } from './components/Tokens/TokenSection';

const tokens = Object.entries(light.tokens ?? {});

export type TokenCategory = keyof NonNullable<typeof light.tokens>;

export const DesignTokensTool = () => {
  return (
    <ThemeProvider theme={themes.light}>
      <Box
        sx={{
          backgroundColor: '#fff',
          flex: 1,
          height: '100%',
          overflow: 'auto',
          position: 'absolute',
          width: '100%',
        }}
        className="dev-tools__design-tokens"
      >
        <Tabs>
          <TabList>
            {tokens.map(([tokenCategory, _tokenObject]) => (
              <Tab key={tokenCategory}>{capitalize(tokenCategory)}</Tab>
            ))}
          </TabList>

          <TabPanels>
            {tokens.map(([tokenCategory, tokenObject], index) => (
              <React.Suspense
                fallback={<div>Loading...</div>}
                key={tokenCategory}
              >
                <SafeTabPanel index={index} key={tokenCategory}>
                  <Stack direction="row" flexWrap="wrap" width="100%">
                    {Object.entries(tokenObject).map(([key, value], index) => {
                      return (
                        <TokenSection
                          category={tokenCategory as TokenCategory}
                          key={`${key}-${index}`}
                          title={key}
                          value={value}
                          variant={key}
                        />
                      );
                    })}
                  </Stack>
                </SafeTabPanel>
              </React.Suspense>
            ))}
          </TabPanels>
        </Tabs>
      </Box>
    </ThemeProvider>
  );
};
