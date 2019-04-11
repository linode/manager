# Code Style

This document aims to give general guidelines of how code is written and structured in the Cloud Manager project.

## Writing a React Component

When it comes to writing a React component, there are some clear optimizations you should be making
to your code.

As a rule, if you're writing a class component and do not intend on writing any `shouldComponentUpdate` logic yourself, write a PureComponent

```js
/** Good */
class MyComponent extends React.PureComponent<MyProps> {}

...

/** Also good */
import { equals } from 'ramda'

class MyComponent extends React.Component<MyProps> {
  shouldComponentUpdate(prevProps: MyProps) {
    if(equals(prevProps, this.props)) {
      return true;
    }
    return false;
  }
}
```

```js
/** Worse */
class MyComponent extends React.Component<MyProps> {}
```

Function components have their place, but in this project we recommend you don't use them unless
you plan on memoizing the component. In fact, [function components are treated as Classes under the hood in React](https://twitter.com/dan_abramov/status/755343749983657986?lang=en), so really, you don't gain much by writing a function component versus a Class.

```js
/** Okay */
const MyComponent: React.FC<MyProps> = (props) => ()

/** Much Better */
const MyComponent: React.FC<MyProps> = (props) => ()

/** this is what we need to export */
const EnhancedComponent = React.memo(MyComponent);
```

## Testing Memoized components
Testing memoized components is little tricky, since they dont return JSX wehn shallow rendered, but instead return an object. This means when you try

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

That should cover how to effectively smoke test React.memo components

## Avoiding instance methods that could be made into components.
Everytime an instance of a component is created so are all the instance methods, just like
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
DataComponent, we dont have to worry about if there's no data or an empty array, we can just work
with what we're provided!

## Abstraction

Abstracting code is a great way to not repeat yourself and keep the code DRY. It's not a huge deal if you need to repeat some code twice, but more than that, whatever logic you write should be abstracted into either it's own file or outside of the Class/function. Here are some hard, fast rules when it comes to abstracting:

1. Any functions that are inside a React Class/function that don't rely on state or props should be abstracted out

```js
/** Bad */
class MyComponent extends React.PureComponent<MyProps> {
  /** no reason for this to be attached to the Class */
  filterOutNumbers = (arrayOfNumbers: number[]) => {
    return arrayOfNumbers.filter(eachNumber => eachNumber > 10)
  }

  return <div />
}

/** Good */
class MyComponent extends React.PureComponent<MyProps> {
  return <div />
}

/** this can now be unit tested seperately */
const filterOutNumbers = (arrayOfNumbers: number[]) => {
  return arrayOfNumbers.filter(eachNumber => eachNumber > 10)
}
```

2. Any logic that is being duplicated or even used more than twice should live in it's own file (ideally in the `/utilities` dir)

```js
/** Bad */
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


```js
/** Good */
import { capitalizeAllWords } from 'src/utilities/word-formatting-utils'

class MyComponent extends React.PureComponent<MyProps> {
  return (
    <h1>{capitalizeAllWords(this.props.title)}</h1>
    <p>{capitalizeAllWords(this.props.subtitle)}</p>
  )
}
```

3. Try your best to abstract even componets imported from external libraries

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

```js
/** Good */
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';

/** Bad */
import { Observable } from 'rxjs/Rx';
```
Additionally we order imports alphabetically within certain blocks. The blocks are;
```js
/** Third Party Libs */
import * as React from 'react';

/** Material UI Imports */
import { WithStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

/** Source Components */
import { getLinodes } from 'src/services/linodes';

/** Relative Imports */
import something from '../some/where/nearby';
```

## Other Things

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