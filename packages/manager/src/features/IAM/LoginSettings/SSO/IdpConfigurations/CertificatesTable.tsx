import { Button, FormError, Icon } from '@akamai/cds-components/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@akamai/cds-components/react/Table';
import { Spacing } from '@akamai/cds-tokens';
import { truncateMiddle } from '@akamai/compute-ui-core/formatting';
import * as React from 'react';

import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { useHasTableStripingEnabled } from '../../../hooks/useHasTableStripingEnabled';
import { useOrder } from '../../../hooks/useOrder';
import { DateTimeDisplay } from '../../../Shared/DateTimeDisplay/DateTimeDisplay';
import globalStyles from '../../../Shared/global.module.css';
import { StatusIcon } from '../../../Shared/StatusIcon/StatusIcon';
import {
  ALL_CERTIFICATES_DELETED_ERROR,
  IAM_EDIT_IDP_PENDO_IDS,
} from '../../constants';
import styles from './CertificatesTable.module.css';
import { CertificateTableLandingRow } from './CertificateTableLandingRow';
import { DeleteCertificateDialog } from './DeleteCertificateDialog';
import idpConfigurationDrawerStyles from './IdpConfigurationDrawer.module.css';
import { getCertificateStatus } from './idpConfigurationDrawer.utils';
import { NoCertificates } from './NoCertificates';
import { ViewCertificateDrawer } from './ViewCertificateDrawer';

import type { IdpCertificate } from '@linode/api-v4';

interface EditModeProps {
  certificates: IdpCertificate[];
  deletedIds: Set<string>;
  hasNewCertificates?: boolean;
  isAtMax?: boolean;
  mode?: 'edit';
  onToggleDelete: (id: string) => void;
}

interface LandingModeProps {
  certificates: IdpCertificate[];
  idpConfigId: string;
  mode: 'landing';
}

type Props = EditModeProps | LandingModeProps;
interface ExtraProps {
  activeCertificateCount?: number;
  ssoEnabled?: boolean;
}

type CombinedProps = Props & ExtraProps;

export const CertificatesTable = (props: CombinedProps) => {
  const { certificates, mode } = props;
  const isLandingMode = mode === 'landing';
  const hasTableStripingEnabled = useHasTableStripingEnabled();

  const preferenceKey = isLandingMode
    ? 'iam-idp-certificates-landing-order'
    : 'iam-idp-certificates-edit-order';

  const order = useOrder<IdpCertificate>({
    data: certificates,
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'certificate',
      },
      from: '/iam/settings/sso/idp-configurations',
    },
    preferenceKey,
  });

  const sortedCertificates = order.sortedData ?? certificates;

  const allDeleted =
    !isLandingMode &&
    certificates.length > 0 &&
    certificates.every((cert) => props.deletedIds.has(cert.id)) &&
    !props.hasNewCertificates;

  const handleSort = (orderBy: 'certificate' | 'not_after') => {
    order.handleOrderChange(
      orderBy,
      order.order === 'asc' && order.orderBy === orderBy ? 'desc' : 'asc'
    );
  };

  const isSmallScreen = useBreakpoint('down', 'lg');
  const isMobileScreen = useBreakpoint('down', 'sm');

  const [viewCertId, setViewCertId] = React.useState<null | string>(null);
  const [isViewCertDrawerOpen, setIsViewCertDrawerOpen] = React.useState(false);
  const [deleteCert, setDeleteCert] = React.useState<IdpCertificate | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const viewCert = viewCertId
    ? certificates.find((cert) => cert.id === viewCertId)
    : undefined;

  return (
    <>
      {!isLandingMode && (
        <div className={idpConfigurationDrawerStyles.sectionHeading}>
          SAML Certificates
        </div>
      )}

      <Table
        aria-label="SAML Certificates"
        className={allDeleted ? styles.tableError : undefined}
      >
        <TableHead>
          <TableRow
            headerbackground={
              'var(--token-component-table-header-filled-background, light-dark(#e5e5ea, #515157))'
            }
            headerborder
          >
            <TableHeaderCell
              className={
                isLandingMode ? styles.certCellLanding : styles.certCell
              }
              onSort={() => handleSort('certificate')}
              sortable
              sorted={order.orderBy === 'certificate' ? order.order : undefined}
            >
              Certificate
            </TableHeaderCell>
            {!isMobileScreen && (
              <TableHeaderCell
                className={styles.expirationHeaderCell}
                hidden={isSmallScreen}
                onSort={() => handleSort('not_after')}
                sortable
                sorted={order.orderBy === 'not_after' ? order.order : undefined}
              >
                Expiration Date
              </TableHeaderCell>
            )}
            <TableHeaderCell />
          </TableRow>
        </TableHead>

        <TableBody>
          {isLandingMode && sortedCertificates.length === 0 ? (
            <TableRow rowborder>
              <TableCell className={styles.emptyStateCell}>
                <div className={styles.emptyStateCellContent}>
                  <NoCertificates
                    idpConfigId={(props as LandingModeProps).idpConfigId}
                  />
                </div>
              </TableCell>
            </TableRow>
          ) : (
            sortedCertificates.map((cert, index) => {
              const status = getCertificateStatus(
                cert.not_after,
                cert.not_before
              ).status;
              const isLastRow = index === sortedCertificates.length - 1;

              if (isLandingMode) {
                return (
                  <CertificateTableLandingRow
                    activeCertificateCount={props.activeCertificateCount}
                    cert={cert}
                    isMobileScreen={isMobileScreen}
                    isSmallScreen={isSmallScreen}
                    key={cert.id}
                    onDelete={(selectedCert) => {
                      setDeleteCert(selectedCert);
                      setIsDeleteDialogOpen(true);
                    }}
                    onViewDetails={(selectedCert) => {
                      setViewCertId(selectedCert.id);
                      setIsViewCertDrawerOpen(true);
                    }}
                    ssoEnabled={props.ssoEnabled}
                    status={status}
                    totalCertificateCount={certificates.length}
                  />
                );
              }

              const isDeleted = props.deletedIds.has(cert.id);

              return (
                <TableRow
                  hoverable
                  key={cert.id}
                  rowborder={!(allDeleted && isLastRow)}
                  zebra={hasTableStripingEnabled}
                >
                  <TableCell
                    className={`${styles.certCell} ${
                      isDeleted ? styles.deletedCell : ''
                    }`}
                  >
                    {truncateMiddle(cert.certificate, isMobileScreen ? 12 : 24)}
                  </TableCell>

                  <TableCell className={styles.expirationCell}>
                    <StatusIcon
                      className={isDeleted ? styles.deletedOpacity : undefined}
                      pulse={false}
                      status={status}
                      style={{ marginRight: Spacing.S0 }}
                    />

                    <DateTimeDisplay
                      className={isDeleted ? styles.deletedCell : undefined}
                      displayTime={false}
                      value={cert.not_after}
                    />
                  </TableCell>

                  <TableCell className={globalStyles.actionsCell}>
                    <Button
                      data-pendo-id={
                        isDeleted
                          ? IAM_EDIT_IDP_PENDO_IDS.samlCertUndo
                          : IAM_EDIT_IDP_PENDO_IDS.samlCertDelete
                      }
                      disabled={isDeleted && props.isAtMax}
                      onClick={() => props.onToggleDelete(cert.id)}
                      style={{ lineHeight: 1 }}
                      type="button"
                      variant="link"
                    >
                      {isDeleted ? (
                        <>
                          <Icon icon="undo" size="xs" /> Undo
                        </>
                      ) : (
                        'Delete'
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {allDeleted && (
        <FormError className={styles.tableErrorMessage}>
          {ALL_CERTIFICATES_DELETED_ERROR}
        </FormError>
      )}

      {isLandingMode && (
        <ViewCertificateDrawer
          cert={viewCert ?? null}
          onClose={() => setIsViewCertDrawerOpen(false)}
          open={isViewCertDrawerOpen}
        />
      )}
      {isLandingMode && (
        <DeleteCertificateDialog
          certificate={deleteCert}
          idpConfigId={props.idpConfigId}
          onClose={() => setIsDeleteDialogOpen(false)}
          open={isDeleteDialogOpen}
        />
      )}
    </>
  );
};
