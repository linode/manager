import { Notice, Typography } from '@linode/ui';
import Button from '@mui/material/Button';
import * as React from 'react';

import { Link } from 'src/components/Link';

import { useStyles } from './Tile.styles';

type onClickFn = (
  e: React.KeyboardEvent<HTMLElement> | React.MouseEvent<HTMLElement>
) => void;

export interface TileProps {
  /**
   * Optional classes to be applied to the root div element.
   */
  className?: string;
  /**
   * A string to display in the title section of the Tile.
   */
  description?: string;
  /**
   * A string to display in an error notice above the title.
   */
  errorText?: string;
  /**
   * An SVG to display at the top of the Tile,
   */
  icon?: JSX.Element;
  /**
   * A url to send the user to if they click on the Tile.
   */
  link?: onClickFn | string;
  /**
   * A string to display in the title section of the Tile.
   */
  title: string;
}

export const Tile = (props: TileProps) => {
  const { className, description, errorText, icon, link, title } = props;
  const { classes, cx } = useStyles();

  const renderLink = () => {
    if (typeof link === 'function') {
      return (
        <Button
          className={cx({
            [classes.buttonTitle]: true,
          })}
          onClick={link}
        >
          {title}
        </Button>
      );
    } else if (link) {
      return (
        <Link className="black tile-link" to={link}>
          {title}
        </Link>
      );
    } else {
      return null;
    }
  };

  return (
    <div
      className={cx(
        {
          [classes.card]: true,
          [classes.clickableTile]: link !== undefined,
        },
        className
      )}
      data-qa-tile={title}
      onClick={typeof link === 'function' ? link : undefined}
      onKeyDown={typeof link === 'function' ? link : undefined}
      role="link"
      tabIndex={0}
    >
      {icon ? (
        <span className={classes.icon} data-qa-tile-icon>
          {icon}
        </span>
      ) : null}
      {errorText ? <Notice text={errorText} variant="error" /> : null}
      <Typography className={classes.tileTitle} data-qa-tile-title variant="h3">
        {link ? renderLink() : title}
      </Typography>
      {description ? (
        <Typography align="center" data-qa-tile-desc variant="body1">
          {description}
        </Typography>
      ) : null}
    </div>
  );
};
