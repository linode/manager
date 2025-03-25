import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useStyles } from 'tss-react/mui';

import { omittedProps } from '../../utilities/omittedProps';
import { Box } from '../Box';
import { Button } from '../Button';

import type { BoxProps } from '../Box';
import type { ButtonProps } from '../Button';

export interface ActionButtonsProps extends ButtonProps {
  'data-node-idx'?: number;
  'data-qa-form-data-loading'?: boolean;
  'data-testid'?: string;
  label: string;
}

export interface ActionPanelProps extends BoxProps {
  /**
   * primary type actionable button custom aria descripton.
   */
  primaryButtonProps?: ActionButtonsProps;
  /**
   * Determines the position of the primary button within the actions panel.
   */
  reversePrimaryButtonPosition?: boolean;
  /**
   * secondary type actionable button custom aria descripton.
   */
  secondaryButtonProps?: ActionButtonsProps;
}

/**
 * `ActionPanel` is a container for primary and secondary actions (ex: "Cancel" & "Save")
 * It can also be used to render a single action within modals or drawers for styling and layout consistency.
 */
export const ActionsPanel = (props: ActionPanelProps) => {
  const {
    className,
    primaryButtonProps,
    reversePrimaryButtonPosition = false,
    secondaryButtonProps,
    ...rest
  } = props;

  const { cx } = useStyles();

  const primaryButtonDataQAProp = `data-qa-${primaryButtonProps?.['data-testid']}`;
  const secondaryButtonDataQAProp = `data-qa-${secondaryButtonProps?.['data-testid']}`;

  return (
    <StyledBox
      className={cx(className, 'actionPanel')}
      data-qa-buttons
      reversePrimaryButtonPosition={reversePrimaryButtonPosition}
      {...rest}
    >
      {secondaryButtonProps ? (
        <Button
          {...{ [secondaryButtonDataQAProp]: true }}
          buttonType="secondary"
          data-qa-cancel
          {...secondaryButtonProps}
        >
          {secondaryButtonProps.label}
        </Button>
      ) : null}
      {primaryButtonProps ? (
        <Button
          {...{ [primaryButtonDataQAProp]: true }}
          buttonType="primary"
          {...primaryButtonProps}
        >
          {primaryButtonProps.label}
        </Button>
      ) : null}
    </StyledBox>
  );
};

const StyledBox = styled(Box, {
  label: 'StyledActionsPanel',
  shouldForwardProp: omittedProps(['reversePrimaryButtonPosition']),
})<ActionPanelProps>(({ theme: { spacing }, ...props }) => ({
  display: 'flex',
  flexDirection: props.reversePrimaryButtonPosition ? 'row-reverse' : 'row',
  gap: spacing(),
  justifyContent: 'flex-end',
  marginTop: spacing(1),
  paddingBottom: spacing(1),
  paddingTop: spacing(1),
}));
