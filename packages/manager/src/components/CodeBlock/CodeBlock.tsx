import { useLDClient } from 'launchdarkly-react-client-sdk';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';
import { useIsAkamaiAccount } from 'src/hooks/useIsAkamaiAccount';
import { sendApiAwarenessClickEvent } from 'src/utilities/analytics/customEventAnalytics';

import {
  StyledCommandDiv,
  StyledCopyTooltip,
  StyledHighlightedMarkdown,
} from './CodeBlock.styles';

import type { SupportedLanguage } from 'src/components/HighlightedMarkdown/HighlightedMarkdown';

export interface CodeBlockProps {
  command: string;
  /** Label for analytics */
  commandType: string;
  handleCopyIconClick?: () => void;
  /** The command language */
  language: SupportedLanguage;
  ldTrackingKey?: string;
}

export const CodeBlock = (props: CodeBlockProps) => {
  const flags = useFlags();
  const ldClient = useLDClient();
  const { isAkamaiAccount: isInternalAccount } = useIsAkamaiAccount();

  const {
    command,
    commandType,
    handleCopyIconClick,
    language,
    ldTrackingKey,
  } = props;

  const apicliButtonCopy = flags?.testdxtoolabexperiment;

  const _handleCopyIconClick = () => {
    sendApiAwarenessClickEvent('Copy Icon', commandType);
    if (ldTrackingKey && !isInternalAccount) {
      ldClient?.track(ldTrackingKey, {
        variation: apicliButtonCopy,
      });
      ldClient?.flush();
    }
  };

  return (
    <StyledCommandDiv>
      <StyledHighlightedMarkdown
        language={language}
        textOrMarkdown={'```\n' + command + '\n```'}
      />
      <StyledCopyTooltip
        onClickCallback={handleCopyIconClick ?? _handleCopyIconClick}
        text={command}
      />
    </StyledCommandDiv>
  );
};
