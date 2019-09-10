import { ManagedCredential } from 'linode-js-sdk/lib/managed/types';
import * as React from 'react';

import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import CredentialRow from './CredentialRow';

interface Props {
  credentials: ManagedCredential[];
  loading: boolean;
  openDialog: (id: number, label: string) => void;
  openForEdit: (id: number) => void;
  error?: Linode.ApiFieldError[];
}

export type CombinedProps = Props;

export const CredentialTableContent: React.FC<CombinedProps> = props => {
  const { error, loading, credentials, openDialog, openForEdit } = props;
  if (loading) {
    return <TableRowLoading colSpan={12} />;
  }

  if (error) {
    return <TableRowError colSpan={12} message={error[0].reason} />;
  }

  if (credentials.length === 0) {
    return (
      <TableRowEmpty
        colSpan={12}
        message={"You don't have any Credentials on your account."}
      />
    );
  }

  return (
    <>
      {credentials.map((credential: ManagedCredential, idx: number) => (
        <CredentialRow
          key={`managed-credential-row-${idx}`}
          credential={credential}
          openDialog={openDialog}
          openForEdit={openForEdit}
        />
      ))}
    </>
  );
};

export default CredentialTableContent;
