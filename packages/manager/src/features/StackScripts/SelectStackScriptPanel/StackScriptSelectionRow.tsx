import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose as recompose } from 'recompose';

import Button from 'src/components/Button';
import { withStyles, WithStyles } from 'src/components/core/styles';
import TableCell from 'src/components/core/TableCell';
import Typography from 'src/components/core/Typography';
import Radio from 'src/components/Radio';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import TableRow from 'src/components/TableRow';
import { openStackScriptDrawer as openStackScriptDrawerAction } from 'src/store/stackScriptDrawer';
import {
  ClassNames,
  displayTagsAndShowMore,
  styles
} from '../StackScriptRowHelpers';

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
      images,
      deploymentsActive,
      updated,
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
        <React.Fragment>
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
          <Typography variant="body1">{description}</Typography>
          <Button className={classes.detailsButton} onClick={openDrawer}>
            Show Details
          </Button>
        </React.Fragment>
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
          <TableCell>
            <Typography variant="h3" data-qa-stackscript-deploys>
              {deploymentsActive}
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="h3" data-qa-stackscript-revision>
              {updated}
            </Typography>
          </TableCell>
          <TableCell
            className={classes.stackScriptCell}
            data-qa-stackscript-images
          >
            {displayTagsAndShowMore(images)}
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
