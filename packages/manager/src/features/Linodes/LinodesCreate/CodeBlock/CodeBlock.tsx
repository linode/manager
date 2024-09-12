import { useLDClient } from 'launchdarkly-react-client-sdk';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';
import { sendApiAwarenessClickEvent } from 'src/utilities/analytics/customEventAnalytics';

import {
  StyledCommandDiv,
  StyledCopyTooltip,
  StyledHighlightedMarkdown,
} from './CodeBlock.styles';

export interface CodeBlockProps {
  command: string;
  commandType: string;
  language: 'bash';
  ldTrackingKey?: string;
}

export const CodeBlock = (props: CodeBlockProps) => {
  const flags = useFlags();
  const ldClient = useLDClient();

  const { command, commandType, language, ldTrackingKey } = props;

  const apicliButtonCopy = flags?.testdxtoolabexperiment;

  const handleCopyIconClick = () => {
    sendApiAwarenessClickEvent('Copy Icon', commandType);
    if (ldTrackingKey) {
      ldClient?.track(ldTrackingKey, {
        variation: apicliButtonCopy,
      });
    }
  };

  return (
    <StyledCommandDiv>
      <StyledHighlightedMarkdown
        language={language}
        textOrMarkdown={'```\n' + command + '\n```'}
      />
      <StyledCopyTooltip onClickCallback={handleCopyIconClick} text={command} />
    </StyledCommandDiv>
  );
};
