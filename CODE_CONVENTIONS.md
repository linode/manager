# Code Conventions

This document aims to give general guidelines of how code is written and structured in the Cloud Manager project.

## Writing a React Component

When it comes to writing a React component, there are some clear optimizations you should be making
to your code.

As a rule, if you're writing a class component and do not intend on writing any `shouldComponentUpdate` logic yourself, write a PureComponent. PureComponents implement a shallow comparison of props and state by default
so this should encourage you to pass down props and use state that is flat and doesn't need any deep checking.

NOTE: PureComponent only offers benefits when passed props that will respect a strict equality check (`===`).
In other cases, most commonly passing a Lambda function as a prop,
PureComponent will actually be slower, since the component will always fail the `shouldComponentUpdate` logic,
resulting in two comparisons instead of one.

Good
```js
class MyComponent extends React.PureComponent<MyProps> {}
```

Also good
```js
import { equals } from 'ramda'

class MyComponent extends React.Component<MyProps> {
  shouldComponentUpdate(prevProps: MyProps) {
    if(equals(prevProps, this.props)) {
      return false;
    }
    return true;
  }
}
```

Worse
```js
class MyComponent extends React.Component<MyProps> {}
```

Worst
```js
class MyComponent extends React.PureComponent<Props> {
  render (
    <div>{this.props.doTheThing()}</div>
  )
}

<MyComponent doTheThing={() => Math.random()} />
```

Function components have their place, but please keep in mind [function components are treated as Classes under the hood in React](https://twitter.com/dan_abramov/status/755343749983657986?lang=en), so really, you're not getting any performance boost from writing a function component versus a class.

That being, said with the [introduction of hooks](https://reactjs.org/docs/hooks-intro.html), function components have become a lot more valuable, so you may find yourself writing them more often than you would a PureComponent. With that in mind, nearly all function components should be memoized with the invocation of `React.memo()` in order to gain the same benefit that PureComponents do.

Like PureComponents, function components wrapped in `React.memo()` have a shallow prop and state comparison implemented by default. You can also create your own update conditions as the second argument passed to `React.memo()`

Okay
```js
const MyComponent: React.FC<MyProps> = (props) => ()
```

Much better
```js
const MyComponent: React.FC<MyProps> = (props) => ()

/** this is what we need to export */
const EnhancedComponent = React.memo(MyComponent);
```

With custom update conditions
```js
import { equals } from 'ramda'

const MyComponent: React.FC<MyProps> = (props) => ()

/*
 return true if passing nextProps to render would return
 the same result as passing prevProps to render,
 otherwise return false
*/
const areEqual = (prevProps: MyProps, nextProps: MyProps) => {
  return equals(prevProps, nexProps)
}

/** this is what we need to export */
const EnhancedComponent = React.memo(MyComponent, areEqual);
```

## Testing Memoized components
Testing memoized components is little tricky, since they dont return JSX when shallow rendered, but instead return an object. This means when you try

```js
const MyChildComponent = React.memo(props => {
  return <div />
});

const MyComponent = React.memo(props => {
  return <MyChildComponent />
});

const Component = shallow(<MyComponent />); // fails here

expect(Component.find('MyChildComponent'))
```

You end up with an error like this in your test

```
Invariant Violation: ReactShallowRenderer render(): Shallow rendering works only with
custom components, but the provided element type was `object`.
```

Instead, try something like this

```js
const MyChildComponent = React.memo(props => {
  return <div />
});

const MyComponent = props => {
  return <MyChildComponent />
};

export default React.memo(MyComponent);

const Component = shallow(<MyComponent />); // all systems go

expect(Component.find('MyChildComponent')); // wait - it's still failing here
```

Now you'll be able to correctly shallow render the component and still be able to leverage
memoization; however, the smoke test still fails? Why?

Well, if you `console.log(Component.debug())`, you'll see something like this

```js
<[object Object] />
```

Now we're running into the issue where our component doesn't have a display name. Our current
solution is to implement solution that mimics our end-to-end tests

```js
const MyChildComponent = React.memo(props => {
  return <div />
});

const MyComponent = props => {
  return <MyChildComponent data-qa-child-component />
};

export default React.memo(MyComponent);

const Component = shallow(<MyComponent />); // all systems go

expect(Component.find('[data-qa-child-component]')); // our test is passing!!! woooo
```

## Avoiding instance methods that could be made into components.
Every time an instance of a component is created so are all the instance methods, just like
renderContent in the following code. So this takes more CPU to create, more memory to store, and
more CPU to tear down. This code smells because theres a function invocation that has no arguments.
That screams side-effects. To correct this we simply extract the functionality into a new component
passing the props as necessary.

Before
```js
class MyComponent extends Component {
  renderContent = () => {
    const { error, loading, data } = this.props;

    if (error) {
      return this.renderError();
    }

    if (loading) {
      return this.renderLoading()
    }

    if (!data || data.length === 0) {
      return this.renderEmptyState()
    }

    return this.renderData();
  }

  render(){
    <div>
      { this.renderContent() }
    </div>
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

So now we have two separate and testable components. We've also done the type checking so inside the
DataComponent, we don't have to worry about if there's no data or an empty array, we can just work
with what we're provided!

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

/** this can now be unit tested seperately */
const filterOutNumbers = (arrayOfNumbers: number[]) => {
  return arrayOfNumbers.filter(eachNumber => eachNumber > 10)
}
```

2. Any logic that is being duplicated or even used more than twice should live in it's own file (ideally in the `/utilities` dir)

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
reasons;
- Provides a common entry point where can make site-wide changes to the components structure or functionality.
- Allows us control of the API we consume, regardless of where the component comes from.
- The wrapper component allows us to respond to naming/file structure changes made by the
component authors.

## Importing and Structuring Dependencies

As a rule, always use absolute paths for module imports. Something that looks similar to

```js
import MyComponent from 'src/components/MyComponent';
```

is much better than

```js
import MyComponent from '../../../MyComponent';
```

This project relies on a number of third-party dependencies. It us important that when importing those
dependencies you import only the necessary files. For example, if I needed to create an Observable
using RxJS I would import only Observable and the type of Observable I want to create. This keeps bundle
size down substantially.

Bad
```js
import { Observable } from 'rxjs/Rx';
```

Good
```js
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
```

## Other Things

### Error Handling

Our application has to work with different types of errors: JavaScript `Error` objects, `AxiosErrors`, and field errors
from the Linode API. To simplify working with these and maintain consistency, we have created several helper methods in `src/utilities/errorUtils`.

# API Error arrays

In most cases, we want components to work with an array of Linode API errors. These have the shape:

`{ field: 'field-name', reason: 'why this error occurred' }`

However, when we make an API request, there is no guarantee that the errors returned will have this shape (if the request fails before
reaching the API, for instance). To make sure that our components have an array of field errors to work with, use `getAPIErrorOrDefault`:

```js
import { getApiErrorOrDefault } from 'src/utilities/errorUtils';

apiRequest()
  .catch(error => {
    const apiError = getApiErrorOrDefault(
      error, // If this is an array of API field errors, it will be returned unchanged.
      'An unexpected error occurred.', // If no field errors are present, an array consisting of an error with this reason is returned.
      'linode-id' // Optional. If you want the default field error to have a `field` property, this argument will be used.
    )
  });
```

#### Error Strings

In some cases, we only want to display a single error message, regardless of how many things went wrong. This is not an ideal pattern,
because some error data is potentially lost and not shown to the user. When it is necessary, however, use the `getErrorStringOrDefault`
helper:

```js
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

apiRequest()
  .catch(error => {
    const errorMessage = getErrorStringOrDefault(
      error, // Whatever this is, the helper will return the reason, or a default message if no reason is found
      'Default message' // Optional; a generic message is displayed if this isn't provided.
    )
  })
```

#### Error Maps

The usual pattern is to map field errors to the appropriate field, showing a generalError for any errors that don't have a field. For example,
a form might have an input for `region`, and that element will display any errors with `{ field: 'region', reason: 'whatever' }` inline. In 
some cases, however, we either aren't checking for every possible error field, or we aren't entirely sure what all of the possible fields the 
API is considering are. To make sure that we catch these and show them to the user, use the `getErrorMap` helper:

```js
import { getErrorMap } from 'src/utilities/errorUtils';

apiRequest()
  .catch(error => {
    const errorMap = getErrorMap(
      ['label', 'region'], // Fields we want to check for
      error
      )
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

The first step to creating a paginated list is asking yourself one question:

Is my data sourced from Redux state or is it being requested on `componentDidMount`?

If your data is being sourced from Redux state, it's safe to assume that the data is being pre-loaded on app mount. But not just some of the data - ALL of the data. A pattern we have adopted is to request every single page of entities for data that we are storing is Redux. Because of this, there is a possibility that there may be more than 100 items in the slice of Redux state. Which leads us to the first solution

#### Paginating Data Sourced From Redux

The first step in paginating things from Redux is to source the data

```js
import { APIError } from 'linode-js-sdk/lib/types'
import { Volume } from 'linode-js-sdk/lib/volumes'
import { connect } from 'react-redux'

interface ReduxStateProps {
  loading: boolean;
  error?: APIError[];
  data: Volume[];
}

const MyComponent: React.FC<ReduxStateProps> = (props) => {
  return (
    <div />
  )
}

const mapStateToProps: MapStateToProps<
  /* props that this HOC returns */
  ReduxStateProps,
  /* other props this HOC is inheriting */
  {},
  /* global redux state */
  ApplicationState
> = state => ({
  loading: state.__resources.volumes.loading,
  error: state.__resources.volumes.error,
  volumes: state.__resources.volumes.items
});

export default connected(mapStateToProps)(MyComponent)
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
        pageSize
      }) => (
        <div />
      )}
    </Paginate>
  )
}
```

Now we see that we have access to all the data, the current page, the page size, and helper functions to change page and page size.

Finally, lets put it all together now with our `<PaginationFooter />` component

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
        pageSize
      }) => (
        <React.Fragment>
          <Table aria-label="List of your Volumes">
            <TableHeader>My Volumes</TableHeader>
            <TableBody>
              {
                (paginatedData.map(eachVolumes => {
                  return (
                    <TableRow>
                      <TableCell>{eachVolume.label}</TableCell>
                      <TableCell>{eachVolume.size}</TableCell>
                    </TableRow>
                  )
                }))
              }
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
  )
}
```

And that is how you paginate data sourced from Redux.

#### Paginating Data requested in `componentDidMount()`

Paginating data this way is similar to the last approach with some differences. In this case, we'll be leveraging the `<Pagey />` higher-order component.

So the first step is to wrap your base component in the HOC and tell Pagey what request you want to fire when the page changes:

```js
import { Pagey, PaginationProps } from 'src/components/Pagey';
import { getInvoices } from 'linode-js-sdk/lib/account'

interface OtherProps {
  someText: string;
}

const MyComponent: React.FC<PaginationProps & OtherProps> = (props) => {
  return <div />
}

const paginated = Pagey((ownProps: OtherProps, params: any, filter: any) => {
  return getInvoices(params, filter)
})

export default paginated(MyComponent)
```

Now we have access to the same props as before. Lets add in the rest of our markup

```js
const MyComponent: React.FC<PaginationProps & OtherProps> = (props) => {

  const {
    data: myInvoices,
    page,
    pageSize,
    loading,
    error,
    count,
    handlePageChange,
    handlePageSizeChange
  } = props;

  return (
    <React.Fragment>
      <Table aria-label="List of your Invoices">
        <TableHeader>My Invoices</TableHeader>
        <TableBody>
          {
            (myInvoices.map(eachInvoice => {
              return (
                <TableRow>
                  <TableCell>{eachInvoice.label}</TableCell>
                  <TableCell>{eachInvoice.amount}</TableCell>
                </TableRow>
              )
            }))
          }
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
  )
}
```

Now, each time you change a page, the appropriate page will be requested. `<Pagey />` also gives you access to a bunch of other props that might help for other tasks you're attempting to accomplish, namely:

| Prop Name | Type | Description
| --------- | ---- | ---------- |
| onDelete  | () => void | Helper function that should be invoked when you're deleting items from the list. This will ensure no redundant requests are made |
| order | 'asc' or 'desc' | What order in which the data is being sorted. |
| handleSearch | (filter?: any) => void | Helper function to re-invoke the base request with new filters |
| searching | boolean | is the handleSeach Promise in-progress |
| handleOrderChange | (sortBy: string, order: 'asc' or 'desc' = 'asc', page: number = 1) => void | Helper function to change the sort and sort order of the base request |
| isSorting | boolean | is the handleOrderChange Promise in-progress |

### Toasts

Showing messaging to users is a complex task that varies depending on whether an action is immidiate or scheduled to happen some n time in the future. For all actions that we cannot predict their completion time,
we use toasts or snackbar messages.

We're leveraging [notistack](https://github.com/iamhosseindhv/notistack) for all toasts, which is
an abstracted HOC built upon material-ui's Snackbar. All [MUI's props](https://material-ui.com/demos/snackbars/) can be applied to the Snackbar as well

An example of how to use a Toast is as follows:

```js
import React from 'react';

import { InjectedNotistackProps, withSnackbar } from 'notistack';

interface Props extends InjectedNotistackProps {
  /**
   * props here
   */
}

export const Example: React.SFC<Props> = props => {
  const handleClick = () => {
    props.enqueueSnackbar('this is a toast notification', {
      onClick: () => alert('you clicked the toast!')
    })
  }

  return (
    <div onClick={handleClick}>
      Click Me
    </div>
  );
};

export default withSnackbar(Example);
```

### Testing Redux Functionality

Most Redux artifacts are basic functions, so actions and reducers can be exported and tested functionally. Many reducers also include asynchronous actions with Thunk,
which generally call API methods from the services library and dispatch multiple actions. Testing these requires more setup:

1. Mock the services library module that is called by the Thunk in question:

  ```js
  jest.mock('../../../services/instances', () => ({
    getInstances: () => Promise.resolve('return value');
  }))
```

2. To verify that the Thunk called the correct method, you will have to mock that specific method (in the example above, the `getInstances` method can't be accessed
  later in your tests).

  ```js
    // Using requireMock makes it semantically clear that this import is not used, and avoids TypeScript issues.
    const requests = require.requireMock('../../../services/instances');

    // (In your tests somewhere)

    requests.getInstances = jest.fn(() => Promise.resolve('return something here'));

    it("calls the right method", () => {
      expect(requests.getInstances).toHaveBeenCalled();
    });
```

3. To actually test the Thunk, you will need to dispatch it, which requires the creation of a mock store:

  ```js
  import configureStore from 'redux-mock-store';
  import ReduxThunk from 'redux-thunk';

  const middlewares = [ReduxThunk];
  const createMockStore = configureStore(middlewares);
  const store = createMockStore({});
  ```

  You can then dispatch your async actions normally:

  ```js
  await store.dispatch(instances.getInstances() as any);
  ```

  The mock store allows you to check the actions dispatched by Thunks:

  ```js
  const actions = store.getActions();
  // [{ type: ACTION_1 }, { type: ACTION_2, payload: some_payload }]
  expect(actions).toEqual([instances.load(), instances.handleError(error)]);
  ```

  It is also helpful to reset the mock store before each request, to keep the actions history clean:

  ```js
  const store = createMockStore({});
  beforeEach(() => {
    jest.resetAllMocks();
    store.clearActions();
  });
  ```