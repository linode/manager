import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Paper } from '@linode/ui';

import { InstallationInstructions } from '../../shared/InstallationInstructions';

interface Props {
  clientAPIKey: string;
  clientInstallationKey: string;
}

const Installation = (props: Props) => {
  return (
    <>
      <DocumentTitleSegment segment="Installation" />
      <Paper
        data-testid="longview-clients"
        sx={(theme) => ({
          padding: theme.spacing(3),
        })}
      >
        <InstallationInstructions
          APIKey={props.clientAPIKey}
          data-qa-instructions
          installationKey={props.clientInstallationKey}
        />
      </Paper>
    </>
  );
};

export default React.memo(Installation);
