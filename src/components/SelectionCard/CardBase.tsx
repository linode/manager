import * as React from 'react';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';

type CSSClasses =
  | 'root'
  | 'icon'
  | 'checked'
  | 'flex'
  | 'heading'
  | 'innerGrid'
  | 'subheading'
  | 'disabled'
  | 'showCursor';

const styles: StyleRulesCallback<CSSClasses> = theme => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0
    },
    to: {
      opacity: 1
    }
  },
  root: {
    minWidth: 200,
    padding: theme.spacing.unit * 2,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    outline: 0,
    '&.checked $innerGrid': {
      borderColor: theme.palette.primary.main,
      '& span': {
        color: theme.palette.primary.main
      }
    },
    '&:focus $innerGrid': {
      outline: `1px dotted ${theme.color.focusBorder}`
    },
    '& .disabledInnerGrid': {
      width: '100%',
      backgroundColor: theme.bg.offWhiteDT,
      border: '1px solid ' + `${theme.color.grey1}`
    },
    '& [class^="fl-"]': {
      transition: 'color 225ms ease-in-out'
    }
  },
  icon: {
    display: 'flex',
    justifyContent: 'flex-end',
    '& svg, & span': {
      fontSize: '32px',
      color: '#939598'
    },
    '& img': {
      maxHeight: '32px',
      maxWidth: '32px'
    }
  },
  checked: {
    display: 'flex',
    animation: 'fadeIn 225ms ease-in-out forwards 10ms',
    '& svg': {
      borderRadius: '16px',
      border: '1px solid',
      borderColor: theme.palette.primary.main,
      fontSize: '16px',
      color: theme.palette.primary.main
    }
  },
  showCursor: {
    cursor: 'pointer'
  },
  disabled: {
    cursor: 'not-allowed',
    '& > div': {
      opacity: 0.4
    }
  },
  heading: {
    fontFamily: theme.font.bold,
    fontSize: '1rem',
    color: theme.color.headline
  },
  subheading: {
    fontSize: '0.875rem',
    color: theme.palette.text.primary
  },
  innerGrid: {
    width: '100%',
    height: '100%',
    minHeight: 70,
    backgroundColor: theme.bg.offWhiteDT,
    border: '1px solid ' + `${theme.bg.main}`,
    margin: 0,
    padding: '0 !important',
    transition: `
      ${'background-color 225ms ease-in-out, '}
      ${'border-color 225ms ease-in-out'}
    `,
    '&:hover': {
      backgroundColor: theme.bg.main,
      borderColor: theme.color.border2
    }
  },
  flex: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    '&> div': {
      lineHeight: 1.3
    }
  }
});

export interface Props {
  onClick?: (e: React.SyntheticEvent<HTMLElement>) => void;
  onKeyPress?: (e: React.SyntheticEvent<HTMLElement>) => void;
  renderIcon?: () => JSX.Element;
  heading: string;
  subheadings: (string | undefined)[];
  checked?: boolean;
  disabled?: boolean;
  tooltip?: string;
}

type CombinedProps = Props & WithStyles<CSSClasses>;

export const CardBase: React.FunctionComponent<CombinedProps> = props => {
  const { classes, heading, renderIcon, subheadings } = props;
  return (
    <Grid
      container
      alignItems="center"
      justify="space-between"
      className={classes.innerGrid}
    >
      {renderIcon && (
        <Grid item className={classes.icon}>
          {renderIcon()}
        </Grid>
      )}
      <Grid item xs={10} className={classes.flex}>
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
      {/* Render children? */}
    </Grid>
  );
};

const styled = withStyles(styles);

export default styled(CardBase);
