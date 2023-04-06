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
      ? 'Existing user data is not accessible when creating a Linode from a backup. You may add new user data now.'
      : 'Existing user data is not cloned. You may add new user data now.';
  const showWarningMessage =
    createType &&
    [LINODE_CREATE_FROM.BACKUPS, LINODE_CREATE_FROM.CLONE].includes(createType);

  return (
    <>
      Add User Data{' '}
      <StyledHelpIcon
        text={
          <>
            User data is a virtual machine&rsquo;s cloud-init metadata relating
            to a user&rsquo;s local account. <Link to="/">Learn more.</Link>
          </>
        }
        interactive
        status="help"
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
