import * as React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { compose as recompose } from 'recompose';

import { Radio } from 'src/components/Radio/Radio';
import { RenderGuard, RenderGuardProps } from 'src/components/RenderGuard';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { openStackScriptDialog as openStackScriptDialogAction } from 'src/store/stackScriptDialog';

import {
  StyledDetailsButton,
  StyledLabel,
  StyledSelectionGrid,
  StyledSelectionButtonGrid,
  StyledSelectionDetailsGrid,
  StyledTableCell,
  StyledTypography,
  StyledUsernameLabel,
} from '../StackScriptRowHelpers';

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

export type CombinedProps = Props & DispatchProps & RenderGuardProps;

export class StackScriptSelectionRow extends React.Component<
  CombinedProps,
  {}
> {
  render() {
    const {
      checked,
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
        <StyledSelectionGrid alignItems="center" container>
          <StyledSelectionDetailsGrid>
            <Typography variant="h3">
              {stackScriptUsername && (
                <StyledUsernameLabel htmlFor={`${stackScriptID}`}>
                  {stackScriptUsername} /&nbsp;
                </StyledUsernameLabel>
              )}
              <StyledLabel htmlFor={`${stackScriptID}`}>{label}</StyledLabel>
            </Typography>
            {description && (
              <StyledTypography variant="body1">{description}</StyledTypography>
            )}
          </StyledSelectionDetailsGrid>
          <StyledSelectionButtonGrid>
            <StyledDetailsButton
              buttonType="secondary"
              compactX
              onClick={openDialog}
            >
              Show Details
            </StyledDetailsButton>
          </StyledSelectionButtonGrid>
        </StyledSelectionGrid>
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
        <StyledTableCell data-qa-stackscript-title>
          {renderLabel()}
        </StyledTableCell>
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
  RenderGuard
)(StackScriptSelectionRow);
