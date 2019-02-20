import * as classNames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type ClassNames = 'link' | 'noCount' | 'count' | 'countNumber';

interface Props {
  count?: number;
  link: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const styles: StyleRulesCallback<ClassNames> = theme => ({
  link: {
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  noCount: {
    marginLeft: theme.spacing.unit
  },
  count: {
    marginRight: theme.spacing.unit / 2
  },
  countNumber: {
    fontFamily: 'LatoWebBold'
  }
});

const ViewAllLink: React.StatelessComponent<CombinedProps> = props => {
  const { classes, count, link } = props;
  return (
    <>
      {count && (
        <span className={classes.count}>
          (<span className={classes.countNumber}>{count}</span>)
        </span>
      )}
      <Link
        to={link}
        className={classNames({
          [classes.link]: true,
          [classes.noCount]: !count
        })}
      >
        View All
      </Link>
    </>
  );
};

const styled = withStyles(styles);

export default styled(ViewAllLink);
