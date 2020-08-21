import { ManagedCredential } from '@linode/api-v4/lib/managed';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';

import TableRowEmpty from 'src/components/TableRowEmptyState/TableRowEmptyState_CMR';
import TableRowError from 'src/components/TableRowError/TableRowError_CMR';
import TableRowLoading from 'src/components/TableRowLoading/TableRowLoading_CMR';
import CredentialRow from './CredentialRow_CMR';

interface Props {
  credentials: ManagedCredential[];
  loading: boolean;
  openDialog: (id: number, label: string) => void;
  openForEdit: (id: number) => void;
  error?: APIError[];
}

export type CombinedProps = Props;

export const CredentialTableContent: React.FC<CombinedProps> = props => {
  const { error, loading, credentials, openDialog, openForEdit } = props;
  if (loading) {
    return <TableRowLoading firstColWidth={35} colSpan={2} oneLine />;
  }

  if (error) {
    return <TableRowError colSpan={2} message={error[0].reason} />;
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
