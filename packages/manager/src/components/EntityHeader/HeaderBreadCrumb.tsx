import * as React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EntityIcon, { Variant } from 'src/components/EntityIcon';

export interface BreadCrumbProps {
  title: string;
  iconType: Variant;
  parentLink?: string;
  parentText?: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  headerWithLink: {
    position: 'relative',
    backgroundColor: theme.bg.lightBlue,
    marginRight: theme.spacing(2),
    padding: `5px ${theme.spacing()}px`,
    '&:before': {
      content: '""',
      position: 'absolute',
      left: '100%',
      top: 0,
      width: 15,
      height: '50%',
      background: `linear-gradient(to right top, ${theme.bg.lightBlue} 0%, ${theme.bg.lightBlue} 50%, transparent 46.1%)`,
      zIndex: 1
    },
    '&:after': {
      content: '""',
      position: 'absolute',
      left: '100%',
      bottom: 0,
      width: 15,
      height: '50%',
      background: `linear-gradient(to right bottom, ${theme.bg.lightBlue} 0%, ${theme.bg.lightBlue} 50%, transparent 46.1%)`,
      zIndex: 1
    }
  },
  border: {
    borderTop: '1px solid #f4f5f6',
    height: '50%',
    width: theme.spacing(4),
    position: 'absolute',
    top: 6.5,
    right: -theme.spacing() - 4,
    transform: 'rotate(61.5deg)',
    zIndex: 1,

    '&:before': {
      content: '""',
      borderTop: '1px solid #f4f5f6',
      height: '50%',
      width: theme.spacing(4),
      bottom: theme.spacing(0.5),
      right: -19.5,
      position: 'absolute',
      transform: 'rotate(56.75deg)'
    }
  },
  parentLinkText: {
    color: theme.color.blue,
    paddingLeft: 16
  },
  parentTitleText: {
    color: '#3683dc',
    paddingLeft: 15,
    paddingRight: 24
  },
  titleText: {
    paddingRight: theme.spacing(2) - 2
  }
}));

export const HeaderBreadCrumb: React.FC<BreadCrumbProps> = props => {
  const { iconType, parentLink, parentText, title } = props;
  const classes = useStyles();

  if (parentLink) {
    return (
      <>
        <div className={`${classes.headerWithLink} flexCenter`}>
          <EntityIcon variant={iconType} />
          <Link to={parentLink}>
            <Typography variant="h2" className={classes.parentLinkText}>
              {parentText}
            </Typography>
          </Link>
        </div>

        <div className={classes.border} />
        <Typography variant="h2" className={classes.parentTitleText}>
          {title}
        </Typography>
      </>
    );
  }
  return (
    <>
      <EntityIcon variant={iconType} />
      <Typography variant="h2" className={classes.titleText}>
        {title}s
      </Typography>
    </>
  );
};

export default React.memo(HeaderBreadCrumb);
