import * as classNames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { WithStyles } from '@material-ui/core/styles';
import {
  createStyles,
  Theme,
  withStyles
} from 'src/components/core/styles';

type ClassNames = 'link' | 'noCount' | 'count' | 'countNumber';

interface Props {
  text: string;
  link: string;
  count?: number;
  external?: boolean;
  className?: any;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const styles = (theme: Theme) =>
  createStyles({
  link: {
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  noCount: {
    marginLeft: theme.spacing(1)
  },
  count: {
    marginRight: theme.spacing(1) / 2
  },
  countNumber: {
    fontFamily: theme.font.bold
  }
});

const ViewAllLink: React.StatelessComponent<CombinedProps> = props => {
  const { classes, count, text, link, external, className } = props;
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
              [classes.noCount]: !count
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
            [classes.noCount]: !count
          })}
          data-qa-view-all-link
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
