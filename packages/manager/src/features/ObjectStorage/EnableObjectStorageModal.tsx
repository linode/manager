import { Region } from '@linode/api-v4';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Link } from 'src/components/Link';
import { TextTooltip } from 'src/components/TextTooltip';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import {
  OBJ_STORAGE_PRICE,
  ObjStoragePriceObject,
} from 'src/utilities/pricing/constants';
import { getObjectStorageDCSpecificPrices } from 'src/utilities/pricing/dynamicPricing';

export interface Props {
  handleSubmit: () => void;
  onClose: () => void;
  open: boolean;
  regionId?: Region['id'];
}

export const EnableObjectStorageModal = (props: Props) => {
  const { handleSubmit, onClose, open, regionId } = props;

  const flags = useFlags();
  const objStoragePrices: ObjStoragePriceObject =
    regionId &&
    getObjectStorageDCSpecificPrices({
      basePrice: OBJ_STORAGE_PRICE,
      flags,
      regionId,
    });

  return (
    <ConfirmationDialog
      actions={() => (
        <ActionsPanel
          primaryButtonProps={{
            label: 'Enable Object Storage',
            onClick: () => {
              onClose();
              handleSubmit();
            },
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel',
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      )}
      onClose={onClose}
      open={open}
      title="Just to confirm..."
    >
      {regionId ? (
        <Typography>
          Linode Object Storage costs a flat rate of{' '}
          <strong>${objStoragePrices?.monthly ?? 'Unknown'}/month</strong> for
          this data center, and includes{' '}
          {objStoragePrices?.storage ?? 'Unknown'} GB of storage.{' '}
          {objStoragePrices?.transfer ?? 'Unknown'} TB of outbound data transfer
          will be added to your Global Monthly Transfer Pool.
        </Typography>
      ) : (
        <Typography>
          Pricing for monthly rate, storage allotments, and overage costs will
          depend on the data center you select for deployment.
        </Typography>
      )}
      {regionId && (
        <>
          <Typography style={{ marginTop: 12 }}>
            Additional storage costs{' '}
            <strong>
              ${objStoragePrices?.storage_overage ?? 'Unknown'} per GB.
            </strong>
            . Additional outbound transfer will cost{' '}
            <strong>${objStoragePrices?.transfer_overage} per GB.</strong>{' '}
          </Typography>{' '}
          <Typography style={{ marginTop: 12 }}>
            Some{' '}
            <TextTooltip
              displayText="data centers"
              tooltipText={''}
            ></TextTooltip>{' '}
            have DC-specific fees, storage allotments, and overage costs.
          </Typography>
        </>
      )}
      <Typography style={{ marginTop: 12 }}>
        <Link to="https://www.linode.com/docs/platform/object-storage/pricing-and-limitations/">
          Learn more
        </Link>{' '}
        about pricing and specifications.
      </Typography>
      <Typography style={{ marginTop: 12 }}>
        To discontinue billing, you'll need to cancel Object Storage in your{' '}
        <Link to="/account/settings">Account Settings</Link>.
      </Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(EnableObjectStorageModal);
