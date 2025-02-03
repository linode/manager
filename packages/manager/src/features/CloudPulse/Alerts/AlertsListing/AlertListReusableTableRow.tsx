import { Box, Toggle, Tooltip, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { FormControlLabel } from '../../../../../../ui/src/components/FormControlLabel';
import { processMetricCriteria } from '../Utils/utils';

import type { ProcessedCriteria } from '../Utils/utils';
import type { Alert } from '@linode/api-v4';

interface AlertListReusableTableRowProps {
  alert: Alert;
  entityId: string;
  entityName: string;
}

export const AlertListReusableTableRow = (
  props: AlertListReusableTableRowProps
) => {
  const {
    alert: { entity_ids, id, label, rule_criteria, service_type, type },
    entityId,
    entityName,
  } = props;

  const [isActive, setIsActive] = React.useState<boolean>(
    entity_ids.includes(entityId)
  );
  const metricThreshold = processMetricCriteria(rule_criteria.rules);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);

  const { enqueueSnackbar } = useSnackbar();
  const handleClose = React.useCallback(() => {
    setIsDialogOpen(false);
    setIsActive((prev) => !prev);
    enqueueSnackbar(
      `The alert settings for ${entityName} saved successfully.`,
      { variant: 'success' }
    );
  }, [enqueueSnackbar, entityName]);

  const handleCancel = React.useCallback(() => {
    setIsDialogOpen(false);
  }, []);
  const handleToggle = (_: React.ChangeEvent, __: boolean) => {
    setIsDialogOpen(true);
  };
  return (
    <>
      <TableRow data-qa-alert-cell={id} key={`alert-row-${id}`}>
        <TableCell>
          <FormControlLabel
            control={<Toggle checked={isActive} onChange={handleToggle} />}
            label={''}
          />
        </TableCell>
        <TableCell>
          <Link to={`/monitor/alerts/definitions/detail/${service_type}/${id}`}>
            {label}
          </Link>
        </TableCell>
        <TableCell>{generateMetricThreshold(metricThreshold)}</TableCell>
        <TableCell>{type}</TableCell>
      </TableRow>
      <AlertConfirmationDialog
        alertName={label}
        entityName={entityName}
        handleCancel={handleCancel}
        handleClose={handleClose}
        isActive={isActive}
        isOpen={isDialogOpen}
      />
    </>
  );
};

const generateMetricThreshold = (metricThreshold: ProcessedCriteria[]) => {
  if (metricThreshold.length === 0) {
    return <></>;
  }

  const thresholdObject = metricThreshold[0];
  const metric = `${thresholdObject.label} ${thresholdObject.operator}  ${thresholdObject.threshold} ${thresholdObject.unit}`;
  const total = metricThreshold.length - 1;
  if (metricThreshold.length === 1) {
    return <Typography variant="subtitle1">{metric}</Typography>;
  }
  const rest = metricThreshold
    .slice(1)
    .map((criteria) => {
      return `${criteria.label} ${criteria.operator} ${criteria.threshold} ${criteria.unit}`;
    })
    .join('\n');
  return (
    <Box alignItems="center" display="flex" gap={1.75}>
      <Typography variant="subtitle1">{metric}</Typography>
      <Tooltip title={<Box sx={{ whiteSpace: 'pre-line' }}>{rest}</Box>}>
        <Typography
          sx={(theme) => {
            return {
              backgroundColor: theme.color.grey10,
              border: '1px solid',
              borderColors: theme.color.grey3,
              borderRadius: '4px',
              px: 1,
              py: 0.5,
            };
          }}
          variant="subtitle1"
        >
          +{total}
        </Typography>
      </Tooltip>
    </Box>
  );
};

interface AlertConfirmationDialogProps {
  alertName: string;
  entityName: string;
  handleCancel: () => void;
  handleClose: () => void;
  isActive: boolean;
  isOpen: boolean;
}

const AlertConfirmationDialog = React.memo(
  (props: AlertConfirmationDialogProps) => {
    const {
      alertName,
      entityName,
      handleCancel,
      handleClose,
      isActive,
      isOpen,
    } = props;

    const actionsPanel = React.useCallback(() => {
      return (
        <ActionsPanel
          primaryButtonProps={{
            label: isActive ? 'Disable' : 'Enable',
            onClick: handleClose,
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: handleCancel,
          }}
        />
      );
    }, [handleCancel, handleClose, isActive]);
    return (
      <ConfirmationDialog
        actions={actionsPanel}
        onClose={handleCancel}
        open={isOpen}
        title={`${isActive ? 'Disable' : 'Enable'} ${alertName} Alert?`}
      >
        <Typography variant="subtitle1">
          Are you sure you want to {isActive ? 'disable' : 'enable'} the alert
          for {entityName}?
        </Typography>
      </ConfirmationDialog>
    );
  }
);
