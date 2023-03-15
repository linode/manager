import classNames from 'classnames';
import * as React from 'react';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import Button, { ButtonProps } from 'src/components/Button';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import H1Header from 'src/components/H1Header';
import { TransferDisplay } from '../TransferDisplay/TransferDisplay';

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
    gridTemplateColumns: 'repeat(5, 1fr) 35% 35% repeat(5, 1fr)',
    gridTemplateRows:
      'max-content 12px max-content 7px max-content 15px max-content 24px max-content 64px min-content',
    gridTemplateAreas: `
      ". . . . . icon icon . . . . ."
      ". . . . . . . . . . . ."
      ". . . . . title title . . . . ."
      ". . . . . . . . . . . ."
      ". . . . . subtitle subtitle . . . . ."
      ". . . . . . . . . . . ."
      ". . . . . copy copy . . . . ."
      ". . . . . . . . . . . ."
      ". . . . . button button . . . . ."
      ". . . . . . . . . . . ."
      ". . . links links links links links links . . ."
    `,
    justifyItems: 'center',
  },
  containerAdjustment: {
    gridTemplateRows:
      'max-content 12px max-content 7px max-content 15px max-content 24px max-content 40px',
    gridTemplateAreas: `
      ". . . . . icon icon . . . . ."
      ". . . . . . . . . . . ."
      ". . . . . title title . . . . ."
      ". . . . . . . . . . . ."
      ". . . . . subtitle subtitle . . . . ."
      ". . . . . . . . . . . ."
      ". . . . . copy copy . . . . ."
      ". . . . . . . . . . . ."
      ". . . . . button button . . . . ."
    `,
  },
  root: {
    padding: `${theme.spacing(2)} 0`,
    [theme.breakpoints.up('md')]: {
      padding: `${theme.spacing(10)} 0`,
    },
  },
  copy: {
    textAlign: 'center',
    gridArea: 'copy',
    minWidth: 'min-content',
    maxWidth: '75%',
    [theme.breakpoints.down('md')]: {
      maxWidth: 'none',
    },
  },
  icon: {
    width: '160px',
    height: '160px',
    padding: theme.spacing(2),
    '& .outerCircle': {
      fill: theme.name === 'light' ? '#fff' : '#000',
      stroke: theme.bg.offWhite,
    },
    '& .circle': {
      fill: theme.name === 'light' ? '#fff' : '#000',
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
    gridArea: 'title',
  },
  subtitle: {
    gridArea: 'subtitle',
    textAlign: 'center',
    color: theme.palette.text.primary,
  },
  '& .insidePath path': {
    opacity: 0,
    animation: '$fadeIn .2s ease-in-out forwards .3s',
    stroke: theme.palette.primary.main,
  },
  '& .bucket.insidePath path': {
    fill: theme.palette.primary.main,
  },
  button: {
    gridArea: 'button',
    display: 'flex',
    gap: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  linksSection: {
    gridArea: 'links',
    borderTop: `1px solid ${theme.name === 'light' ? '#e3e5e8' : '#2e3238'}`,
    paddingTop: '38px',
  },
  linksSectionBottomSeparation: {
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      paddingBottom: theme.spacing(4),
    },
    borderBottom: `1px solid ${theme.name === 'light' ? '#e3e5e8' : '#2e3238'}`,
  },
  iconWrapper: {
    gridArea: 'icon',
    padding: theme.spacing(2),
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
  showTransferDisplay?: boolean;
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
    showTransferDisplay,
  } = props;

  const classes = useStyles();

  const hasSubtitle = subtitle !== undefined;

  return (
    <>
      <div
        className={classNames(props.className, {
          [classes.container]: true,
          [classes.root]: true,
          [classes.containerAdjustment]:
            showTransferDisplay && linksSection === undefined,
        })}
      >
        <div
          className={`${classes.iconWrapper} ${isEntity ? classes.entity : ''}`}
        >
          {Icon && <Icon className={classes.icon} />}
        </div>

        <H1Header
          title={title}
          className={classes.title}
          renderAsSecondary={renderAsSecondary}
          data-qa-placeholder-title
        />
        {hasSubtitle ? (
          <Typography variant="h2" className={classes.subtitle}>
            {subtitle}
          </Typography>
        ) : null}

        <div className={classes.copy}>
          {typeof props.children === 'string' ? (
            <Typography variant="subtitle1">{props.children}</Typography>
          ) : (
            props.children
          )}
        </div>
        <div className={classes.button}>
          {buttonProps &&
            buttonProps.map((thisButton, index) => (
              <Button
                buttonType="primary"
                {...thisButton}
                data-qa-placeholder-button
                data-testid="placeholder-button"
                key={index}
              />
            ))}
        </div>
        {linksSection !== undefined ? (
          <div
            className={classNames({
              [classes.linksSection]: true,
              [classes.linksSectionBottomSeparation]: showTransferDisplay,
            })}
          >
            {linksSection}
          </div>
        ) : null}
      </div>
      {showTransferDisplay ? <TransferDisplay spacingTop={0} /> : null}
    </>
  );
};

Placeholder.defaultProps = {
  icon: LinodeIcon,
};

export default Placeholder;
