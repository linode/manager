import * as copy from 'copy-to-clipboard';
import * as React from 'react';
import BucketBreadcrumbIcon from 'src/assets/icons/bucketBreadcrumb.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { useWindowDimensions } from 'src/hooks/useWindowDimensions';
import { prefixArrayToString } from '../utilities';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    '& .hover': {
      // @todo: What to show here?
    },
    cursor: 'pointer'
  },
  prefixWrapper: {
    marginLeft: theme.spacing(2),
    display: 'flex',
    overflow: 'scroll',
    whiteSpace: 'nowrap'
  },
  slash: {
    marginRight: 4,
    marginLeft: 4
  },
  link: {
    color: theme.palette.primary.main,
    cursor: 'pointer'
  }
}));

interface Props {
  prefix: string;
  history: any;
  bucketName: string;
}

type CombinedProps = Props;

const BucketBreadcrumb: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { prefix, bucketName, history } = props;
  const { width } = useWindowDimensions();

  const prefixArray = prefix.split('/').filter(section => section !== '');

  // This is not a very elegant way to truncate the prefix. In the future we
  // could take into account both the length of the prefix string AND the prefix
  // array (the number of sections).
  const shouldTruncatePrefix =
    (width <= 600 && prefixArray.length >= 3) || prefixArray.length > 5;

  return (
    <div className={classes.root}>
      <BucketBreadcrumbIcon
        className={classes.icon}
        onClick={() => copy(prefix)}
      />
      <div className={classes.prefixWrapper}>
        <Typography variant="body1" className={classes.slash}>
          /
        </Typography>
        <Typography
          variant="body1"
          className={classes.link}
          onClick={() => {
            history.push({ search: '?prefix=' });
          }}
        >
          {bucketName}
        </Typography>
        {shouldTruncatePrefix && (
          <Typography variant="body1">/ ... </Typography>
        )}
        {prefixArray.map((prefixSection, idx) => {
          if (shouldTruncatePrefix && idx < prefixArray.length - 3) {
            return null;
          }
          return (
            <React.Fragment key={idx}>
              <Typography variant="body1" className={classes.slash}>
                /
              </Typography>
              <Typography
                variant="body1"
                className={classes.link}
                onClick={() => {
                  // If clicking the last crumb, don't do anything (we're
                  // already on the correct level).
                  if (idx === prefixArray.length - 1) {
                    return;
                  }

                  const prefixString = prefixArrayToString(prefixArray, idx);
                  history.push({ search: '?prefix=' + prefixString });
                }}
              >
                {prefixSection}
              </Typography>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(BucketBreadcrumb);
