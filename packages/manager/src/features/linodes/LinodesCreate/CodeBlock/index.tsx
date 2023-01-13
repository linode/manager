import React from 'react';

import HighlightedMarkdown from 'src/components/HighlightedMarkdown';
import CopyTooltip from 'src/components/CopyTooltip';

import { useCodeBlockStyles } from './styles';

const command = `curl -H "Content-Type: application/json" \\ \n -H "Authorization: Bearer Token" \\ \n -X POST -d '{
  "backup_id": 1234,
  "backups_enabled": true,
  "backups_enabled": "true",
}' `;

const CodeBlock = () => {
  const classes = useCodeBlockStyles();

  return (
    <div className={classes.commandAndCopy}>
      <div className={classes.commandDisplay}>
        <HighlightedMarkdown
          textOrMarkdown={'```\n' + command + '\n```'}
          language={'curl'}
        />
        <CopyTooltip
          text={command}
          className={classes.copyIcon}
          // onClickCallback={() => {}}
        />
      </div>
    </div>
  );
};

export default CodeBlock;
