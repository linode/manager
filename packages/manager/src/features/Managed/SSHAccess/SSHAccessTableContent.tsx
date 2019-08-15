import * as React from 'react';
import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import SSHAccessRow from './SSHAccessRow';

interface Props {
  linodeSettings: Linode.ManagedLinodeSetting[];
  loading: boolean;
  lastUpdated: number;
  updateOne: (linodeSetting: Linode.ManagedLinodeSetting) => void;
  openDrawer: (linodeId: number) => void;
  error?: Linode.ApiFieldError[];
}

export type CombinedProps = Props;

export const SSHAccessTableContent: React.FC<CombinedProps> = props => {
  const {
    error,
    loading,
    lastUpdated,
    updateOne,
    linodeSettings,
    openDrawer
  } = props;

  if (loading && lastUpdated === 0) {
    return <TableRowLoading colSpan={12} />;
  }

  if (error) {
    const errorMessage = getErrorStringOrDefault(error);
    return <TableRowError colSpan={12} message={errorMessage} />;
  }

  if (linodeSettings.length === 0 && lastUpdated !== 0) {
    return (
      <TableRowEmpty
        colSpan={12}
        message={"You don't have any Linodes on your account."}
      />
    );
  }

  return (
    <>
      {linodeSettings.map(
        (linodeSetting: Linode.ManagedLinodeSetting, idx: number) => (
          <SSHAccessRow
            key={`linode-setting-row-${idx}`}
            updateOne={updateOne}
            linodeSetting={linodeSetting}
            openDrawer={openDrawer}
          />
        )
      )}
    </>
  );
};

export default SSHAccessTableContent;
