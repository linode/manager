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
import { useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { useHasTableStripingEnabled } from '../../../hooks/useHasTableStripingEnabled';
import { useOrder } from '../../../hooks/useOrder';
import { IAM_ACTIONS, type IAMAction } from '../../../routes';
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
  isCertLoading?: boolean;
  mode?: 'edit';
  onToggleDelete: (id: string) => void;
}

interface LandingModeProps {
  certificates: IdpCertificate[];
  idpConfigId: string;
  isCertLoading?: boolean;
  mode: 'landing';
}

type Props = EditModeProps | LandingModeProps;
interface ExtraProps {
  activeCertificateCount?: number;
  ssoEnabled?: boolean;
}

type CombinedProps = Props & ExtraProps;

const IDP_CONFIGURATIONS_ROUTE = '/iam/settings/sso/idp-configurations';

export const CertificatesTable = (props: CombinedProps) => {
  const { certificates, mode, isCertLoading } = props;
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
      from: IDP_CONFIGURATIONS_ROUTE,
    },
    preferenceKey,
  });

  const navigate = useNavigate();
  const { action, certificateID, configurationID } = useSearch({
    from: IDP_CONFIGURATIONS_ROUTE,
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

  const configIDMatches = React.useMemo(
    () =>
      isLandingMode &&
      configurationID === (props as LandingModeProps).idpConfigId,
    [configurationID, isLandingMode, props]
  );

  const selectedCert = React.useMemo(
    () =>
      certificateID && configIDMatches
        ? certificates.find((cert) => cert.id === certificateID)
        : undefined,
    [certificateID, configIDMatches, certificates]
  );

  const actionHandler = (action: IAMAction, certificateID?: string) => {
    navigate({
      to: IDP_CONFIGURATIONS_ROUTE,
      search: (prev) => ({
        ...prev,
        action,
        certificateID,
        configurationID: isLandingMode
          ? (props as LandingModeProps).idpConfigId
          : configurationID,
      }),
    });
  };

  const handleAddCertificate = (selectedCert: IdpCertificate) => {
    actionHandler(IAM_ACTIONS.viewCertificate, selectedCert.id);
  };

  const handleRemoveCertificate = (selectedCert: IdpCertificate) => {
    actionHandler(IAM_ACTIONS.deleteCertificate, selectedCert.id);
  };

  const closeDrawer = (expectedAction: IAMAction) => {
    if (expectedAction && action !== expectedAction) {
      return;
    }

    navigate({
      to: IDP_CONFIGURATIONS_ROUTE,
      search: (prev) => ({
        ...prev,
        action: undefined,
        certificateID: undefined,
        configurationID: undefined,
      }),
    });
  };

  const clearDialogAction = (expectedAction?: IAMAction) => {
    // Both overlays share the same `action` search param. Guard ensures a close
    // event from one overlay cannot wipe the other's URL state.
    if (expectedAction && action !== expectedAction) {
      return;
    }

    // Only clear `action` here so modal bodies keep `role`/`entity` during the
    // exit animation. Remaining params are cleared in `clearDialogParams`.
    navigate({
      to: IDP_CONFIGURATIONS_ROUTE,
      search: (prev) => ({
        ...prev,
        action: undefined,
        certificateID: undefined,
        configurationID: undefined,
      }),
    });
  };

  const clearDialogParams = () => {
    navigate({
      to: IDP_CONFIGURATIONS_ROUTE,
      search: (prev) => ({
        ...prev,
        certificateID: undefined,
        configurationID: undefined,
      }),
    });
  };

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
                      handleRemoveCertificate(selectedCert);
                    }}
                    onViewDetails={(selectedCert) => {
                      handleAddCertificate(selectedCert);
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
          cert={selectedCert}
          isCertLoading={isCertLoading}
          onClose={() => closeDrawer(IAM_ACTIONS.viewCertificate)}
          open={action === IAM_ACTIONS.viewCertificate}
        />
      )}
      {isLandingMode && (
        <DeleteCertificateDialog
          certificate={selectedCert}
          idpConfigId={props.idpConfigId}
          isCertLoading={isCertLoading}
          onClose={() => clearDialogAction(IAM_ACTIONS.deleteCertificate)}
          onExited={clearDialogParams}
          open={action === IAM_ACTIONS.deleteCertificate}
        />
      )}
    </>
  );
};
