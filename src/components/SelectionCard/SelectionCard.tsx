import * as React from 'react';
import * as classNames from 'classnames';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Check from 'material-ui-icons/Check';
import Tooltip from 'material-ui/Tooltip';
import Grid from 'material-ui/Grid';
import Fade from 'material-ui/transitions/Fade';
import LinodeTheme from '../../../src/theme';

type CSSClasses =
'root'
| 'icon'
| 'checked'
| 'flex'
| 'heading'
| 'innerGrid'
| 'subheading'
| 'disabled'
| 'showCursor';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => ({
  root: {
    marginBottom: theme.spacing.unit,
    maxWidth: 300,
    minWidth: 200,
    backgroundColor: LinodeTheme.bg.offWhite,
    padding: theme.spacing.unit * 2,
    border: '1px solid ' + `${LinodeTheme.bg.main}`,
    transition: `${'background-color .3s ease-in-out, '}
    ${'border-color .3s ease-in-out'}`,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '32%',
      marginRight: '1%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '&:last-child': {
        width: '33%',
        marginRight: 0,
      },
    },
    '&:hover': {
      backgroundColor: '#f4f4f4',
      borderColor: '#C9CACB',
    },
    '&.checked': {
      borderColor: theme.palette.primary.main,
      '& $svg, & span': {
        color: theme.palette.primary.main,
      },
    },
    '& .w100': {
      width: '100%',
    },
  },
  icon: {
    '& svg, & span': {
      fontSize: '32px',
      color: '#939598',
    },
    '& img': {
      maxheight: '32px',
      maxWidth: '32px',
    },
  },
  checked: {
    '& svg': {
      borderRadius: '16px',
      border: '1px solid',
      borderColor: theme.palette.primary.main,
      fontSize: '16px',
      color: theme.palette.primary.main,
    },
  },
  showCursor: {
    cursor: 'pointer',
  },
  disabled: {
    opacity: .40,
    cursor: 'not-allowed',
  },
  heading: {
    fontWeight: 700,
    fontSize: '1em',
    color: LinodeTheme.color.headline,
  },
  subheading: {
    fontSize: '0.8em',
    color: theme.palette.text.primary,
  },
  innerGrid: {
    width: '100%',
    minHeight: 70,
  },
  flex: {
    flex: 1,
  },
});

const styled = withStyles(styles, { withTheme: true });

export interface Props {
  renderIcon?: () => JSX.Element;
  heading: string;
  subheadings: string[];
  checked?: boolean;
  disabled?: boolean;
  tooltip?: string;
  onClick?: () => void;
}

type CombinedProps = Props & WithStyles<CSSClasses>;
interface WithTooltipProps {
  title? : string;
  render: () => JSX.Element;
}

const WithTooltip: React.StatelessComponent<WithTooltipProps> = ({ title, render }) => (title)
  ? (<Tooltip title={title} className="w100">{ render() }</Tooltip>)
  : render();

const SelectionCard: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    renderIcon,
    heading,
    subheadings,
    classes,
    checked,
    disabled,
    tooltip,
    onClick,
  } = props;

  return (
      <Grid
        item
        className={
          classNames({
            [classes.root]: true,
            checked: checked === true,
            [classes.disabled]: disabled === true,
            [classes.showCursor]: onClick && !disabled,
          })
        }
        { ...((onClick && !disabled) && { onClick }) }
      >
        <WithTooltip
          title={tooltip}
          render={() => (
            <Grid
              container
              alignItems="center"
              className={classes.innerGrid}
            >
              {renderIcon &&
                <Grid item className={classes.icon}>
                  {renderIcon()}
                </Grid>
              }
              <Grid item className={classes.flex}>
                <div className={classes.heading}>
                  {heading}
                </div>
                {subheadings.map((subheading, idx) => {
                  return (
                    <div key={idx} className={classes.subheading}>
                      {subheading}
                    </div>
                  );
                })}
              </Grid>

              {checked &&
              <Fade in={checked}>
                <Grid item className={`${classes.icon} ${classes.checked}`}>
                  <Check />
                </Grid>
              </Fade>
              }
            </Grid>
          )}
        />
      </Grid>
  );
};

export default styled<Props>(SelectionCard);
