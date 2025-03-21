import { ThemeProvider } from '@emotion/react';
import { Box, CircleProgress, Stack, light } from '@linode/ui';
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

const TokenPanelContent = ({
  tokenCategory,
  tokenObject,
}: {
  tokenCategory: TokenCategory;
  tokenObject: any;
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
              <SafeTabPanel index={index} key={tokenCategory}>
                <TokenPanelContent
                  tokenCategory={tokenCategory as TokenCategory}
                  tokenObject={tokenObject}
                />
              </SafeTabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Box>
    </ThemeProvider>
  );
};
