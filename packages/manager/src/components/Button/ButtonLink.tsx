import * as classNames from 'classnames';
import * as React from 'react';
import ButtonBase from 'src/components/core/ButtonBase';
import Typography from 'src/components/core/Typography';

export interface Props {
  link: string;
  linkText: string;
  secondary?: boolean;
  className?: string;
}

type CombinedProps = Props;

const ButtonLink: React.StatelessComponent<CombinedProps> = props => {
  const { link, linkText, secondary, className } = props;

  return (
    <React.Fragment>
      <ButtonBase
        href={link}
        component="a"
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
    </React.Fragment>
  );
};

export default ButtonLink;
