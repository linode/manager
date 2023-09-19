import { Region } from '@linode/api-v4';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import { useRegionsQuery } from 'src/queries/regions';
import {
  ENABLE_OBJ_ACCESS_KEYS_MESSAGE,
  OBJ_STORAGE_PRICE,
  ObjStoragePriceObject,
} from 'src/utilities/pricing/constants';
import { objectStoragePriceIncreaseMap } from 'src/utilities/pricing/dynamicPricing';

const OBJ_STORAGE_STORAGE_AMT = '250 GB';
const OBJ_STORAGE_NETWORK_TRANSFER_AMT = '1 TB';
export interface Props {
  handleSubmit: () => void;
  onClose: () => void;
  open: boolean;
  regionId?: Region['id'];
}

export const EnableObjectStorageModal = (props: Props) => {
  const { handleSubmit, onClose, open, regionId } = props;

  const flags = useFlags();
  const { data: regions } = useRegionsQuery();

  const regionLabel =
    regions?.find((r) => r.id === regionId)?.label ?? regionId;
  const objStoragePrices: ObjStoragePriceObject = OBJ_STORAGE_PRICE;
  // TODO: DC Pricing - M3-6973:
  //   regionId && flags.dcSpecificPricing
  //     ? objectStoragePriceIncreaseMap[regionId] ?? OBJ_STORAGE_PRICE
  //     : OBJ_STORAGE_PRICE;
  const isObjBetaPricingRegion =
    regionId && objectStoragePriceIncreaseMap.hasOwnProperty(regionId);

  const getRegionPricingText = (regionLabel: string) => {
    if (flags.objDCSpecificPricing) {
      if (!regionId) {
        return <Typography>{ENABLE_OBJ_ACCESS_KEYS_MESSAGE}</Typography>;
      } else if (isObjBetaPricingRegion) {
        return (
          <Typography>
            Object Storage for {regionLabel} is currently in beta. During the
            beta period, Object Storage in these regions is free. After the beta
            period, customers will be notified before charges for this service
            begin.
          </Typography>
        );
      } else {
        return (
          <Typography>
            Linode Object Storage costs a flat rate of{' '}
            <strong>${objStoragePrices?.monthly ?? 'Unknown'}/month</strong>{' '}
            {flags.objDCSpecificPricing ? 'for this data center' : ''}, and
            includes {OBJ_STORAGE_STORAGE_AMT} of storage.{' '}
            {OBJ_STORAGE_NETWORK_TRANSFER_AMT} of outbound data transfer will be
            added to your Global Monthly Transfer Pool.
          </Typography>
        );
      }
    }

    return (
      <Typography>
        Linode Object Storage costs a flat rate of <strong>$5/month</strong>,
        and includes 250 GB of storage and 1 TB of outbound data transfer.
        Beyond that, it's <strong>$0.02 per GB per month.</strong>{' '}
        <Link to="https://www.linode.com/docs/products/storage/object-storage/#pricing">
          Learn more.
        </Link>
      </Typography>
    );
  };

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
      {getRegionPricingText(regionLabel ?? 'this region')}
      {flags.objDCSpecificPricing && (
        <Typography style={{ marginTop: 12 }}>
          <Link to="https://www.linode.com/pricing/#object-storage">
            Learn more
          </Link>{' '}
          about pricing and specifications.
        </Typography>
      )}
      <Typography style={{ marginTop: 12 }}>
        To discontinue billing, you'll need to cancel Object Storage in your{' '}
        <Link to="/account/settings">Account Settings</Link>.
      </Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(EnableObjectStorageModal);
