import Axios from 'axios';
import { decode } from 'he';
import { APIError } from 'linode-js-sdk/lib/types';
import { compose, map, pathOr, take } from 'ramda';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ViewAllLink from 'src/components/ViewAllLink';
import { parseString } from 'xml2js';
import DashboardCard from '../DashboardCard';

const parseXMLStringPromise = (str: string) =>
  new Promise((resolve, reject) =>
    parseString(str, (err, result) => (err ? reject(err) : resolve(result)))
  );

type ClassNames = 'root' | 'itemTitle';

const req = Axios.create();

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3),
      borderBottom: `1px solid ${theme.palette.divider}`
    },
    itemTitle: {
      marginBottom: theme.spacing(1)
    }
  });

export interface BlogItem {
  description: string;
  link: string;
  title: string;
}

interface State {
  items: BlogItem[];
  loading: boolean;
  errors?: APIError[];
}

type CombinedProps = WithStyles<ClassNames>;

export class BlogDashboardCard extends React.Component<CombinedProps, State> {
  state: State = {
    items: [],
    loading: true
  };

  mounted: boolean = false;

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;

    req
      .get(`https://linode.com/blog/feed/`, { responseType: 'text' })
      .then(({ data }) => parseXMLStringPromise(data))
      .then(processXMLData)
      .then(
        (items: BlogItem[]) =>
          this.mounted && this.setState({ items, loading: false })
      )
      .catch(
        error =>
          this.mounted &&
          this.setState({
            loading: false,
            errors: [{ reason: 'Unable to parse blog data.' }]
          })
      );
  }

  render() {
    const { items, loading, errors } = this.state;

    if (errors) {
      return null;
    }
    if (loading || !items) {
      return null;
    }

    return (
      <DashboardCard
        title="Blog"
        headerAction={this.renderAction}
        alignHeader="flex-start"
      >
        {items.map(this.renderItem)}
      </DashboardCard>
    );
  }

  renderItem = (item: BlogItem, idx: number) => {
    const { classes } = this.props;

    const cleanedDescription = decode(item.description);
    const cleanedTitle = decode(item.title);

    return (
      <Paper key={idx} className={classes.root}>
        <Typography variant="h3" className={classes.itemTitle}>
          <a
            href={item.link}
            className="blue"
            target="_blank"
            rel="noopener noreferrer"
            data-qa-blog-post
          >
            {cleanedTitle}
          </a>
        </Typography>
        <Typography variant="body1" data-qa-post-desc>
          {cleanedDescription}
        </Typography>
      </Paper>
    );
  };

  renderAction = () => (
    <ViewAllLink
      text="Read More"
      link={'https://linode.com/blog/'}
      data-qa-read-more
      external
    />
  );
}

const processXMLData = compose(
  map((item: any) => ({
    description: item.description[0],
    link: item.link[0],
    title: item.title[0]
  })),
  take(5),
  pathOr([], ['rss', 'channel', 0, 'item'])
);

const styled = withStyles(styles);

export default styled(BlogDashboardCard);
