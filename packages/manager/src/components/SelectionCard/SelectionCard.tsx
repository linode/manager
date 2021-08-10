import Check from '@material-ui/icons/Check';
import * as classNames from 'classnames';
import * as React from 'react';
import Button from 'src/components/Button';
import Fade from 'src/components/core/Fade';
import Tooltip from 'src/components/core/Tooltip';
import EnhancedNumberInput from 'src/components/EnhancedNumberInput';
import Grid from 'src/components/Grid';
import CardBase from './CardBase';
import Info from 'src/assets/icons/info.svg';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
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
      backgroundColor: theme.cmrBGColors.bgCopyButton,
      '& span': {
        color: theme.palette.primary.main,
      },
    },
    '&:focus .innerGrid': {
      outline: `1px dotted ${theme.color.focusBorder}`,
    },
    '& .disabledInnerGrid': {
      width: '100%',
      backgroundColor: theme.bg.offWhiteDT,
      border: '1px solid ' + `${theme.color.grey1}`,
    },
    '& [class^="fl-"]': {
      transition: 'color 225ms ease-in-out',
    },
  },
  icon: {
    display: 'flex',
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
  checked: {
    display: 'flex',
    animation: '$fadeIn 225ms ease-in-out forwards 10ms',
    '& svg': {
      borderRadius: 16,
      border: `1px solid ${theme.palette.primary.main}`,
      fontSize: 16,
      color: theme.palette.primary.main,
    },
  },

  '&:focus .innerGrid': {
    outline: `1px dotted ${theme.color.focusBorder}`,
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
  heading: {
    fontFamily: theme.font.bold,
    fontSize: '1rem',
    color: theme.color.headline,
  },
  subheading: {
    fontSize: '0.875rem',
    color: theme.palette.text.primary,
  },
  innerGrid: {
    width: '100%',
    height: '100%',
    minHeight: 70,
    backgroundColor: theme.bg.offWhiteDT,
    border: `1px solid ${theme.bg.main}`,
    margin: 0,
    padding: '0 !important',
    transition: `
      ${'background-color 225ms ease-in-out, '}
      ${'border-color 225ms ease-in-out'}
    `,
    '&:hover': {
      backgroundColor: theme.bg.main,
      borderColor: theme.color.border2,
    },
  },
  info: {
    display: 'flex',
    justifyContent: 'flex-end',
    color: theme.palette.primary.main,
    maxWidth: 40,
    '& .circle': {
      transition: theme.transitions.create('fill'),
    },
    '& .path': {
      transition: theme.transitions.create('stroke'),
    },
    '&:hover': {
      color: theme.palette.primary.main,
      '& .circle': {
        fill: theme.palette.primary.main,
      },
      '& .path': {
        color: 'white',
      },
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
  enhancedInputOuter: {
    display: 'flex',
    alignItems: 'center',
  },
  enhancedInputButton: {
    marginLeft: 10,
    minWidth: 80,
    paddingTop: 12,
    paddingBottom: 12,
    '& span': {
      color: '#fff !important',
    },
  },
}));

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
  variant?: 'check' | 'info' | 'quantityCheck' | 'selectable';
  className?: string;
  inputValue?: number;
  setInputValue?: (value: number) => void;
  submitForm?: (e: any) => void;
  buttonDisabled?: boolean;
  displayButton?: boolean;
}

interface WithTooltipProps {
  title?: string;
}

type CombinedProps = Props & WithTooltipProps;

const SelectionCard: React.FC<CombinedProps> = (props) => {
  const {
    onClick,
    disabled,
    onClickInfo,
    heading,
    renderIcon,
    subheadings,
    variant,
    checked,
    inputValue,
    setInputValue,
    submitForm,
    buttonDisabled,
    displayButton,
    tooltip,
    className,
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

  const handleInfoClick = (e: React.MouseEvent<any>) => {
    if (onClickInfo) {
      e.stopPropagation();
      e.preventDefault();
      onClickInfo();
    }
  };

  const renderVariant = () => {
    switch (variant) {
      case 'info':
        return (
          <Grid item className={`${classes.info} cardBaseInfo`} xs={2}>
            <Info onClick={handleInfoClick} />
          </Grid>
        );
      case 'quantityCheck':
        return (
          <Grid item xs={12}>
            {typeof inputValue === 'number' && setInputValue && (
              <div className={classes.enhancedInputOuter}>
                <EnhancedNumberInput
                  value={inputValue}
                  setValue={setInputValue}
                  small
                />
                {displayButton && (
                  <Button
                    buttonType="primary"
                    onClick={submitForm}
                    disabled={buttonDisabled}
                    className={classes.enhancedInputButton}
                  >
                    Add
                  </Button>
                )}
              </div>
            )}
          </Grid>
        );
      case 'check':
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
      case 'selectable':
      default:
        return null;
    }
  };

  const content = (
    <CardBase
      heading={heading}
      renderIcon={renderIcon}
      subheadings={subheadings}
      fullWidth={variant === 'quantityCheck' || variant === 'selectable'}
    >
      {renderVariant()}
    </CardBase>
  );

  const cardGrid = (
    <Grid
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
