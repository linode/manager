import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import Tooltip from 'src/components/core/Tooltip';
import { CardBase } from './CardBase';
import { styled } from '@mui/material/styles';
import { SxProps } from '@mui/system';

export interface Props {
  checked?: boolean;
  className?: string;
  disabled?: boolean;
  heading: string;
  headingDecoration?: JSX.Element;
  id?: string;
  onClick?: (e: React.SyntheticEvent<HTMLElement>) => void;
  renderIcon?: () => JSX.Element;
  renderVariant?: () => JSX.Element | null;
  subheadings: (string | undefined)[];
  sx?: SxProps;
  sxCardBase?: SxProps;
  sxCardBaseHeading?: SxProps;
  sxCardBaseIcon?: SxProps;
  sxCardBaseSubheading?: SxProps;
  sxGrid?: SxProps;
  sxTooltip?: SxProps;
  tooltip?: string;
}

export const SelectionCard = React.memo((props: Props) => {
  const {
    checked,
    className,
    disabled,
    heading,
    headingDecoration,
    id,
    onClick,
    renderIcon,
    renderVariant,
    subheadings,
    sxCardBase,
    sxCardBaseHeading,
    sxCardBaseIcon,
    sxCardBaseSubheading,
    sxGrid,
    tooltip,
  } = props;

  const handleKeyPress = (e: React.KeyboardEvent<HTMLElement>) => {
    if (onClick && !disabled) {
      e.preventDefault();
      onClick(e);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (onClick && !disabled) {
      onClick(e);
    }
  };

  const content = (
    <CardBase
      checked={checked}
      heading={heading}
      headingDecoration={headingDecoration}
      renderIcon={renderIcon}
      renderVariant={renderVariant}
      subheadings={subheadings}
      sx={sxCardBase}
      sxHeading={sxCardBaseHeading}
      sxIcon={sxCardBaseIcon}
      sxSubheading={sxCardBaseSubheading}
    />
  );

  const cardGrid = (
    <StyledGrid
      className={className}
      data-qa-selection-card
      disabled={disabled}
      id={id}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      sx={sxGrid}
      tabIndex={0}
      xs={12}
      sm={6}
      lg={4}
      xl={3}
    >
      {content}
    </StyledGrid>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} placement="top">
        {cardGrid}
      </Tooltip>
    );
  }

  return cardGrid;
});

const StyledGrid = styled(Grid, {
  label: 'SelectionCardGrid',
})<Partial<Props>>(({ ...props }) => ({
  '&:focus': {
    outline: '1px dotted #999',
  },
  '& [class^="fl-"]': {
    transition: 'color 225ms ease-in-out',
  },
  ...(props.onClick &&
    !props.disabled && {
      cursor: 'pointer',
    }),
  ...(props.disabled && {
    cursor: 'not-allowed',
    '& > div': {
      opacity: 0.4,
    },
  }),
}));
