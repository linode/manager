import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Axios from 'axios';
import { compose, map, pathOr, take } from 'ramda';
import * as React from 'react';
import { parseString } from 'xml2js';
import DashboardCard from '../DashboardCard';

const parseXMLStringPromise = (str: string) => new Promise((resolve, reject) =>
  parseString(str, (err, result) => err ? reject(err) : resolve(result)));

type ClassNames =
  'root' |
  'itemTitle';

const req = Axios.create();

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  itemTitle: {
    marginBottom: theme.spacing.unit,
  },
});

interface Props { }

interface BlogItem {
  description: string;
  link: string;
  title: string;
};

interface State {
  items: BlogItem[];
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class BlogDashboardCard extends React.Component<CombinedProps, State> {
  state: State = {
    items: [],
  };

  componentDidMount() {
    req.get(`https://blog.linode.com/feed/`, { responseType: 'text' })
      .then(({ data }) => parseXMLStringPromise(data))
      .then(processXMLData)
      .then((items: BlogItem[]) => this.setState({ items }))
      .catch((error) => console.error(error))
  }

  render() {
    const { items, errors } = this.state;
    if (!items) { return null; }
    if (errors) { return null; }

    return (
      <DashboardCard
        title="Product News"
        headerAction={this.renderAction}
      >
        {items.map(this.renderItem)}
      </DashboardCard>
    );
  }

  renderItem = (item: BlogItem, idx: number) => {
    const { classes } = this.props;

    return (
      <Paper key={idx} className={classes.root}>
        <Typography variant="subheading" className={classes.itemTitle}>
          <a href={item.link} target="_blank">{item.title}</a>
        </Typography>
        <Typography variant="caption">
          {item.description}
        </Typography>
      </Paper>
    );
  };

  renderAction = () => <a href="https://blog.linode.com/" target="_blank">Read More</a>;
}

const processXMLData = compose(
  map((item: any) => ({
    description: item.description[0],
    link: item.link[0],
    title: item.title[0],
  })),
  take(5),
  pathOr([], ['rss', 'channel', 0, 'item']),
);

const styled = withStyles(styles, { withTheme: true });

export default styled(BlogDashboardCard);
