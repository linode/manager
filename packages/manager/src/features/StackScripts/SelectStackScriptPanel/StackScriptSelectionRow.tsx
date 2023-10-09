import Grid from '@mui/material/Unstable_Grid2';
import { withStyles } from 'tss-react/mui';
import { WithStyles } from '@mui/styles';
import * as React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { compose as recompose } from 'recompose';

import { Button } from 'src/components/Button/Button';
import { Radio } from 'src/components/Radio/Radio';
import { RenderGuard, RenderGuardProps } from 'src/components/RenderGuard';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { openStackScriptDialog as openStackScriptDialogAction } from 'src/store/stackScriptDialog';

import { ClassNames, styles } from '../StackScriptRowHelpers';

export interface Props {
  checked?: boolean;
  deploymentsActive: number;
  description: string;
  disabled?: boolean;
  disabledCheckedSelect?: boolean;
  label: string;
  onSelect?: (e: React.ChangeEvent<HTMLElement>, value: boolean) => void;
  stackScriptID: number;
  stackScriptUsername: string;
  updated: string;
}

interface DispatchProps {
  openStackScriptDialog: (stackScriptId: number) => void;
}

export type CombinedProps = Props &
  WithStyles<ClassNames> &
  DispatchProps &
  RenderGuardProps;

export class StackScriptSelectionRow extends React.Component<
  CombinedProps,
  {}
> {
  render() {
    const {
      checked,
      classes,
      description,
      disabled,
      disabledCheckedSelect,
      label,
      onSelect,
      openStackScriptDialog,
      stackScriptID,
      stackScriptUsername,
    } = this.props;

    const renderLabel = () => {
      const openDialog = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        openStackScriptDialog(stackScriptID);
      };
      return (
        <Grid alignItems="center" className={classes.selectionGrid} container>
          <Grid className={classes.selectionGridDetails}>
            <Typography variant="h3">
              {stackScriptUsername && (
                <label
                  className={`${classes.libRadioLabel} ${classes.stackScriptUsername}`}
                  htmlFor={`${stackScriptID}`}
                >
                  {stackScriptUsername} /&nbsp;
                </label>
              )}
              <label
                className={classes.libRadioLabel}
                htmlFor={`${stackScriptID}`}
              >
                {label}
              </label>
            </Typography>
            {description && (
              <Typography className={classes.libDescription} variant="body1">
                {description}
              </Typography>
            )}
          </Grid>
          <Grid className={classes.selectionGridButton}>
            <Button
              buttonType="secondary"
              className={classes.detailsButton}
              compactX
              onClick={openDialog}
            >
              Show Details
            </Button>
          </Grid>
        </Grid>
      );
    };

    return (
      <TableRow ariaLabel={label} data-qa-table-row={label}>
        <TableCell>
          <Radio
            checked={!disabled && checked}
            disabled={disabledCheckedSelect || disabled}
            id={`${stackScriptID}`}
            onChange={onSelect}
          />
        </TableCell>
        <TableCell
          className={classes.stackScriptCell}
          data-qa-stackscript-title
        >
          {renderLabel()}
        </TableCell>
      </TableRow>
    );
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (
  dispatch
) => {
  return {
    openStackScriptDialog: (stackScriptId: number) =>
      dispatch(openStackScriptDialogAction(stackScriptId)),
  };
};

export default recompose<CombinedProps, Props & RenderGuardProps>(
  connect(undefined, mapDispatchToProps),
  RenderGuard,
  withStyles(styles)
)(StackScriptSelectionRow);
