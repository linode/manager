import { ManagedLinodeSetting } from '@linode/api-v4/lib/managed';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import SSHAccessRow from './SSHAccessRow';

interface Props {
  linodeSettings: ManagedLinodeSetting[];
  loading: boolean;
  openDrawer: (linodeId: number) => void;
  error?: APIError[] | null;
}

export type CombinedProps = Props;

export const SSHAccessTableContent: React.FC<CombinedProps> = (props) => {
  const { linodeSettings, loading, openDrawer, error } = props;

  if (loading) {
    return <TableRowLoading columns={6} />;
  }

  if (error) {
    const errorMessage = getErrorStringOrDefault(error);
    return <TableRowError colSpan={6} message={errorMessage} />;
  }

  if (linodeSettings.length === 0) {
    return (
      <TableRowEmpty
        colSpan={5}
        message={"You don't have any Linodes on your account."}
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
            openDrawer={openDrawer}
          />
        )
      )}
    </>
  );
};

export default SSHAccessTableContent;
