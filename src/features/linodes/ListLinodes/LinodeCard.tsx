import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { pathOr } from 'ramda';
import * as copy from 'copy-to-clipboard';

import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Button from 'material-ui/Button';
import Card, { CardHeader, CardContent, CardActions } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import ContentCopyIcon from 'material-ui-icons/ContentCopy';

import CallToAction from 'material-ui-icons/CallToAction';
import Replay from 'material-ui-icons/Replay';

import ActionMenu from 'src/components/ActionMenu';
import Tag from 'src/components/Tag';
import RegionIndicator from './RegionIndicator';
import { typeLabelLong } from './presentation';
import { actions } from './menuActions';

import Arch from 'src/assets/distros/Arch.png';
import CentOS from 'src/assets/distros/CentOS.png';
import ContainerLinux from 'src/assets/distros/ContainerLinux.png';
import Debian from 'src/assets/distros/Debian.png';
import Fedora from 'src/assets/distros/Fedora.png';
import Gentoo from 'src/assets/distros/Gentoo.png';
import OpenSUSE from 'src/assets/distros/OpenSUSE.png';
import Slackware from 'src/assets/distros/Slackware.png';
import Ubuntu from 'src/assets/distros/Ubuntu.png';

const distroIcons = {
  Arch,
  CentOS,
  CoreOS: ContainerLinux,
  Debian,
  Fedora,
  Gentoo,
  openSUSE: OpenSUSE,
  Slackware,
  Ubuntu,
};

type CSSClasses = 
  'cardSection'
  | 'distroIcon'
  | 'rightMargin'
  | 'regionIndicator'
  | 'flagImg'
  | 'cardActions'
  | 'button'
  | 'consoleButton'
  | 'rebootButton';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => ({
  cardSection: {
    marginTop: theme.spacing.unit * 2,
  },
  distroIcon: {
    marginTop: theme.spacing.unit,
    width: theme.spacing.unit * 3,
  },
  rightMargin: {
    marginRight: theme.spacing.unit,
  },
  regionIndicator: {
    alignItems: 'center',
  },
  flagImg: {
    marginRight: theme.spacing.unit,
  },
  cardActions: {
    backgroundColor: '#f9f9f9',
    padding: 0,
  },
  button: {
    height: '100%',
    margin: 0,
  },
  consoleButton: {
    width: '60%',
    borderColor: 'rgba(0, 0, 0, 0.12)',
    border: '1px solid',
    borderWidth: '0 1px 0 0',
  },
  rebootButton: {
    width: '40%',
  },
});

interface Props {
  linode: Linode.Linode;
  image: Linode.Image;
  type: Linode.LinodeType;
}

class LinodeCard extends React.Component<Props & WithStyles<CSSClasses> > {
  render() {
    const { classes, linode, image, type } = this.props;

    /**
     * @todo Until tags are implemented we're using the group as a faux tag.
     * */
    const tags = [linode.group].filter(Boolean);

    return (
      <Grid item xs={12} sm={6} lg={4} xl={3}>
        <Card>
          <CardHeader
            title={linode.label}
            action={
              <ActionMenu actions={actions} />
            }
          />
          {<Divider />}
          <CardContent>
            <div>
              {tags.map((tag: string, idx) => <Tag key={idx} label={tag} />)}
            </div>
            <div className={classes.cardSection}>
              <Grid container>
                <Grid item className="tac" xs={2}>
                  <img src={distroIcons[image.vendor]} className={classes.distroIcon}/>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="subheading">
                    {image.label}
                  </Typography>
                  <Typography>
                    {typeLabelLong(type.memory, type.disk, type.vcpus)}
                  </Typography>
                </Grid>
              </Grid>
            </div>
            <div className={classes.cardSection}>
              <div>
                <Typography variant="body2">
                  <span className={classes.rightMargin}>{linode.ipv4[0]}</span>
                  <ContentCopyIcon
                    className="copyIcon"
                    onClick={() => copy(linode.ipv4[0])}
                  />
                </Typography>
              </div>
              <div>
                <Typography>
                  <span className={classes.rightMargin}>{linode.ipv6}</span>
                  <ContentCopyIcon
                    className="copyIcon"
                    onClick={() => copy(linode.ipv6)}
                  />
                </Typography>
              </div>
            </div>
            <div className={classes.cardSection}>
              <RegionIndicator region={linode.region} />
            </div>
          </CardContent>
          <Divider />
          <CardActions className={classes.cardActions}>
            <Button className={`${classes.button} ${classes.consoleButton}`}>
              <CallToAction className={classes.rightMargin}/>
              Launch Console
            </Button>
            <Button className={`${classes.button} ${classes.rebootButton}`}>
              <Replay className={classes.rightMargin}/>
              Reboot
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  }
}

const mapStateToProps = (state: Linode.AppState, ownProps: Props) => {
  const typesCollection = pathOr([], ['api', 'linodeTypes', 'data'], state);
  const imagesCollection = pathOr([], ['api', 'images', 'data'], state);
  const { type, image } = ownProps.linode as Linode.Linode;

  return {
    image: imagesCollection.find((i: Linode.Image) => i.id === image),
    type: typesCollection.find((t: Linode.LinodeType) => t.id === type),
  };
};

export default compose<Linode.TodoAny, Linode.TodoAny, Linode.TodoAny>(
  connect(mapStateToProps),
  withStyles(styles, { withTheme: true }),
)(LinodeCard);
