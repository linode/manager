import { useTheme } from '@mui/material/styles';
import React, { useMemo } from 'react';

import { Link } from 'src/components/Link';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Typography } from 'src/components/Typography';
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
  const theme = useTheme();
  const curlCommand = useMemo(
    () => generateCurlCommand(payLoad, '/linode/instances'),
    [payLoad]
  );
  return (
    <SafeTabPanel index={index}>
      <Typography sx={{ marginTop: theme.spacing(2) }} variant="body1">
        Most Linode API requests need to be authenticated with a valid{' '}
        <Link
          onClick={() =>
            sendApiAwarenessClickEvent('link', 'personal access token')
          }
          data-ab-test={`${title} resource links`}
          to="/profile/tokens"
        >
          personal access token
        </Link>
        . The command below assumes that your personal access token has been
        stored within the TOKEN shell variable. For more information, see{' '}
        <Link
          onClick={() =>
            sendApiAwarenessClickEvent(
              'link',
              'Get Started with the Linode API'
            )
          }
          data-ab-test={`${title} resource links`}
          to="https://www.linode.com/docs/products/tools/api/get-started/"
        >
          Get Started with the Linode API
        </Link>{' '}
        and{' '}
        <Link
          onClick={() =>
            sendApiAwarenessClickEvent('link', 'Linode API Guides')
          }
          data-ab-test={`${title} resource links`}
          to="https://www.linode.com/docs/products/tools/api/guides/"
        >
          Linode API Guides
        </Link>
        .
      </Typography>
      <CodeBlock command={curlCommand} commandType={title} language={'bash'} />
    </SafeTabPanel>
  );
};
