import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

import { IconButton } from 'src/components/IconButton';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { Typography } from 'src/components/Typography';
import { useLoadBalancerCertificatesQuery } from 'src/queries/aglb/certificates';

import type { CertificateConfig, Configuration } from '@linode/api-v4';
import type { FormikErrors } from 'formik';

interface Props {
  certificates: Configuration['certificates'];
  errors: FormikErrors<CertificateConfig>[] | string[];
  loadbalancerId: number;
  onRemove: (index: number) => void;
}

export const CertificateTable = (props: Props) => {
  const { certificates, errors, loadbalancerId, onRemove } = props;

  const { data } = useLoadBalancerCertificatesQuery(
    loadbalancerId,
    {},
    { '+or': certificates.map((cert) => ({ id: cert.id })) }
  );

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Certificate</TableCell>
          <TableCell>Host Header</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {certificates.length === 0 && <TableRowEmpty colSpan={3} />}
        {certificates.map((cert, idx) => {
          const certificate = data?.data.find((c) => c.id === cert.id);
          const error = errors[idx];
          const hostnameError =
            typeof error !== 'string' ? error?.hostname : undefined;
          const idError = typeof error !== 'string' ? error?.id : undefined;

          const generalRowError = typeof error === 'string' ? error : idError;

          return (
            <TableRow key={idx}>
              <TableCell>
                {certificate?.label ?? cert.id}
                {generalRowError && (
                  <Typography color="error">{generalRowError}</Typography>
                )}
              </TableCell>
              <TableCell>
                {cert.hostname}
                {hostnameError && (
                  <Typography color="error">{hostnameError}</Typography>
                )}
              </TableCell>
              <TableCell actionCell>
                <IconButton
                  aria-label={`Remove Certificate ${
                    certificate?.label ?? cert.id
                  }`}
                  onClick={() => onRemove(idx)}
                >
                  <CloseIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
