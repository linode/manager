# Code Conventions

This document aims to give general guidelines of how code is written and structured in the Cloud Manager project.

## Writing a React Component

At this point in the project, we prefer the use of function components using hooks
for state management. It is not necessary to rewrite existing class components as function components,
and it is still fine to write a class component if that works better for your situation.

### Function Component

```js
export const Component: React.FC<Props> = (props) => {
  const [count, setCount] = React.useState < number > 0;

  return <div>{count}</div>;
};

export default React.memo(Component);
```

You should include React.memo() as in the example if you think the component will be included
in larger layouts where frequent re-renders are common. Note also that we generally export
the "raw" component (`export const Component...`) as well as the "wrapped" component (`export default React.memo(Component)`). This is often helpful for testing, when you don't want to
test the containers, wrappers, HOCs, or whatever that the base component is using.

When using the component in the app, import the default export:

```js
import Component from "./src/Component";
```

### Class Component

```js
export class Component extends React.Component<CombinedProps, State> {
  state: State = {
    count: 0,
  };

  render() {
    return <div>{count}</div>;
  }
}

export default Component;
```

Default and raw exports are the same as in function components. If you want the equivalent
of `React.memo`, use a PureComponent:

```js
export class Component extends React.PureComponent<CombinedProps, State> {
  ...
```

### When things get complicated

Even with hooks, we still have components that require multiple wrappers (HOCs).
To combine multiple HOCs into a single wrapper, we use a helper called `compose` from
the `recompose` library. (This is a functional programming concept called function
composition, hence the name).

```js
import { compose } from 'recompose';

interface Props {...}

type CombinedProps = Props & HOC1Props & HOC2Props & HOC3Props;

export const RawComponent: React.FC<CombinedProps> = props => {
  ...
}

const enhanced = compose<CombinedProps, Props>(
  hoc1,
  hoc2,
  hoc3
);

export default enhanced(RawComponent);

```

Most HOCs pass extra props to the raw component; when using Redux's `connect`, for example,
the data you select from the Redux store is available as props in the connected component.
`CombinedProps` is our convention for the final set of props that a component
will have once it is wrapped in all its HOCs. Note that the component itself is typed
as expecting `CombinedProps`, and the `compose` function generally takes `<CombinedProps, Props>`.
This is backward from intuition (a holdover from functional programming), but tells TypeScript
that what is being passed into `compose` is a component that expects `Props` and what comes
out the other end of `compose` is a component that has `CombinedProps`.

## Styling

As with everything else in React-world, MUI's styling solution now supports hooks.
We prefer this pattern as it is terser, makes testing easier, and avoids cluttering up the component
tree with `withStyles(Component)`.

```js
import { makeStyles, Theme } from "src/components/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  message: {
    fontSize: "16px",
    color: theme.color.red,
  },
}));
```

Inside the component, access these classes by calling `useStyles()`:

```js
const Component: React.FC<{}> = (props) => {
  const classes = useStyles();

  return <div className={classes.message}>A message for you</div>;
};
```

- Styles for light mode are located in `packages/manager/src/themeFactory.ts`
- Styles for dark mode are located in `packages/manager/src/themes.ts`
- Utility classes (based off of [Tailwind CSS](https://tailwindcss.com) naming conventions) are located in `packages/manager/src/index.css`

## Avoid instance methods that could be made into components.

Before

```js
class MyComponent extends Component {
  renderContent = () => {
    const { error, loading, data } = this.props;

    if (error) {
      return this.renderError();
    }

    if (loading) {
      return this.renderLoading();
    }

    if (!data || data.length === 0) {
      return this.renderEmptyState();
    }

    return this.renderData();
  };

  render() {
    <div>{this.renderContent()}</div>;
  }
}
```

After

```js
const MyComponent = (props) => {
  const { loading, error, data } = props;

  return (
    <div>
      <ComponentContent loading={loading} error={error} data={data}/>
    </div>
  );
}

const ComponentContent = (props) => {
  const { loading, error, data } = props;

  if (error) {
    return <ErrorComponent error={error}>
  }

  if (loading) {
    return <LoadingComponent />
  }

  if (!data || data.length === 0) {
    return <EmptyStateComponent >
  }

  return <DataComponent data={data} />
}

const ErrorContent = (props) => {
  const { error } = props;
  return (...);
}

const LoadingComponent = (props) => {
  return (...);
}

const EmptyStateComponent = (props) => {
  return (...);
}

const DataComponent = (props) => {
  const { data } = props;
  return (...);
}
```

## Abstraction

Abstracting code is a great way to not repeat yourself and keep the code DRY. It's not a huge deal if you need to repeat some code twice, but more than that, whatever logic you write should be abstracted into either it's own file or outside of the Class/function. Here are some hard, fast rules when it comes to abstracting:

1. Any functions that are inside a React Class/function that don't rely on state or props should be abstracted out

Bad

```js
class MyComponent extends React.PureComponent<MyProps> {
  /** no reason for this to be attached to the Class */
  filterOutNumbers = (arrayOfNumbers: number[]) => {
    return arrayOfNumbers.filter(eachNumber => eachNumber > 10)
  }

  return <div />
}
```

Good

```js
class MyComponent extends React.PureComponent<MyProps> {
  return <div />
}

/** this can now be unit tested separately */
const filterOutNumbers = (arrayOfNumbers: number[]) => {
  return arrayOfNumbers.filter(eachNumber => eachNumber > 10)
}
```

2. Any logic that is being duplicated or even used more than twice should live in its own file (ideally in the `/utilities` dir)

Bad

```js
class MyComponent extends React.PureComponent<MyProps> {
  return (
    <h1>
    {
      this.props.title
        .split(' ')
        .map(capitalize)
        .join(' ')
    }
    </h1>
    <p>
    {
      this.props.subtitle
        .split(' ')
        .map(capitalize)
        .join(' ')
    }
    </p>
  )
}
```

Good

```js
import { capitalizeAllWords } from 'src/utilities/word-formatting-utils'

class MyComponent extends React.PureComponent<MyProps> {
  return (
    <h1>{capitalizeAllWords(this.props.title)}</h1>
    <p>{capitalizeAllWords(this.props.subtitle)}</p>
  )
}
```

3. Try your best to abstract even components imported from external libraries

We're creating abstractions of all external components, even if that's just an immediate exporting
of the component `export { default } from '@material-ui/core'`. We're doing this for the following
reasons:

- Provides a common entry point where can make site-wide changes to the components structure or functionality.
- Allows us control of the API we consume, regardless of where the component comes from.
- The wrapper component allows us to respond to naming/file structure changes made by the
  component authors.

## Importing and Structuring Dependencies

As a rule, always use absolute paths for module imports. Something that looks similar to

```js
import MyComponent from "src/components/MyComponent";
```

is much better than

```js
import MyComponent from "../../../MyComponent";
```

This project relies on a number of third-party dependencies. It is important that when importing those
dependencies you import only the necessary files. For example, if I needed to create an Observable
using RxJS I would import only Observable and the type of Observable I want to create. This keeps bundle
size down substantially.

Bad

```js
import { Observable } from "rxjs/Rx";
```

Good

```js
import "rxjs/add/observable/of";
import { Observable } from "rxjs/Observable";
```

## Other Things

### Error Handling

#### API Error arrays

Components making API requests generally want to work with an array of Linode API errors. These have the shape:

`{ field: 'field-name', reason: 'why this error occurred' }`

We have added an interceptor to our Axios instance that essentially guarantees that any
error from an API function will have this shape. For example, if you block network requests
using devtools, there is no response from the API. But if you `.catch()` this error,
you'll find that it has the above shape, with a default message ("An unexpected error occurred.")

This makes it easy to work with errors, but the default message is not very situation specific.
Often, what we want is to use a real error message from the API if it is available, and use
a situation-specific fallback message otherwise. We have a helper in our utilities directory
for this called `getAPIErrorOrDefault`.

```js
import { getAPIErrorOrDefault } from "src/utilities/errorUtils";

apiRequest().catch((error) => {
  const apiError = getAPIErrorOrDefault(
    error, // If this is an array of API field errors, it will be returned unchanged.
    "Your Linode is hopelessly broken.", // If no field errors are present, an array consisting of an error with this reason is returned.
    "linode-id" // Optional. If you want the default field error to have a `field` property, this argument will be used.
  );
});
```

A common pattern is to wrap an API response in this method, then use the first reason as the error
message. This isn't ideal since it's possible multiple errors could be returned from the same
request, but it is used in many places throughout the app.

```js
makeApiRequest()
  .then(doSomethingOnSuccess)
  .catch((errorResponse) => {
    const fallBackMessage = "Oh no, something horrible happened!";
    const errorMessage = getAPIErrorOrDefault(errorResponse, fallbackMessage)[0]
      .reason;
  });
```

Given the setup of our app, `errorMessage` will be a string containing either a legit message
from the API or else the `fallBackMessage` specified.

#### Error Maps

The usual pattern is to map field errors to the appropriate field, showing a generalError for any errors that don't have a field. For example,
a form might have an input for `region`, and that element will display any errors with `{ field: 'region', reason: 'whatever' }` inline. In
some cases, however, we either aren't checking for every possible error field, or we aren't entirely sure what all of the possible fields the
API is considering are. To make sure that we catch these and show them to the user, use the `getErrorMap` helper:

```js
import { getErrorMap } from "src/utilities/errorUtils";

apiRequest().catch((error) => {
  const errorMap = getErrorMap(
    ["label", "region"], // Fields we want to check for
    error
  );
  const labelError = errorMap.label;
  const regionError = errorMap.region;
  const generalError = errorMap.none;
});
```

`errorMap` will be an object with one key for each of the fields we specified, and a `none` key that captures any errors (the first
one it finds) that don't match the provided fields:

```js
console.log(errorMap);
{
  label: 'a label error',
  region: 'a region error',
  none: 'a linode_id error or similar'
}
```

### Paginating Things

#### Paginating Data Sourced From Redux

To make sure the data you need is available, you can use the `useReduxLoad` hook:

```js
import { useReduxLoad } from 'src/hooks/useReduxLoad';

...

// _loading will be true until Images and Volumes have been requested
const { _loading } = useReduxLoad(['images', 'volumes']);

```

```js
import { APIError } from "@linode/api-v4/lib/types";
import { Volume } from "@linode/api-v4/lib/volumes";
import { connect } from "react-redux";

interface ReduxStateProps {
  loading: boolean;
  error?: APIError[];
  data: Volume[];
}

const MyComponent: React.FC<ReduxStateProps> = (props) => {
  return <div />;
};

const mapStateToProps: MapStateToProps<
  /* props that this HOC returns */
  ReduxStateProps,
  /* other props this HOC is inheriting */
  {},
  /* global redux state */
  ApplicationState
> = (state) => ({
  loading: state.__resources.volumes.loading,
  error: state.__resources.volumes.error,
  volumes: state.__resources.volumes.items,
});

export default connected(mapStateToProps)(MyComponent);
```

Next, we need to leverage the `<Paginate />` render props Component, which has built-in pagination logic, so you don't have to worry about the heavy lifting

```js
const MyComponent: React.FC<ReduxStateProps> = (props) => {
  return (
    <Paginate data={data} pageSize={25}>
      {({
        data: paginatedData,
        count,
        handlePageChange,
        handlePageSizeChange,
        page,
        pageSize,
      }) => <div />}
    </Paginate>
  );
};
```

The last piece is the `<PaginationFooter />` component:

```js
const MyComponent: React.FC<ReduxStateProps> = (props) => {
  return (
    <Paginate data={data} pageSize={25}>
      {({
        data: paginatedData,
        count,
        handlePageChange,
        handlePageSizeChange,
        page,
        pageSize,
      }) => (
        <React.Fragment>
          <Table aria-label="List of your Volumes">
            <TableHeader>My Volumes</TableHeader>
            <TableBody>
              {paginatedData.map((eachVolume) => {
                return (
                  <TableRow>
                    <TableCell>{eachVolume.label}</TableCell>
                    <TableCell>{eachVolume.size}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <PaginationFooter
            count={count}
            page={page}
            pageSize={pageSize}
            handlePageChange={handlePageChange}
            handleSizeChange={handlePageSizeChange}
          />
        </React.Fragment>
      )}
    </Paginate>
  );
};
```

#### Paginating Data Using API Pagination

WIP; we now have mostly retired `<Pagey>` and use `src/hooks/usePagination` along with React Query to
create a similar workflow to Redux based pagination.

### Toasts

Showing messaging to users is a complex task that varies depending on whether an action is immediate or scheduled to happen sometime in the future. For all actions where we cannot predict their completion time,
we use toasts or snackbar messages.

We're leveraging [notistack](https://github.com/iamhosseindhv/notistack) for all toasts, which is
an abstracted HOC built upon material-ui's Snackbar. All [MUI's props](https://material-ui.com/demos/snackbars/) can be applied to the Snackbar as well.

An example of how to use a Toast is as follows:

```js
import React from "react";

import { InjectedNotistackProps, withSnackbar } from "notistack";

interface Props extends InjectedNotistackProps {
  /**
   * props here
   */
}

export const Example: React.FC<Props> = (props) => {
  const handleClick = () => {
    props.enqueueSnackbar("this is a toast notification", {
      onClick: () => alert("you clicked the toast!"),
    });
  };

  return <div onClick={handleClick}>Click Me</div>;
};

export default withSnackbar(Example);
```

There is also a hook version that can be used in function components:

```js
import { useSnackbar} from 'notistack';

...

const { enqueueSnackBar } = useSnackbar();
```
