import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import * as copy from 'copy-to-clipboard';
import { pathOr } from 'ramda';

import {
  withStyles,
  Theme,
  StyledComponentProps,
  StyleRules,
} from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';
import ContentCopyIcon from 'material-ui-icons/ContentCopy';

import us from 'flag-icon-css/flags/4x3/us.svg';
import de from 'flag-icon-css/flags/4x3/de.svg';
import gb from 'flag-icon-css/flags/4x3/gb.svg';
import sg from 'flag-icon-css/flags/4x3/sg.svg';
import jp from 'flag-icon-css/flags/4x3/jp.svg';

import { AppState } from 'src/store';
import TagComponent from 'src/components/TagComponent';

const flagMap = { us, de, gb, sg, jp };

const styles = (theme: Theme): StyleRules => ({
  copyIcon: {
    height: '0.8125rem',
    width: '0.8125rem',
    cursor: 'pointer',
  },
  inlineItems: {
    lineHeight: '30px',
    verticalAlign: 'middle',
    display: 'inline-flex',
    margin: '0 3px',
  },
});

function titlecase(string: string): string {
  return `${string.substr(0, 1).toUpperCase()}${string.substr(1)}`;
}

function formatRegion(region: string) {
  const [countryCode, area] = region.split('-');
  return `${countryCode.toUpperCase()} ${titlecase(area)}`;
}

interface Props extends StyledComponentProps<'copyIcon' | 'inlineItems'> {
  linode?: Linode.Linode;
  type?: Linode.LinodeType;
  image?: Linode.Image;
}

interface DefaultProps {
  linode: {};
  type: {};
  image: {};
  classes: {};
}

type PropsWithDefaults = Props & DefaultProps;

const img = (region: string) => {
  const abb = region.substr(0, 2);
  return flagMap[abb];
};

function clip(value: string): void {
  copy(value);
}

function displayLabel(memory?: number, label?: string): string | undefined {
  if (!label || !memory) { return; }
  return `${label}, Linode ${memory / 1024}G`;
}

class LinodeRow extends React.Component<Props> {
  static defaultProps = {
    classes: {},
    linode: {},
  };

  render() {
    const { classes, linode, type, image } = this.props as PropsWithDefaults;
    const label = displayLabel(type.memory, image.label);

    /**
     * @todo We're implementing faux tags utilizing the linode.group.
    */
    const tags = [linode.group].filter(Boolean);

    return (
      <TableRow key={linode.id}>
        <TableCell>
          <div>
            <div>
              <Link to={`/linodes/${linode.id}`}>
                <Typography variant="title">
                  {linode.label}
                </Typography>
              </Link>
            </div>
            {label && <div>{label}</div>}
          </div>
        </TableCell>
        <TableCell>
          {tags.map((v: string, idx) => <TagComponent key={idx} label={v} />)}
        </TableCell>
        <TableCell>
          <div>
            <div className={classes.inlineItems}>
              <ContentCopyIcon
                className={classes.copyIcon}
                onClick={() => clip(linode.ipv6)}
              />
            </div>
            <div className={classes.inlineItems}>
              {linode.ipv4}
            </div>
          </div>
          <div>
            <div className={classes.inlineItems}>
              <ContentCopyIcon
                className={classes.copyIcon}
                onClick={() => clip(linode.ipv6)}
              />
            </div>
            <div className={classes.inlineItems}>
              {linode.ipv6}
            </div>
          </div>

        </TableCell>
        <TableCell>
          <img
            className={classes.inlineItems}
            src={img(linode.region)} height="15" width="20" role="presentation"
          />
          <Typography
            className={classes.inlineItems}
            variant="body2">{formatRegion(linode.region)}</Typography>
        </TableCell>
        <TableCell>

        </TableCell>
      </TableRow >
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const typesCollection = pathOr([], ['api', 'linodeTypes', 'data'], state);
  const imagesCollection = pathOr([], ['api', 'images', 'data'], state);
  const { type, image } = ownProps.linode as Linode.Linode;

  return {
    image: imagesCollection.find((i: Linode.Image) => i.id === image),
    type: typesCollection.find((t: Linode.LinodeType) => t.id === type),
  };
};

export default compose(
  connect(mapStateToProps),
  withStyles(styles, { withTheme: true }),
)(LinodeRow);
