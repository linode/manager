import * as classNames from 'classnames';
import * as React from 'react';

import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';

import styled from 'src/containers/SummaryPanels.styles';

const useStyles = makeStyles((theme: Theme) => ({
  ...styled(theme),
  balance: {
    display: 'flex',
    justifyContent: 'space-between'
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
  showNegativeAsCredit?: boolean;
  textColor?: boolean;
}

export type CombinedProps = Props;

export const BillingSection: React.FC<CombinedProps> = props => {
  const { balance, credit, header, showNegativeAsCredit, textColor } = props;
  const classes = useStyles();

  /**
   * There's a bit of opposite day going on here:
   * As far as the API is concerned, balance due and credit available
   * are both positive. Negative balance is possible and indicates an
   * account credit. However, when displaying to the user, we want
   * to show a positive credit as negative (with green coloring),
   * but a negative balance also as negative (with green coloring).
   *
   * `value` calculated below is exactly the amount we will show to the user;
   * whether that counts as youOweMoney (red) or youDon'tOweMoney (green)
   * is determined by the `isPositive` calculation.
   */
  const value = balance || (credit && -credit) || 0;
  const isPositive = balance ? balance < 0 : credit ? credit > 0 : true;

  return (
    <>
      <div
        className={`${classes.section} ${classes.balance}`}
        data-qa-current-balance
      >
        <Typography>
          <strong>{header}</strong>
        </Typography>
        <Typography
          component={'span'}
          className={classNames({
            [classes.negative]: !isPositive && textColor !== false,
            [classes.positive]: isPositive && textColor !== false
          })}
        >
          <Currency quantity={value} />
          {showNegativeAsCredit && value < 0 && ` (credit)`}
        </Typography>
      </div>
    </>
  );
};

export default BillingSection;
