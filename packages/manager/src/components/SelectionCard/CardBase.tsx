import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import { sanitizeHTML } from 'src/utilities/sanitize-html';

type CSSClasses =
  | 'icon'
  | 'checked'
  | 'flex'
  | 'heading'
  | 'innerGrid'
  | 'subheading';

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
    heading: {
      fontFamily: theme.font.bold,
      fontSize: '1rem',
      color: theme.color.headline,
      wordBreak: 'break-word'
    },
    subheading: {
      fontSize: '0.875rem',
      color: theme.palette.text.primary
    },
    innerGrid: {
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: 70,
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
        borderColor: theme.color.border2
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
        transition: theme.transitions.create('backgroundColor')
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
  fullWidth?: boolean;
}

type CombinedProps = Props & WithStyles<CSSClasses>;

export class CardBase extends React.Component<CombinedProps> {
  render() {
    const { classes, heading, renderIcon, subheadings, fullWidth } = this.props;
    return (
      <Grid
        container
        alignItems="center"
        justify="space-between"
        wrap={fullWidth ? 'wrap' : 'nowrap'}
        className={`${classes.innerGrid} innerGrid`}
      >
        {renderIcon && (
          <Grid item className={`${classes.icon} cardBaseIcon`}>
            {renderIcon()}
          </Grid>
        )}
        <Grid item xs={fullWidth ? 12 : 10} className={classes.flex}>
          <div
            className={classes.heading}
            data-qa-select-card-heading={heading}
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(heading) }}
          />
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
        {this.props.children}
      </Grid>
    );
  }
}

const styled = withStyles(styles);

export default styled(CardBase);
