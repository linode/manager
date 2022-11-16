import * as React from 'react';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import Button, { ButtonProps } from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import H1Header from 'src/components/H1Header';

const useStyles = makeStyles((theme: Theme) => ({
  '@keyframes scaleIn': {
    from: {
      transform: 'translateX( -10px ) rotateY( -180deg )',
    },
    to: {
      transformOrigin: 'center center',
    },
  },
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  container: {
    display: 'grid',
    gridTemplateColumns: '15% auto 15%',
    gridTemplateRows: 'repeat(6, max-content)',
    gridTemplateAreas: `
      ". icon ."
      ". title . "
      ". subtitle ."
      ". copy ."
      ". button ."
      "links links links"
    `,
    justifyItems: 'center',
  },
  root: {
    padding: `${theme.spacing(2)}px 0`,
    [theme.breakpoints.up('md')]: {
      padding: `${theme.spacing(10)}px 0`,
    },
  },
  copy: {
    textAlign: 'center',
    gridArea: 'copy',
    minWidth: 'min-content',
    maxWidth: '70%',
  },
  icon: {
    width: '160px',
    height: '160px',
    padding: '16px',
    '& .outerCircle': {
      fill: theme.name === 'lightTheme' ? '#fff' : '#000',
      stroke: theme.bg.offWhite,
    },
    '& .circle': {
      fill: theme.name === 'lightTheme' ? '#fff' : '#000',
    },
    '& .insidePath path': {
      opacity: 0,
      stroke: theme.palette.primary.main,
    },
    '& .bucket.insidePath path': {
      fill: theme.palette.primary.main,
    },
  },
  entity: {
    borderRadius: '50%',
    backgroundColor: theme.bg.bgPaper,
    color: theme.color.green,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing(2),
  },
  subtitle: {
    gridArea: 'subtitle',
  },
  '& .insidePath path': {
    opacity: 0,
    animation: '$fadeIn .2s ease-in-out forwards .3s',
    stroke: theme.palette.primary.main,
  },
  '& .bucket.insidePath path': {
    fill: theme.palette.primary.main,
  },
  titleWithSubtitle: {
    gridArea: 'title',
    textAlign: 'center',
    '& + h2': {
      marginBottom: theme.spacing(2),
      color: theme.palette.text.primary,
    },
  },
  button: {
    gridArea: 'button',
    marginBottom: theme.spacing(4),
  },
  linksSection: {
    gridArea: 'links',
  },
  iconWrapper: {
    gridArea: 'icon',
  }
}));

export interface ExtendedButtonProps extends ButtonProps {
  target?: string;
}

export interface Props {
  icon?: React.ComponentType<any>;
  children?: string | React.ReactNode;
  title: string;
  buttonProps?: ExtendedButtonProps[];
  className?: string;
  isEntity?: boolean;
  renderAsSecondary?: boolean;
  subtitle?: string;
  linksSection?: JSX.Element;
}

const Placeholder: React.FC<Props> = (props) => {
  const {
    isEntity,
    title,
    icon: Icon,
    buttonProps,
    renderAsSecondary,
    subtitle,
    linksSection,
  } = props;
  const classes = useStyles();
  const hasSubtitle = subtitle !== undefined;
  const titleClassName = hasSubtitle
    ? classes.titleWithSubtitle
    : classes.title;
  return (
    <div className={`${classes.container} ${classes.root} ${props.className}`}>
      <div className={`${classes.iconWrapper} ${isEntity ? classes.entity : ''}`}>
        {Icon && <Icon className={classes.icon} />}
      </div>


      <H1Header
        title={title}
        className={titleClassName}
        renderAsSecondary={renderAsSecondary}
        data-qa-placeholder-title
      />
      {hasSubtitle ? <Typography variant="h2" className={classes.subtitle}>{subtitle}</Typography> : null}


      <div className={classes.copy}>
        {typeof props.children === 'string' ? (
          <Typography variant="subtitle1">{props.children}</Typography>
        ) : (
          props.children
        )}
      </div>

      {buttonProps && (
        buttonProps.map((thisButton, index) => (
          <Button
            buttonType="primary"
            className={classes.button}
            {...thisButton}
            data-qa-placeholder-button
            data-testid="placeholder-button"
          />
        ))

      )}
      <div className={classes.linksSection}>
        {linksSection !== undefined ? linksSection : null}
      </div>
    </div>
  );
};

Placeholder.defaultProps = {
  icon: LinodeIcon,
};

export default Placeholder;
