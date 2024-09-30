import { useTheme } from '@mui/material/styles';
import { useLDClient } from 'launchdarkly-react-client-sdk';
import React, { useMemo } from 'react';

import { Link } from 'src/components/Link';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Typography } from 'src/components/Typography';
import { LD_DX_TOOLS_METRICS_KEYS } from 'src/constants';
import { useFlags } from 'src/hooks/useFlags';
import { useIsAkamaiAccount } from 'src/hooks/useIsAkamaiAccount';
import { sendApiAwarenessClickEvent } from 'src/utilities/analytics/customEventAnalytics';
import { generateCurlCommand } from 'src/utilities/codesnippets/generate-cURL';

import { CodeBlock } from '../CodeBlock/CodeBlock';

import type { CreateLinodeRequest } from '@linode/api-v4/lib/linodes';

export interface CurlTabPanelProps {
  index: number;
  payLoad: CreateLinodeRequest;
  title: string;
}

export const CurlTabPanel = ({ index, payLoad, title }: CurlTabPanelProps) => {
  const flags = useFlags();
  const ldClient = useLDClient();
  const theme = useTheme();
  const { isAkamaiAccount: isInternalAccount } = useIsAkamaiAccount();
  const curlCommand = useMemo(
    () => generateCurlCommand(payLoad, '/linode/instances'),
    [payLoad]
  );
  const apicliButtonCopy = flags?.testdxtoolabexperiment;
  return (
    <SafeTabPanel index={index}>
      <Typography sx={{ marginTop: theme.spacing(2) }} variant="body1">
        Most Linode API requests need to be authenticated with a valid{' '}
        <Link
          onClick={() => {
            sendApiAwarenessClickEvent('link', 'personal access token');
            if (!isInternalAccount) {
              ldClient?.track(LD_DX_TOOLS_METRICS_KEYS.CURL_RESOURCE_LINKS, {
                variation: apicliButtonCopy,
              });
            }

            ldClient?.flush();
          }}
          to="/profile/tokens"
        >
          personal access token
        </Link>
        . The command below assumes that your personal access token has been
        stored within the TOKEN shell variable. For more information, see{' '}
        <Link
          onClick={() => {
            sendApiAwarenessClickEvent(
              'link',
              'Get Started with the Linode API'
            );
            if (!isInternalAccount) {
              ldClient?.track(LD_DX_TOOLS_METRICS_KEYS.CURL_RESOURCE_LINKS, {
                variation: apicliButtonCopy,
              });
            }

            ldClient?.flush();
          }}
          to="https://techdocs.akamai.com/linode-api/reference/get-started"
        >
          Get Started with the Linode API
        </Link>{' '}
        and{' '}
        <Link
          onClick={() => {
            sendApiAwarenessClickEvent('link', 'Linode API Guides');
            if (!isInternalAccount) {
              ldClient?.track(LD_DX_TOOLS_METRICS_KEYS.CURL_RESOURCE_LINKS, {
                variation: apicliButtonCopy,
              });
            }

            ldClient?.flush();
          }}
          to="https://techdocs.akamai.com/linode-api/reference/api"
        >
          Linode API Guides
        </Link>
        .
      </Typography>
      <CodeBlock
        command={curlCommand}
        commandType={title}
        language={'bash'}
        ldTrackingKey={LD_DX_TOOLS_METRICS_KEYS.CURL_CODE_SNIPPET}
      />
    </SafeTabPanel>
  );
};
