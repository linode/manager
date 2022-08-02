import classNames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';

interface Props {
  text: string;
  link: string;
  count?: number;
  external?: boolean;
  className?: any;
}

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  noCount: {
    marginLeft: theme.spacing(1),
  },
  count: {
    marginRight: theme.spacing(1) / 2,
  },
  countNumber: {
    fontFamily: theme.font.bold,
  },
}));

const ViewAllLink = (props: Props) => {
  const { count, text, link, external, className } = props;
  const classes = useStyles();
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
          to={link}
          className={classNames(
            {
              [classes.link]: true,
              [classes.noCount]: !count,
            },
            className
          )}
          data-qa-view-all-link
        >
          {text}
        </Link>
      ) : (
        <a
          href={link}
          className={classNames({
            [classes.link]: true,
            [classes.noCount]: !count,
          })}
          data-qa-view-all-link
          target="_blank"
          aria-describedby="external-site"
          rel="noopener noreferrer"
        >
          {text}
        </a>
      )}
    </>
  );
};

export default ViewAllLink;
