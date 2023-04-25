import React from 'react';
import HighlightedMarkdown from 'src/components/HighlightedMarkdown';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { sendEvent } from 'src/utilities/analytics';
import { useCodeBlockStyles } from './styles';
export interface Props {
  command: string;
  language: 'bash';
  commandType: string;
}

const CodeBlock = (props: Props) => {
  const { command, language, commandType } = props;
  const classes = useCodeBlockStyles();

  const handleCopyIconClick = () => {
    sendApiAwarenessClickEvent('Copy Icon', commandType);
  };

  return (
    <div className={classes.commandDisplay}>
      <HighlightedMarkdown
        className={classes.commandWrapper}
        textOrMarkdown={'```\n' + command + '\n```'}
        language={language}
      />
      <CopyTooltip
        text={command}
        className={classes.copyIcon}
        onClickCallback={handleCopyIconClick}
      />
    </div>
  );
};

export default CodeBlock;
