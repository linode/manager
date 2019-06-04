import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose as recompose } from 'recompose';
import Button from 'src/components/Button';
import { withStyles } from 'src/components/core/styles';
import TableCell from 'src/components/core/TableCell';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Radio from 'src/components/Radio';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import TableRow from 'src/components/TableRow';
import { openStackScriptDrawer as openStackScriptDrawerAction } from 'src/store/stackScriptDrawer';
import { ClassNames, styles } from '../StackScriptRowHelpers';

export interface Props {
  label: string;
  description: string;
  images: string[];
  deploymentsActive: number;
  updated: string;
  disabledCheckedSelect?: boolean;
  onSelect?: (e: React.ChangeEvent<HTMLElement>, value: boolean) => void;
  checked?: boolean;
  stackScriptID: number;
  stackScriptUsername: string;
  disabled?: boolean;
}

interface DispatchProps {
  openStackScriptDrawer: (stackScriptId: number) => void;
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
      classes,
      onSelect,
      disabledCheckedSelect,
      checked,
      label,
      description,
      stackScriptID,
      stackScriptUsername,
      openStackScriptDrawer,
      disabled
    } = this.props;

    const renderLabel = () => {
      const openDrawer = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        openStackScriptDrawer(stackScriptID);
      };
      return (
        <Grid container alignItems="center" className={classes.selectionGrid}>
          <Grid item>
            <Typography variant="h3">
              {stackScriptUsername && (
                <label
                  htmlFor={`${stackScriptID}`}
                  className={`${classes.libRadioLabel} ${
                    classes.stackScriptUsername
                  }`}
                >
                  {stackScriptUsername} /&nbsp;
                </label>
              )}
              <label
                htmlFor={`${stackScriptID}`}
                className={classes.libRadioLabel}
              >
                {label}
              </label>
            </Typography>
            {description && (
              <Typography variant="body1" className={classes.libDescription}>
                {description}
              </Typography>
            )}
          </Grid>
          <Grid item>
            <Button
              compact
              className={classes.detailsButton}
              onClick={openDrawer}
            >
              Show Details
            </Button>
          </Grid>
        </Grid>
      );
    };

    return (
      <React.Fragment>
        <TableRow
          data-qa-table-row={label}
          rowLink={onSelect ? e => onSelect(e, !checked) : undefined}
        >
          <TableCell>
            <Radio
              checked={!disabled && checked}
              disabled={disabledCheckedSelect || disabled}
              onChange={onSelect}
              id={`${stackScriptID}`}
            />
          </TableCell>
          <TableCell
            className={classes.stackScriptCell}
            data-qa-stackscript-title
          >
            {renderLabel()}
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps: MapDispatchToProps<
  DispatchProps,
  Props
> = dispatch => {
  return {
    openStackScriptDrawer: (stackScriptId: number) =>
      dispatch(openStackScriptDrawerAction(stackScriptId))
  };
};

export default recompose<CombinedProps, Props & RenderGuardProps>(
  connect(
    undefined,
    mapDispatchToProps
  ),
  RenderGuard,
  withStyles(styles)
)(StackScriptSelectionRow);
