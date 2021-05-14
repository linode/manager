import { TrustedDevice } from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import InlineMenuAction from 'src/components/InlineMenuAction';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';

interface Props {
  loading: boolean;
  error?: APIError[];
  data?: TrustedDevice[];
  setDevice: (deviceId: number) => void;
  toggleDialog: () => void;
}

type CombinedProps = Props;

export const TrustedDevicesTable: React.FC<CombinedProps> = (props) => {
  const { loading, error, data } = props;

  const triggerDeletion = (deviceId: number) => {
    props.setDevice(deviceId);
    props.toggleDialog();
  };

  if (loading) {
    return <TableRowLoading colSpan={6} />;
  }

  if (error) {
    return (
      <TableRowError
        colSpan={6}
        message="There was an issue loading your trusted devices."
      />
    );
  }

  if (!data || data.length === 0) {
    return <TableRowEmpty colSpan={6} />;
  }

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {data.map((eachDevice) => {
        return (
          <TableRow ariaLabel={`Device ${eachDevice.id}`} key={eachDevice.id}>
            <TableCell>{eachDevice.user_agent}</TableCell>
            <TableCell>{eachDevice.last_remote_addr}</TableCell>
            <TableCell>
              <DateTimeDisplay value={eachDevice.last_authenticated} />
            </TableCell>
            <TableCell>
              <DateTimeDisplay value={eachDevice.expiry} />
            </TableCell>
            <TableCell className="p0">
              <RevokeButton
                deviceId={eachDevice.id}
                triggerDeletion={triggerDeletion}
              />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
};

export default TrustedDevicesTable;

interface ButtonProps {
  deviceId?: number;
  triggerDeletion: (deviceId: number) => void;
}
export const RevokeButton: React.FC<ButtonProps> = (props) => {
  const handleDelete = () => {
    const { triggerDeletion, deviceId } = props;
    if (!!deviceId) {
      triggerDeletion(deviceId);
    }
  };

  return (
    <InlineMenuAction key="Revoke" actionText="Revoke" onClick={handleDelete} />
  );
};
