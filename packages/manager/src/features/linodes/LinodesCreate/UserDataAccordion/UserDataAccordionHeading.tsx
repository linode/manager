import * as React from 'react';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import { StyledHelpIcon } from './UserDataAccordion.styles';

export const LINODE_CREATE_FROM = {
  BACKUPS: 'fromBackup',
  CLONE: 'fromLinode',
};

interface Props {
  createType?: string | undefined;
}

const UserDataAccordionHeading = ({ createType }: Props) => {
  const userDataHeaderWarningMessage =
    createType === LINODE_CREATE_FROM.BACKUPS
      ? 'Existing user data is not available when creating a Linode from a backup.'
      : 'User data is not cloned.';
  const showWarningMessage =
    createType &&
    [LINODE_CREATE_FROM.BACKUPS, LINODE_CREATE_FROM.CLONE].includes(createType);

  return (
    <>
      Add User Data{' '}
      <StyledHelpIcon
        text={
          <>
            User data is part of a virtual machine&rsquo;s cloud-init metadata
            containing information related to a user&rsquo;s local account.{' '}
            <Link to="/">Learn more.</Link>
          </>
        }
        interactive
      />
      {showWarningMessage ? (
        <Notice warning spacingTop={16} spacingBottom={16}>
          {userDataHeaderWarningMessage}
        </Notice>
      ) : null}
    </>
  );
};

export default UserDataAccordionHeading;
