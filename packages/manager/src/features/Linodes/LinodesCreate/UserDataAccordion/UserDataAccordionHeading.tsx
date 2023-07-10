import * as React from 'react';
import { BetaChip } from 'src/components/BetaChip/BetaChip';
import { Box } from 'src/components/Box';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { CreateTypes } from 'src/store/linodeCreate/linodeCreate.actions';

interface Props {
  createType?: CreateTypes;
}

export const UserDataAccordionHeading = ({ createType }: Props) => {
  const warningMessageMap: Record<CreateTypes, string | null> = {
    fromBackup:
      'Existing user data is not accessible when creating a Linode from a backup. You may add new user data now.',
    fromLinode:
      'Existing user data is not cloned. You may add new user data now.',
    fromApp: null,
    fromStackScript: null,
    fromImage: null,
  };

  const warningMessage = createType ? warningMessageMap[createType] : null;

  return (
    <>
      <Box display="flex">
        Add User Data <BetaChip component="span" />
        <TooltipIcon
          sxTooltipIcon={{ padding: '0 8px', alignItems: 'baseline' }}
          text={
            <>
              User data allows you to provide additional custom data to
              cloud-init to further configure your system.{' '}
              <Link to="https://www.linode.com/docs/products/compute/compute-instances/guides/metadata/">
                Learn more.
              </Link>
            </>
          }
          status="help"
          interactive
        />
      </Box>
      {warningMessage ? (
        <Notice warning spacingTop={16} spacingBottom={16}>
          {warningMessage}
        </Notice>
      ) : null}
    </>
  );
};
