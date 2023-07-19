import { Theme } from '@mui/material/styles';
import { WithStyles, createStyles, withStyles } from '@mui/styles';
import classNames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';

type ClassNames = 'count' | 'countNumber' | 'link' | 'noCount';

interface Props {
  className?: any;
  count?: number;
  external?: boolean;
  link: string;
  text: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const styles = (theme: Theme) =>
  createStyles({
    count: {
      marginRight: theme.spacing(0.5),
    },
    countNumber: {
      fontFamily: theme.font.bold,
    },
    link: {
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    noCount: {
      marginLeft: theme.spacing(1),
    },
  });

const ViewAllLink: React.FC<CombinedProps> = (props) => {
  const { className, classes, count, external, link, text } = props;
  return (
    <>
      {count && (
        <span className={classes.count}>
          (
          <span className={classes.countNumber} data-qa-entity-count={count}>
            {count}
          </span>
          )
        </span>
      )}
      {!external ? (
        <Link
          className={classNames(
            {
              [classes.link]: true,
              [classes.noCount]: !count,
            },
            className
          )}
          data-qa-view-all-link
          to={link}
        >
          {text}
        </Link>
      ) : (
        <a
          className={classNames({
            [classes.link]: true,
            [classes.noCount]: !count,
          })}
          aria-describedby="external-site"
          data-qa-view-all-link
          href={link}
          rel="noopener noreferrer"
          target="_blank"
        >
          {text}
        </a>
      )}
    </>
  );
};

const styled = withStyles(styles);

export default styled(ViewAllLink);
