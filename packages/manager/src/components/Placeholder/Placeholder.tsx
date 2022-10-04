import * as React from 'react';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import Button, { ButtonProps } from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
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
  root: {
    padding: `${theme.spacing(2)}px 0`,
    [theme.breakpoints.up('md')]: {
      padding: `${theme.spacing(10)}px 0`,
    },
  },
  copy: {
    textAlign: 'center',
    maxWidth: '85%',
    marginTop: -theme.spacing(3),
    [theme.breakpoints.up('md')]: {
      maxWidth: 800,
    },
  },
  icon: {
    padding: theme.spacing(2),
    width: '160px',
    height: '160px',
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
  '& .insidePath path': {
    opacity: 0,
    animation: '$fadeIn .2s ease-in-out forwards .3s',
    stroke: theme.palette.primary.main,
  },
  '& .bucket.insidePath path': {
    fill: theme.palette.primary.main,
  },
  titleWithSubtitle: {
    textAlign: 'center',
    '& + h2': {
      marginBottom: theme.spacing(2),
      color: theme.palette.text.primary,
    },
  },
  button: {
    marginBottom: theme.spacing(4),
  },
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
    <Grid
      container
      spacing={3}
      alignItems="center"
      direction="column"
      justifyContent="center"
      className={`${classes.root} ${props.className}`}
    >
      <Grid item xs={12} className={isEntity ? classes.entity : ''}>
        {Icon && <Icon className={classes.icon} />}
      </Grid>
      <Grid item xs={12}>
        <H1Header
          title={title}
          className={titleClassName}
          renderAsSecondary={renderAsSecondary}
          data-qa-placeholder-title
        />
        {hasSubtitle ? <Typography variant="h2">{subtitle}</Typography> : null}
      </Grid>
      <Grid item xs={12} lg={10} className={classes.copy}>
        {typeof props.children === 'string' ? (
          <Typography variant="subtitle1">{props.children}</Typography>
        ) : (
          props.children
        )}
      </Grid>
      {buttonProps && (
        <Grid
          container
          item
          direction="row"
          alignItems="center"
          justifyContent="center"
        >
          {buttonProps.map((thisButton, index) => (
            <Grid item key={`placeholder-button-${index}`}>
              <Button
                buttonType="primary"
                className={classes.button}
                {...thisButton}
                data-qa-placeholder-button
                data-testid="placeholder-button"
              />
            </Grid>
          ))}
        </Grid>
      )}
      {linksSection !== undefined ? linksSection : null}
    </Grid>
  );
};

Placeholder.defaultProps = {
  icon: LinodeIcon,
};

export default Placeholder;
