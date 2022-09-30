import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Link from 'src/components/Link';
import PointerIcon from 'src/assets/icons/pointer.svg';
import { sendEvent } from 'src/utilities/ga';

const useStyles = makeStyles((theme: Theme) => ({
  appSection: {
    display: 'grid',
    gridTemplateColumns: `repeat(2, ${theme.spacing(17.125)}px)`,
    columnGap: `${theme.spacing()}px`,
    rowGap: `${theme.spacing()}px`,
    gridAutoFlow: 'row',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  appLink: {
    display: 'flex',
    alignItems: 'center',
    gridColumn: 'span 1',
    height: theme.spacing(4.25),
    maxWidth: theme.spacing(17.125),
    paddingLeft: theme.spacing(),
    justifyContent: 'space-between',
    backgroundColor: theme.bg.offWhite,
    fontSize: '1.125rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.color.border3}`,
    '&:hover': {
      textDecoration: 'none',
    },
    '&:focus': {
      textDecoration: 'none',
    },
  },
  appLinkIcon: {
    display: 'flex',
    height: '100%',
    aspectRatio: '1 / 1',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeft: `1px solid ${theme.color.border3}`,
  },
}));

const AppsSection = () => {
  const gaCategory = 'Linodes landing page empty';

  const linkGAEventTemplate = {
    category: gaCategory,
    action: 'Click:link',
  };

  const onLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    const label = event.currentTarget.textContent ?? '';
    sendEvent({ ...linkGAEventTemplate, label: label });
  };
  const classes = useStyles();

  return (
    <div className={classes.appSection}>
      <Link
        onClick={onLinkClick}
        to="/linodes/create?type=One-Click&appID=401697&utm_source=marketplace&utm_medium=website&utm_campaign=WordPress"
        className={classes.appLink}
      >
        Wordpress
        <div className={classes.appLinkIcon}>
          <PointerIcon />
        </div>
      </Link>
      <Link
        onClick={onLinkClick}
        to="/linodes/create?type=One-Click&appID=869129&utm_source=marketplace&utm_medium=website&utm_campaign=aaPanel"
        className={classes.appLink}
      >
        aaPanel
        <div className={classes.appLinkIcon}>
          <PointerIcon />
        </div>
      </Link>
      <Link
        onClick={onLinkClick}
        to="/linodes/create?type=One-Click&appID=595742&utm_source=marketplace&utm_medium=website&utm_campaign=cPanel"
        className={classes.appLink}
      >
        cPanel
        <div className={classes.appLinkIcon}>
          <PointerIcon />
        </div>
      </Link>
      <Link
        onClick={onLinkClick}
        to="/linodes/create?type=One-Click&appID=691621&utm_source=marketplace&utm_medium=website&utm_campaign=Cloudron"
        className={classes.appLink}
      >
        Cloudron
        <div className={classes.appLinkIcon}>
          <PointerIcon />
        </div>
      </Link>
      <Link
        onClick={onLinkClick}
        to="/linodes/create?type=One-Click&appID=593835&utm_source=marketplace&utm_medium=website&utm_campaign=Plesk"
        className={classes.appLink}
      >
        Plesk
        <div className={classes.appLinkIcon}>
          <PointerIcon />
        </div>
      </Link>
      <Link
        onClick={onLinkClick}
        to="/linodes/create?type=One-Click&appID=985372&utm_source=marketplace&utm_medium=website&utm_campaign=Joomla"
        className={classes.appLink}
      >
        Joomla
        <div className={classes.appLinkIcon}>
          <PointerIcon />
        </div>
      </Link>
    </div>
  );
};

export default AppsSection;
