import * as classNames from 'classnames';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import useStyles from './styles';

export interface Props {
  title: string;
  details?: string | number;
  hideBorder?: boolean;
}

export const DisplaySection: React.FC<Props> = (props) => {
  const { title, details, hideBorder } = props;
  const classes = useStyles();
  return (
    <div
      className={classNames({
        [classes.checkoutSection]: true,
        [classes.noBorder]: hideBorder,
      })}
    >
      {title && (
        <Typography variant="h3" data-qa-subheading={title}>
          {title}
        </Typography>
      )}
      {details && (
        <Typography
          component="span"
          data-qa-details={details}
          className={classes.detail}
        >
          {details}
        </Typography>
      )}
    </div>
  );
};

export default React.memo(DisplaySection);
