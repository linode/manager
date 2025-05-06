import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import { SSHAccessRow } from './SSHAccessRow';

import type { ManagedLinodeSetting } from '@linode/api-v4/lib/managed';
import type { APIError } from '@linode/api-v4/lib/types';
import type { Theme } from '@mui/material';

interface SSHAccessTableContentProps {
  error?: APIError[] | null;
  linodeSettings: ManagedLinodeSetting[];
  loading: boolean;
}

export const SSHAccessTableContent = (props: SSHAccessTableContentProps) => {
  const { error, linodeSettings, loading } = props;

  const matchesSmDownBreakpoint = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm')
  );

  const NUM_COLUMNS = matchesSmDownBreakpoint ? 3 : 6;

  if (loading) {
    return <TableRowLoading columns={NUM_COLUMNS} />;
  }

  if (error) {
    const errorMessage = getErrorStringOrDefault(error);
    return <TableRowError colSpan={NUM_COLUMNS} message={errorMessage} />;
  }

  if (linodeSettings.length === 0) {
    return (
      <TableRowEmpty
        colSpan={NUM_COLUMNS}
        message="You don't have any Linodes on your account."
      />
    );
  }

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {linodeSettings.map(
        (linodeSetting: ManagedLinodeSetting, idx: number) => (
          <SSHAccessRow
            key={`linode-setting-row-${idx}`}
            linodeSetting={linodeSetting}
          />
        )
      )}
    </>
  );
};
