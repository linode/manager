import * as React from 'react';
import Link from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { TooltipIcon } from 'src/components/TooltipIcon/TooltipIcon';
import Box from 'src/components/core/Box';
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
        Add User Data{' '}
        <TooltipIcon
          sxTooltipIcon={{ padding: '0 8px' }}
          text={
            <>
              User data is a virtual machine&rsquo;s cloud-init metadata
              relating to a user&rsquo;s local account.{' '}
              <Link to="/">Learn more.</Link>
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
