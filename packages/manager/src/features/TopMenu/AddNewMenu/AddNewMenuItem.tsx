import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type CSSClasses =
  | 'root'
  | 'content'
  | 'link'
  | 'titleLink'
  | 'body'
  | 'iconWrapper';

const styles = (theme: Theme) =>
  createStyles({
    '@keyframes dash': {
      to: {
        'stroke-dashoffset': 0
      }
    },
    root: {
      paddingLeft: theme.spacing(),
      paddingRight: theme.spacing(),
      paddingTop: theme.spacing(),
      paddingBottom: theme.spacing(),
      borderBottom: `1px solid ${theme.palette.divider}`,
      maxWidth: '370px',
      display: 'flex',
      alignItems: 'center',
      transition: 'background-color .2s ease-in-out',
      '& .circle': {
        fill: theme.bg.offWhiteDT
      },
      '& .outerCircle': {
        stroke: theme.bg.main
      },
      '&:hover, &:focus': {
        ...theme.addCircleHoverEffect,
        backgroundColor: theme.bg.main,
        color: theme.palette.text.primary
      }
    },
    iconWrapper: {
      width: 48,
      height: 48,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: theme.spacing(),
      paddingRight: theme.spacing(2),
      width: '100%'
    },
    titleLink: {
      textDecoration: 'none',
      color: theme.color.black,
      fontSize: '1.18rem'
    },
    body: {
      marginTop: 3,
      fontSize: '.9rem',
      lineHeight: '1.1rem'
    },
    link: {
      display: 'flex'
    }
  });

interface Props {
  title: string;
  body: string;
  ItemIcon: React.ComponentClass<any>;
  attr?: { [key: string]: any };
}

interface State {
  anchorEl?: HTMLElement;
}

type PropsWithStyles = Props & WithStyles<CSSClasses>;

class AddNewMenuItem extends React.Component<PropsWithStyles, State> {
  render() {
    const { classes, title, body, ItemIcon, attr } = this.props;

    return (
      <div className={classes.root} data-qa-add-new-menu={title}>
        <div className={classes.iconWrapper} {...attr}>
          <ItemIcon />
        </div>
        <div className={classes.content}>
          <Typography variant="h3">{title}</Typography>
          <Typography variant="body1" className={classes.body}>
            {body}
          </Typography>
        </div>
      </div>
    );
  }
}

const styled = withStyles(styles);

export default styled(AddNewMenuItem);
