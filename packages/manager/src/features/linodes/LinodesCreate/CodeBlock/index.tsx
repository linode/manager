/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
import React from 'react';

import HighlightedMarkdown from 'src/components/HighlightedMarkdown';
import CopyTooltip from 'src/components/CopyTooltip';

import { useCodeBlockStyles } from './styles';

const generateCommand = (payload) => {
  const partA = `curl -H "Content-Type: application/json" -H "Authorization: Bearer 6f455d47ae8a5769022efa3435cfc1e49132069e08e6c8cc496b2fe0ab40ac18" -X POST -d '`;

  const partB = JSON.stringify({
    // authorized_users: payload.authorized_users,
    // backup_id: payload.backup_id,
    backups_enabled: payload.backups_enabled,
    // booted: payload.booted,
    image: payload.image,
    region: payload.region,
    root_pass: payload.root_pass,
    // stackcript_id: payload.stackcript_id,
    // stackscript_data: payload.stackscript_data,
    // tags: payload.tags,
    type: payload.type,
  });

  const url = `' https://api.linode.com/v4/linode/instances \\ \n`;

  console.log('partA', partA);
  console.log('partB', partB);
  console.log('url', url);
  console.log('cli payload', partA + partB + url);

  return partA + partB + url;
};

export interface Props {
  builtPayload: () => Object;
}

const CodeBlock = (props: Props) => {
  const { builtPayload } = props;
  const classes = useCodeBlockStyles();

  console.log('***********', builtPayload());
  const command = generateCommand(builtPayload());

  return (
    <div className={classes.commandAndCopy}>
      <div className={classes.commandDisplay}>
        <HighlightedMarkdown
          textOrMarkdown={'```\n' + command + '\n```'}
          language={'curl'}
        />
        <CopyTooltip text={command} className={classes.copyIcon} />
      </div>
    </div>
  );
};

export default CodeBlock;
