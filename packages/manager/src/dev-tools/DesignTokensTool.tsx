import { ThemeProvider } from '@emotion/react';
import {
  Content,
  Border,
  Elevation,
  Typography,
} from '@linode/design-language-system';
import { Box, Stack } from '@linode/ui';
import * as React from 'react';

import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { themes } from 'src/utilities/theme';

import { TokenSection } from './components/Tokens/TokenSection';

const tokens = [
  [Content, 'Content'],
  [Border, 'Border'],
  [Elevation, 'Elevation'],
  [Typography, 'Typography'],
] as const;

export const DesignTokensTool = () => {
  return (
    <ThemeProvider theme={themes.light}>
      <Box
        sx={{
          backgroundColor: '#fff',
          flex: 1,
          height: '100%',
          overflow: 'auto',
          padding: 2,
          position: 'absolute',
          width: '100%',
        }}
      >
        <Tabs>
          <TabList>
            {tokens.map(([_tokenObject, tokenCategory]) => (
              <Tab key={tokenCategory}>{tokenCategory}</Tab>
            ))}
          </TabList>
          <TabPanels>
            {tokens.map(([tokenObject, tokenCategory], index) => (
              <SafeTabPanel index={index} key={tokenCategory}>
                <Stack direction="row" flexWrap="wrap" width="100%">
                  {Object.entries(tokenObject).map(
                    ([key, colorObject], index) => (
                      <TokenSection
                        category={tokenCategory}
                        key={`${key}-${index}`}
                        title={key}
                        value={colorObject}
                        variant={key}
                      />
                    )
                  )}
                </Stack>
              </SafeTabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Box>
    </ThemeProvider>
  );
};
