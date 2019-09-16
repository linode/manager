import FileCopy from '@material-ui/icons/FileCopy';
import * as copy from 'copy-to-clipboard';
import * as React from 'react';
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
    cursor: 'pointer',
    transition: theme.transitions.create(['color', 'background-color']),
    color: theme.color.grey1,
    margin: 0,
    position: 'relative',
    width: 24,
    height: 24,
    padding: 4,
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      backgroundColor: theme.color.grey1,
      color: theme.color.white
    }
  },
  prefixWrapper: {
    marginLeft: theme.spacing(1.5),
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
  },
  copied: {
    fontSize: '.85rem',
    left: -16,
    color: theme.palette.text.primary,
    padding: '6px 8px',
    backgroundColor: theme.color.white,
    position: 'absolute',
    boxShadow: `0 0 5px ${theme.color.boxShadow}`,
    transition: 'opacity .5s ease-in-out',
    animation: '$popUp 200ms ease-in-out forwards'
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

  // Split the prefix into discrete sections for displaying in the component.
  // 'my/path/to/objects/` > ['my', 'path', 'to', 'objects]
  const prefixArray = prefix.split('/').filter(section => section !== '');

  // This is not a very elegant way to truncate the prefix. In the future we
  // could take into account both the length of the prefix string AND the prefix
  // array (the number of sections). @todo: Intelligent breadcrumbs.
  const shouldTruncatePrefix =
    (width <= 600 && prefixArray.length >= 3) || prefixArray.length > 5;

  return (
    <div className={classes.root}>
      {/* {copied && (
        <span className={classes.copied} data-qa-copied>
          copied
        </span>
      )} */}
      <FileCopy className={classes.icon} onClick={() => copy(prefix)} />
      <div className={classes.prefixWrapper}>
        {/* Bucket name */}
        <Typography
          variant="body1"
          className={classes.link}
          onClick={() => {
            history.push({ search: '?prefix=' });
          }}
        >
          {bucketName}
        </Typography>

        {/* Ellipsis (if prefix is truncated) */}
        {shouldTruncatePrefix && (
          <Typography variant="body1" className={classes.slash}>
            / ...
          </Typography>
        )}

        {/* Mapped prefix */}
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
