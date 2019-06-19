import Check from '@material-ui/icons/Check';
import * as classNames from 'classnames';
import * as React from 'react';
import Fade from 'src/components/core/Fade';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Grid from 'src/components/Grid';

import CardBase from './CardBase';

import Info from 'src/assets/icons/info.svg';

type CSSClasses =
  | 'root'
  | 'icon'
  | 'info'
  | 'checked'
  | 'disabled'
  | 'showCursor';

const styles = (theme: Theme) =>
  createStyles({
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
      padding: theme.spacing(2),
      justifyContent: 'center',
      alignItems: 'center',
      display: 'flex',
      outline: 0,
      '&.checked .innerGrid': {
        borderColor: theme.palette.primary.main,
        '& span': {
          color: theme.palette.primary.main
        }
      },
      '&:focus .innerGrid': {
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
      animation: '$fadeIn 225ms ease-in-out forwards 10ms',
      '& svg': {
        borderRadius: '16px',
        border: '1px solid',
        borderColor: theme.palette.primary.main,
        fontSize: '16px',
        color: theme.palette.primary.main
      }
    },

    '&:focus .innerGrid': {
      outline: `1px dotted ${theme.color.focusBorder}`
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
    info: {
      display: 'flex',
      justifyContent: 'flex-end',
      color: theme.palette.primary.main,
      '& .circle': {
        transition: theme.transitions.create('fill')
      },
      '& .path': {
        transition: theme.transitions.create('stroke')
      },
      '&:hover': {
        color: theme.palette.primary.main,
        '& .circle': {
          fill: theme.palette.primary.main
        },
        '& .path': {
          color: 'white'
        }
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
  onClickInfo?: () => void;
  onKeyPress?: (e: React.SyntheticEvent<HTMLElement>) => void;
  renderIcon?: () => JSX.Element;
  heading: string;
  subheadings: (string | undefined)[];
  checked?: boolean;
  disabled?: boolean;
  tooltip?: string;
  variant?: 'check' | 'info';
}

type CombinedProps = Props & WithStyles<CSSClasses>;

interface WithTooltipProps {
  title?: string;
  render: () => JSX.Element;
}

const WithTooltip: React.StatelessComponent<WithTooltipProps> = ({
  title,
  render
}) =>
  title ? (
    <Tooltip title={title} className={'disabledInnerGrid'}>
      {render()}
    </Tooltip>
  ) : (
    render()
  );

class SelectionCard extends React.PureComponent<CombinedProps, {}> {
  handleKeyPress = (e: React.KeyboardEvent<HTMLElement>) => {
    const { onClick, disabled } = this.props;
    if (onClick && !disabled) {
      e.preventDefault();
      onClick(e);
    }
  };

  handleClick = (e: React.MouseEvent<HTMLElement>) => {
    const { onClick, disabled } = this.props;
    if (onClick && !disabled) {
      onClick(e);
    }
  };

  handleInfoClick = (e: React.MouseEvent<any>) => {
    const { onClickInfo } = this.props;
    if (onClickInfo) {
      e.stopPropagation();
      e.preventDefault();
      onClickInfo();
    }
  };

  content = () => {
    const { heading, renderIcon, subheadings } = this.props;

    return (
      <CardBase
        heading={heading}
        renderIcon={renderIcon}
        subheadings={subheadings}
      >
        {this.renderVariant()}
      </CardBase>
    );
  };

  renderVariant = () => {
    const { classes, checked, variant } = this.props;
    switch (variant) {
      case 'info':
        return (
          <Grid item className={`${classes.info}`} xs={2}>
            <Info onClick={this.handleInfoClick} />
          </Grid>
        );
      /**
       * The vast majority of these components use the check variant, so
       * keep that as the default case.
       */
      case 'check':
      default:
        return (
          <Grid
            item
            className={`${classes.icon} ${classes.checked}`}
            data-qa-checked={checked}
            xs={2}
          >
            {checked && (
              <Fade in={checked}>
                <Check />
              </Fade>
            )}
          </Grid>
        );
    }
  };

  render() {
    const { checked, classes, disabled, onClick, tooltip } = this.props;

    return (
      <Grid
        item
        xs={12}
        sm={6}
        lg={4}
        xl={3}
        tabIndex={0}
        className={classNames({
          [classes.root]: true,
          checked: checked === true,
          [classes.disabled]: disabled === true,
          [classes.showCursor]: onClick && !disabled,
          selectionCard: true
        })}
        onClick={this.handleClick}
        onKeyPress={this.handleKeyPress}
        data-qa-selection-card
      >
        <WithTooltip title={tooltip} render={this.content} />
      </Grid>
    );
  }
}

const styled = withStyles(styles);

export default styled(SelectionCard) as React.ComponentType<Props>;
