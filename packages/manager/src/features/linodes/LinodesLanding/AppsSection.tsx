import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Link from 'src/components/Link';
import PointerIcon from 'src/assets/icons/pointer.svg';
import { sendEvent } from 'src/utilities/ga';

const useStyles = makeStyles((theme: Theme) => {
  const isDarkTheme = theme.name === 'darkTheme';
  const backgroundColor = isDarkTheme
    ? theme.bg.primaryNavPaper
    : theme.bg.offWhite;
  const borderColor = isDarkTheme ? '#3a3f46' : theme.color.border3;
  const iconColor = isDarkTheme
    ? theme.textColors.linkActiveLight
    : theme.palette.primary.main;
  return {
    appSection: {
      display: 'grid',
      gridTemplateColumns: `repeat(2, ${theme.spacing(20)}px)`,
      columnGap: `${theme.spacing(3)}px`,
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
      maxWidth: theme.spacing(20),
      paddingLeft: theme.spacing(),
      justifyContent: 'space-between',
      backgroundColor: backgroundColor,
      fontSize: '0.875rem',
      fontWeight: 700,
      color: theme.palette.text.primary,
      border: `1px solid ${borderColor}`,
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
      borderLeft: `1px solid ${borderColor}`,
      color: iconColor,
    },
  };
});

const gaCategory = 'Linodes landing page empty';

const linkGAEventTemplate = {
  category: gaCategory,
  action: 'Click:link',
};

const appsLinkData = [
  {
    to:
      '/linodes/create?type=One-Click&appID=401697&utm_source=marketplace&utm_medium=website&utm_campaign=WordPress',
    text: 'Wordpress',
  },
  {
    to:
      '/linodes/create?type=One-Click&appID=869129&utm_source=marketplace&utm_medium=website&utm_campaign=aaPanel',
    text: 'aaPanel',
  },
  {
    to:
      '/linodes/create?type=One-Click&appID=595742&utm_source=marketplace&utm_medium=website&utm_campaign=cPanel',
    text: 'cPanel',
  },
  {
    to:
      '/linodes/create?type=One-Click&appID=691621&utm_source=marketplace&utm_medium=website&utm_campaign=Cloudron',
    text: 'Cloudron',
  },
  {
    to:
      '/linodes/create?type=One-Click&appID=593835&utm_source=marketplace&utm_medium=website&utm_campaign=Plesk',
    text: 'Plesk',
  },
  {
    to:
      '/linodes/create?type=One-Click&appID=985372&utm_source=marketplace&utm_medium=website&utm_campaign=Joomla',
    text: 'Joomla',
  },
];

const getOnLinkClick = (label: string) => {
  return () =>
    sendEvent({
      ...linkGAEventTemplate,
      label,
    });
};

interface AppLinkProps {
  to: string;
  text: string;
}

const AppLink = (props: AppLinkProps) => {
  const { to, text } = props;
  const classes = useStyles();
  return (
    <Link onClick={getOnLinkClick(text)} to={to} className={classes.appLink}>
      {text}
      <div className={classes.appLinkIcon}>
        <PointerIcon />
      </div>
    </Link>
  );
};

const appLinks = appsLinkData.map((linkData) => (
  <AppLink {...linkData} key={linkData.to} />
));

const AppsSection = () => {
  const classes = useStyles();

  return <div className={classes.appSection}>{appLinks}</div>;
};

export default AppsSection;
