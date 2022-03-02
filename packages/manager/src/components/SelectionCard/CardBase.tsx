import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
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
  cardBaseGrid: {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: 60,
    backgroundColor: theme.bg.offWhite,
    border: `1px solid ${theme.bg.main}`,
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
  renderIcon?: () => JSX.Element;
  heading: string;
  subheadings: (string | undefined)[];
  renderVariant?: () => JSX.Element | null;
}

type CombinedProps = Props;

const CardBase: React.FC<CombinedProps> = (props) => {
  const { renderIcon, heading, subheadings, renderVariant } = props;

  const classes = useStyles();

  return (
    <Grid
      container
      alignItems="center"
      className={`${classes.cardBaseGrid} cardBaseGrid`}
    >
      {renderIcon && (
        <Grid item className={`${classes.icon} cardBaseIcon`}>
          {renderIcon()}
        </Grid>
      )}
      <Grid item className={`${classes.flex} cardBaseHeadings`}>
        <div className={classes.heading} data-qa-select-card-heading={heading}>
          {heading}
        </div>
        {subheadings.map((subheading, idx) => {
          return (
            <div
              key={idx}
              className={`${classes.subheading} cardBaseSubHeading`}
              data-qa-select-card-subheading={subheading}
            >
              {subheading}
            </div>
          );
        })}
      </Grid>
      {renderVariant ? renderVariant() : null}
    </Grid>
  );
};

export default CardBase;
