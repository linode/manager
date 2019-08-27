import * as classNames from 'classnames';
import * as React from 'react';

import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';

import styled from 'src/containers/SummaryPanels.styles';

const useStyles = makeStyles((theme: Theme) => ({
  ...styled(theme),
  label: {
    [theme.breakpoints.only('sm')]: {
      minWidth: 150
    }
  },
  results: {
    marginLeft: theme.spacing(1),
    textAlign: 'right'
  },
  balance: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      justifyContent: 'space-between'
    }
  },
  positive: {
    color: theme.color.green
  },
  negative: {
    color: theme.color.red
  },
  expired: {
    color: theme.color.red
  }
}));

interface Props {
  header: string;
  balance?: number;
  credit?: number;
  textColor?: boolean;
}

export type CombinedProps = Props;

export const BillingSection: React.FC<CombinedProps> = props => {
  const { balance, credit, header, textColor } = props;
  const classes = useStyles();

  const value = Math.abs(balance || credit || 0);
  const isPositive = balance ? balance < 0 : credit ? credit > 0 : true;
  return (
    <>
      <div className={`${classes.section} ${classes.balance}`}>
        <Typography className={classes.label}>
          <strong>{header}</strong>
        </Typography>
        <Typography
          component={'span'}
          className={classNames({
            [classes.results]: true,
            [classes.negative]: !isPositive && textColor !== false,
            [classes.positive]: isPositive && textColor !== false
          })}
        >
          {/** Show credits in parenthesis for users that can't see the color coding */}
          {isPositive && value > 0 ? (
            <>
              {'('}
              <Currency quantity={value} />
              {')'}
            </>
          ) : (
            <Currency quantity={value} />
          )}
        </Typography>
      </div>
    </>
  );
};

export default BillingSection;
