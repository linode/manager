import { useLDClient } from 'launchdarkly-react-client-sdk';
import React, { useMemo } from 'react';

import { Link } from 'src/components/Link';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Typography } from 'src/components/Typography';
import { LD_DX_TOOLS_METRICS_KEYS } from 'src/constants';
import { useFlags } from 'src/hooks/useFlags';
import { useIsAkamaiAccount } from 'src/hooks/useIsAkamaiAccount';
import { sendApiAwarenessClickEvent } from 'src/utilities/analytics/customEventAnalytics';
import { generateCLICommand } from 'src/utilities/codesnippets/generate-cli';

import { CodeBlock } from './CodeBlock/CodeBlock';

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
  const ldClient = useLDClient();
  const flags = useFlags();
  const { isAkamaiAccount: isInternalAccount } = useIsAkamaiAccount();
  const cliCommand = useMemo(() => generateCLICommand(payLoad), [payLoad]);
  const apicliButtonCopy = flags?.testdxtoolabexperiment;

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
            if (!isInternalAccount) {
              ldClient?.track(
                LD_DX_TOOLS_METRICS_KEYS.LINODE_CLI_RESOURCE_LINKS,
                {
                  variation: apicliButtonCopy,
                }
              );
            }
            ldClient?.flush();
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
            if (!isInternalAccount) {
              ldClient?.track(
                LD_DX_TOOLS_METRICS_KEYS.LINODE_CLI_RESOURCE_LINKS,
                {
                  variation: apicliButtonCopy,
                }
              );
            }
            ldClient?.flush();
          }}
          to="https://techdocs.akamai.com/cloud-computing/docs/cli"
        >
          Linode CLI Guides
        </Link>
        .
      </Typography>
      <CodeBlock
        command={cliCommand}
        commandType={title}
        language={'bash'}
        ldTrackingKey={LD_DX_TOOLS_METRICS_KEYS.LINODE_CLI_CODE_SNIPPET}
      />
    </SafeTabPanel>
  );
};
