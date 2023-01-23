import React from 'react';
import HighlightedMarkdown from 'src/components/HighlightedMarkdown';
import CopyTooltip from 'src/components/CopyTooltip';
import { useCodeBlockStyles } from './styles';
export interface Props {
  command: string;
  language: 'curl' | 'bash';
}

const CodeBlock = (props: Props) => {
  const { command, language } = props;
  const classes = useCodeBlockStyles();

  return (
    <div className={classes.commandDisplay}>
      <HighlightedMarkdown
        className={classes.commandWrapper}
        textOrMarkdown={'```\n' + command + '\n```'}
        language={language}
      />
      <CopyTooltip text={command} className={classes.copyIcon} />
    </div>
  );
};

export default CodeBlock;
