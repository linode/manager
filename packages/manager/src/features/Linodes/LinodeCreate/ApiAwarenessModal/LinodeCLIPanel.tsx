import { Notice, Typography } from '@linode/ui';
import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { CodeBlock } from 'src/components/CodeBlock/CodeBlock';
import { Link } from 'src/components/Link';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { sendApiAwarenessClickEvent } from 'src/utilities/analytics/customEventAnalytics';
import { generateCLICommand } from 'src/utilities/codesnippets/generate-cli';

import { useLinodeCreateQueryParams } from '../utilities';

import type { LinodeCreateFormValues } from '../utilities';
import type { CreateLinodeRequest } from '@linode/api-v4/lib/linodes';

export interface LinodeCLIPanelProps {
  index: number;
  payLoad: CreateLinodeRequest;
  title: string;
}

export const LinodeCLIPanel = ({
  index,
  payLoad,
  title,
}: LinodeCLIPanelProps) => {
  const { params } = useLinodeCreateQueryParams();

  // @TODO - Linode Interfaces
  // DX support (CLI, integrations, sdks) for Linode Interfaces is not yet available. Remove this when it is.
  const showDXCodeSnippets = payLoad.interface_generation !== 'linode';

  const linodeCLIAction = params.type;

  const { getValues } = useFormContext<LinodeCreateFormValues>();
  const sourceLinodeID = getValues('linode.id');

  const cliCommand = useMemo(
    () => generateCLICommand(payLoad, sourceLinodeID, linodeCLIAction),
    [linodeCLIAction, payLoad, sourceLinodeID]
  );

  return (
    <SafeTabPanel index={index}>
      <Typography variant="body1">
        Before running the command below, the Linode CLI needs to be installed
        and configured on your system. See the{' '}
        <Link
          onClick={() => {
            sendApiAwarenessClickEvent(
              'link',
              'Install and Configure the Linode CLI'
            );
          }}
          to="https://techdocs.akamai.com/cloud-computing/docs/install-and-configure-the-cli"
        >
          Install and Configure the Linode CLI
        </Link>{' '}
        guide for instructions. To learn more and to use the Linode CLI for
        tasks, review additional{' '}
        <Link
          onClick={() => {
            sendApiAwarenessClickEvent('link', 'Linode CLI Guides');
          }}
          to="https://techdocs.akamai.com/cloud-computing/docs/cli"
        >
          Linode CLI Guides
        </Link>
        .
      </Typography>
      {!showDXCodeSnippets && (
        <Notice
          spacingTop={16}
          text="Linode CLI support to create Linodes using Linode Interfaces is
              coming soon."
          variant="info"
        />
      )}
      {showDXCodeSnippets && (
        <CodeBlock analyticsLabel={title} code={cliCommand} language={'bash'} />
      )}
    </SafeTabPanel>
  );
};
