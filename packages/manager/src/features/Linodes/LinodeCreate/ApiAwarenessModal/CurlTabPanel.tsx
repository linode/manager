import { Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { CodeBlock } from 'src/components/CodeBlock/CodeBlock';
import { Link } from 'src/components/Link';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { sendApiAwarenessClickEvent } from 'src/utilities/analytics/customEventAnalytics';
import { generateCurlCommand } from 'src/utilities/codesnippets/generate-cURL';

import { useLinodeCreateQueryParams } from '../utilities';

import type { LinodeCreateFormValues } from '../utilities';
import type { CreateLinodeRequest } from '@linode/api-v4/lib/linodes';

export interface CurlTabPanelProps {
  index: number;
  payLoad: CreateLinodeRequest;
  title: string;
}

export const CurlTabPanel = ({ index, payLoad, title }: CurlTabPanelProps) => {
  const theme = useTheme();

  const { getValues } = useFormContext<LinodeCreateFormValues>();
  const sourceLinodeID = getValues('linode.id');

  const { params } = useLinodeCreateQueryParams();
  const linodeCLIAction = params.type === 'Clone Linode' ? 'clone' : 'create';
  const path =
    linodeCLIAction === 'create'
      ? '/linode/instances'
      : `/linode/instances/${sourceLinodeID}/clone`;

  const curlCommand = useMemo(() => generateCurlCommand(payLoad, path), [
    path,
    payLoad,
  ]);

  return (
    <SafeTabPanel index={index}>
      <Typography sx={{ marginTop: theme.spacing(2) }} variant="body1">
        Most Linode API requests need to be authenticated with a valid{' '}
        <Link
          onClick={() => {
            sendApiAwarenessClickEvent('link', 'personal access token');
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
          }}
          to="https://techdocs.akamai.com/linode-api/reference/get-started"
        >
          Get Started with the Linode API
        </Link>{' '}
        and{' '}
        <Link
          onClick={() => {
            sendApiAwarenessClickEvent('link', 'Linode API Guides');
          }}
          to="https://techdocs.akamai.com/linode-api/reference/api"
        >
          Linode API Guides
        </Link>
        .
      </Typography>
      <CodeBlock code={curlCommand} analyticsLabel={title} language={'bash'} />
    </SafeTabPanel>
  );
};
