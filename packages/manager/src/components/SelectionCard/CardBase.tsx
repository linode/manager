import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import { SxProps } from '@mui/system';

const CardBaseGrid = styled(Grid, {
  label: 'CardBaseGrid',
})<Partial<Props>>(({ theme, ...props }) => ({
  alignItems: 'center',
  backgroundColor: props.checked ? theme.bg.lightBlue2 : theme.bg.offWhite,
  border: `1px solid ${theme.bg.main}`,
  borderColor: props.checked ? theme.palette.primary.main : undefined,
  height: '100%',
  margin: 0,
  minHeight: 60,
  padding: `0 ${theme.spacing(1)} !important`,
  position: 'relative',
  transition:
    'background-color 225ms ease-in-out, border-color 225ms ease-in-out',
  width: '100%',

  '&:hover': {
    backgroundColor: props.checked ? theme.bg.lightBlue2 : theme.bg.main,
    borderColor: props.checked
      ? theme.palette.primary.main
      : theme.color.border2,
  },

  '&:before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    top: 0,
    left: 0,
    width: 5,
    height: '100%',
    backgroundColor: 'transparent',
    transition: theme.transitions.create('backgroundColor'),
  },
}));

const CardBaseIcon = styled(Grid)(() => ({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'flex-end',
  '& svg, & span': {
    fontSize: 32,
    color: '#939598',
  },
  '& img': {
    maxHeight: 32,
    maxWidth: 32,
  },
}));

const CardBaseHeadings = styled(Grid)(() => ({
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'space-around',
  '& > div': {
    lineHeight: 1.3,
  },
}));

const CardBaseHeading = styled('div')(({ theme }) => ({
  fontFamily: theme.font.bold,
  fontSize: '1rem',
  color: theme.color.headline,
  wordBreak: 'break-word',
  display: 'flex',
  alignItems: 'center',
  columnGap: theme.spacing(2),
}));

const CardBaseSubheading = styled('div')(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: '0.875rem',
}));

interface Props {
  checked?: boolean;
  heading: string | JSX.Element;
  headingDecoration?: JSX.Element;
  renderIcon?: () => JSX.Element;
  renderVariant?: () => JSX.Element | null;
  subheadings: (string | undefined)[];
  sx?: SxProps;
  sxHeading?: SxProps;
  sxIcon?: SxProps;
  sxSubheading?: SxProps;
}

const CardBase = (props: Props) => {
  const {
    checked,
    heading,
    headingDecoration,
    renderIcon,
    renderVariant,
    subheadings,
    sx,
    sxHeading,
    sxIcon,
    sxSubheading,
  } = props;

  const renderSubheadings = subheadings.map((subheading, idx) => {
    return (
      <CardBaseSubheading
        key={idx}
        data-qa-select-card-subheading={subheading}
        sx={sxSubheading}
      >
        {subheading}
      </CardBaseSubheading>
    );
  });

  return (
    <CardBaseGrid checked={checked} container sx={sx} spacing={2}>
      {renderIcon && <CardBaseIcon sx={sxIcon}>{renderIcon()}</CardBaseIcon>}
      <CardBaseHeadings sx={sxHeading}>
        <CardBaseHeading data-qa-select-card-heading={heading}>
          {heading}
          {headingDecoration}
        </CardBaseHeading>
        {renderSubheadings}
      </CardBaseHeadings>
      {renderVariant ? renderVariant() : null}
    </CardBaseGrid>
  );
};

export default CardBase;
