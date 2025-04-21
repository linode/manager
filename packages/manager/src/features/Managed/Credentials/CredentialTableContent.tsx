import * as React from 'react';

import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';

import CredentialRow from './CredentialRow';

import type { ManagedCredential } from '@linode/api-v4/lib/managed';
import type { APIError } from '@linode/api-v4/lib/types';

interface CredentialTableContentProps {
  credentials: ManagedCredential[];
  error?: APIError[] | null;
  loading: boolean;
}

export const CredentialTableContent = (props: CredentialTableContentProps) => {
  const { credentials, error, loading } = props;
  if (loading) {
    return <TableRowLoading columns={3} />;
  }

  if (error) {
    return <TableRowError colSpan={3} message={error[0].reason} />;
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
          credential={credential}
          key={`managed-credential-row-${idx}`}
        />
      ))}
    </>
  );
};

export default CredentialTableContent;
