import * as classNames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import ButtonBase from 'src/components/core/ButtonBase';
import Typography from 'src/components/core/Typography';

export interface Props {
  to: string;
  linkText: string;
  secondary?: boolean;
  className?: string;
}

type CombinedProps = Props;

const ButtonLink: React.StatelessComponent<CombinedProps> = props => {
  const { to, linkText, secondary, className } = props;

  return (
    <React.Fragment>
      <Link to={to}>
        <ButtonBase
          component="span"
          className={classNames(className)}
          focusRipple
        >
          <Typography
            variant="button"
            color={secondary ? 'secondary' : 'initial'}
            className="buttonSpan"
          >
            {linkText}
          </Typography>
        </ButtonBase>
      </Link>
    </React.Fragment>
  );
};

export default ButtonLink;
