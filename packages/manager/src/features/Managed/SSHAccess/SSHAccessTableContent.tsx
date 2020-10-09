import { ManagedLinodeSetting } from '@linode/api-v4/lib/managed';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import useFlags from 'src/hooks/useFlags';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import SSHAccessRow from './SSHAccessRow';
import SSHAccessRow_CMR from './SSHAccessRow_CMR';

interface Props {
  linodeSettings: ManagedLinodeSetting[];
  loading: boolean;
  lastUpdated: number;
  updateOne: (linodeSetting: ManagedLinodeSetting) => void;
  openDrawer: (linodeId: number) => void;
  error?: APIError[];
}

export type CombinedProps = Props;

export const SSHAccessTableContent: React.FC<CombinedProps> = props => {
  const {
    linodeSettings,
    loading,
    lastUpdated,
    updateOne,
    openDrawer,
    error
  } = props;

  const flags = useFlags();

  if (loading && lastUpdated === 0) {
    return (
      <TableRowLoading colSpan={6} widths={[30, 14, 14, 14, 14, 14]} oneLine />
    );
  }

  if (error) {
    const errorMessage = getErrorStringOrDefault(error);
    return <TableRowError colSpan={6} message={errorMessage} />;
  }

  if (linodeSettings.length === 0 && lastUpdated !== 0) {
    return (
      <TableRowEmpty
        colSpan={5}
        message={"You don't have any Linodes on your account."}
      />
    );
  }

  const Row = flags.cmr ? SSHAccessRow_CMR : SSHAccessRow;

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {linodeSettings.map(
        (linodeSetting: ManagedLinodeSetting, idx: number) => (
          <Row
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
