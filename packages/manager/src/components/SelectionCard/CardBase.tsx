import * as React from 'react';
import * as classNames from 'classnames';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';

export const useStyles = makeStyles((theme: Theme) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  icon: {
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
  },
  heading: {
    fontFamily: theme.font.bold,
    fontSize: '1rem',
    color: theme.color.headline,
    wordBreak: 'break-word',
  },
  subheading: {
    fontSize: '0.875rem',
    color: theme.palette.text.primary,
  },
  innerGrid: {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: 60,
    backgroundColor: theme.bg.offWhiteDT,
    border: '1px solid ' + `${theme.bg.main}`,
    margin: 0,
    padding: `0 ${theme.spacing(1)}px !important`,
    transition: `
      ${'background-color 225ms ease-in-out, '}
      ${'border-color 225ms ease-in-out'}
    `,
    '&:hover': {
      backgroundColor: theme.bg.main,
      borderColor: theme.color.border2,
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
  },
  flex: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    '&> div': {
      lineHeight: 1.3,
    },
  },
}));

export interface Props {
  heading: string;
  subheadings: (string | undefined)[];
  variant?: 'check' | 'info' | 'quantityCheck' | 'default' | 'selectable';
  renderIcon?: () => JSX.Element;
}

type CombinedProps = Props;

const CardBase: React.FC<CombinedProps> = (props) => {
  const { heading, subheadings, variant, renderIcon } = props;

  const classes = useStyles();

  const fullWidth = ['quantityCheck', 'selectable'].includes(variant ?? '');

  return (
    <Grid
      container
      alignItems="center"
      wrap={fullWidth ? 'wrap' : 'nowrap'}
      className={`${classes.innerGrid} innerGrid`}
    >
      {renderIcon && (
        <Grid item className={`${classes.icon} cardBaseIcon`}>
          {renderIcon()}
        </Grid>
      )}
      <Grid
        item
        className={classNames({
          [classes.flex]: variant !== 'default',
        })}
      >
        <div className={classes.heading} data-qa-select-card-heading={heading}>
          {heading}
        </div>
        {subheadings.map((subheading, idx) => {
          return (
            <div
              key={idx}
              className={classes.subheading}
              data-qa-select-card-subheading={subheading}
            >
              {subheading}
            </div>
          );
        })}
      </Grid>
      {props.children}
    </Grid>
  );
};

export default CardBase;
