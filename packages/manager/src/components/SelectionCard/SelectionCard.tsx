import classNames from 'classnames';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Grid from 'src/components/Grid';
import CardBase from './CardBase';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minWidth: 200,
    padding: theme.spacing(2),
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    outline: 0,
    '&.checked .cardBaseGrid': {
      backgroundColor: theme.bg.lightBlue2,
      borderColor: theme.palette.primary.main,
      '& span': {
        color: theme.palette.primary.main,
      },
    },
    '&:focus .cardBaseGrid': {
      outline: '1px dotted #999',
    },
    '& [class^="fl-"]': {
      transition: 'color 225ms ease-in-out',
    },
  },
  showCursor: {
    cursor: 'pointer',
  },
  disabled: {
    cursor: 'not-allowed',
    '& > div': {
      opacity: 0.4,
    },
  },
}));

export interface Props {
  id?: string;
  heading: string;
  subheadings: (string | undefined)[];
  checked?: boolean;
  disabled?: boolean;
  tooltip?: string;
  className?: string;
  onClick?: (e: React.SyntheticEvent<HTMLElement>) => void;
  renderIcon?: () => JSX.Element;
  renderVariant?: () => JSX.Element | null;
}

const SelectionCard: React.FC<Props> = (props) => {
  const {
    id,
    heading,
    subheadings,
    checked,
    disabled,
    tooltip,
    className,
    onClick,
    renderIcon,
    renderVariant,
  } = props;

  const classes = useStyles();

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
      renderIcon={renderIcon}
      heading={heading}
      subheadings={subheadings}
      renderVariant={renderVariant}
    />
  );

  const cardGrid = (
    <Grid
      id={id}
      item
      xs={12}
      sm={6}
      lg={4}
      xl={3}
      tabIndex={0}
      className={classNames(
        {
          [classes.root]: true,
          checked,
          [classes.disabled]: disabled,
          [classes.showCursor]: onClick && !disabled,
        },
        className
      )}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      data-qa-selection-card
    >
      {content}
    </Grid>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} placement="top">
        {cardGrid}
      </Tooltip>
    );
  }

  return cardGrid;
};

export default React.memo(SelectionCard);
