import { Box, Paper, Stack, Typography } from '@linode/ui';
import React from 'react';

import { CodeBlock } from 'src/components/CodeBlock/CodeBlock';

import styles from './CodeSnippetBrowser.module.css';

import type { SupportedLanguage } from 'src/utilities/syntax-highlighter';

export interface CodeSnippetBrowserProps {
  defaultLanguage?: string;
  languages: string[];
  snippets: Record<string, string>;
  syntaxHighlightingLanguageMap: Record<string, SupportedLanguage>;
  tabRightBorderWidthByIndex?: Partial<Record<number, number>>;
  textAreaHeight?: number;
  viewMoreEnabled?: boolean;
}

interface ViewSizeToggleButtonProps {
  label: string;
  onClick: () => void;
}

const ViewSizeToggleButton = ({
  label,
  onClick,
}: ViewSizeToggleButtonProps) => {
  return (
    <button className={styles.toggleButton} onClick={onClick} type="button">
      {label}
    </button>
  );
};

const getTabBorderRadius = (index: number, maxIndex: number) => {
  if (index === 0 && maxIndex === 0) {
    return '4px';
  }
  if (index === 0) {
    return '4px 0 0 4px';
  }
  if (index === maxIndex) {
    return '0 4px 4px 0';
  }
  return 0;
};

interface LanguageTabProps {
  index: number;
  isActive: boolean;
  label: string;
  maxIndex: number;
  onSelect: () => void;
  tabRightBorderWidthByIndex?: Partial<Record<number, number>>;
}

const LanguageTab = ({
  index,
  isActive,
  label,
  maxIndex,
  onSelect,
  tabRightBorderWidthByIndex,
}: LanguageTabProps) => (
  <Box
    onClick={onSelect}
    sx={(theme) => ({
      backgroundColor: isActive
        ? theme.palette.primary.main
        : theme.palette.background.paper,
      border: `2px solid ${theme.palette.primary.main}`,
      borderRightWidth: `${getTabRightBorderWidth(index, tabRightBorderWidthByIndex)}px`,
      borderRadius: getTabBorderRadius(index, maxIndex),
      color: isActive
        ? theme.palette.primary.contrastText
        : theme.palette.text.primary,
      cursor: 'pointer',
      px: 1.5,
      py: 0.5,
      textTransform: 'capitalize',
    })}
  >
    <Typography variant="body2">{label}</Typography>
  </Box>
);

const getTabRightBorderWidth = (
  index: number,
  tabRightBorderWidthByIndex?: Partial<Record<number, number>>
) => {
  if (!tabRightBorderWidthByIndex) {
    return index === 0 ? 0 : 1;
  }
  return tabRightBorderWidthByIndex[index] ?? 1;
};

export const CodeSnippetBrowser = ({
  languages,
  snippets,
  syntaxHighlightingLanguageMap,
  defaultLanguage,
  tabRightBorderWidthByIndex,
  textAreaHeight = 158,
  viewMoreEnabled = true,
}: CodeSnippetBrowserProps) => {
  const firstLanguage = languages[0];
  const [language, setLanguage] = React.useState<string>(
    defaultLanguage || firstLanguage || ''
  );
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [shortSnippets, setShortSnippets] = React.useState<
    Record<string, boolean>
  >({});
  const contentBoxRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (!contentBoxRef.current) {
      return;
    }

    const fits = contentBoxRef.current.scrollHeight <= textAreaHeight;
    setShortSnippets((previous) => {
      if (previous[language] === fits) {
        return previous;
      }

      return { ...previous, [language]: fits };
    });
  }, [language, textAreaHeight]);

  const alwaysExpanded = shortSnippets[language] ?? false;
  const effectivelyExpanded = !viewMoreEnabled || isExpanded || alwaysExpanded;

  return (
    <Paper sx={{ borderRadius: 1 }}>
      <Stack className={styles.tabStrip} direction="row" gap={0}>
        {languages.map((tab, index) => (
          <LanguageTab
            index={index}
            isActive={tab === language}
            key={tab}
            label={tab}
            maxIndex={languages.length - 1}
            onSelect={() => setLanguage(tab)}
            tabRightBorderWidthByIndex={tabRightBorderWidthByIndex}
          />
        ))}
      </Stack>

      <Paper className={styles.innerPaper}>
        <Box
          className={styles.contentBox}
          ref={contentBoxRef}
          sx={{
            height: effectivelyExpanded ? 'auto' : textAreaHeight,
            overflowY: effectivelyExpanded ? 'visible' : 'hidden',
          }}
        >
          <CodeBlock
            code={snippets[language]}
            language={syntaxHighlightingLanguageMap[language]}
            showLineNumbers={false}
          />

          {viewMoreEnabled && !effectivelyExpanded && (
            <div
              className={styles.fadeOverlay}
              style={{ height: textAreaHeight / 1.25 }}
            >
              <ViewSizeToggleButton
                label="VIEW MORE"
                onClick={() => setIsExpanded(true)}
              />
            </div>
          )}
        </Box>

        {viewMoreEnabled && isExpanded && !alwaysExpanded && (
          <div className={styles.viewLessContainer}>
            <ViewSizeToggleButton
              label="VIEW LESS"
              onClick={() => setIsExpanded(false)}
            />
          </div>
        )}
      </Paper>
    </Paper>
  );
};
