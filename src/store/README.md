# Cloud Manager State Management

# The Problem
The API's current state requires that we have context of all entities for grouping by tags and searching efficiently. Additionally, due to the interdependent nature of these entities we often need the context of other entities for search, display, and other organizational efforts.

# The Plan
- Create a centralized and serializable data store.
- Create a pattern for updating the store in response to external event.
- Create a pattern for making asynchronous requests to the API and updating the store with the results.

### Centralized Data Store
Redux already exists in the project. If you're unfamiliar with it, or the Flux architecture, I recommend the following;

#### Redux Primer
[Flux | Application Architecture for Building User Interfaces](https://facebook.github.io/flux/)
[Core Concepts · Redux](https://redux.js.org/introduction/core-concepts)

[**Actions · Redux**](https://redux.js.org/basics/actions)
> Actions are payloads of information that send data from your application to your store. They are the only source of information for the store. You send them to the store using store.dispatch().

[**Reducers** · Redux](https://redux.js.org/basics/reducers)
> Reducers specify how the application's state changes in response to actions sent to the store. Remember that actions only describe what happened, but don't describe how the application's state changes.

[**Middleware · Redux**](https://redux.js.org/advanced/middleware)
> It provides a third-party extension point between dispatching an action, and the moment it reaches the reducer. People use Redux middleware for logging, crash reporting, talking to an asynchronous API, routing, and more.

[**Action Creator · Redux**](https://redux.js.org/recipes/reducing-boilerplate#action-creators)
> Action creators are functions which return a Redux action.

### Updating in response to [Events](https://developers.linode.com/api/v4#operation/getEvents)
The Manager project is constantly injesting a stream of [events](https://developers.linode.com/api/v4#operation/getEvents) from the API. These events signal actions that have happened or are currently happening to an entity.

Anytime the application receives an event from the API  we dispatch the `ADD_EVENTS` action with those events [\[source\]](events/events.reducer.ts#L226). The events middleware is comprised of entity specific functions which follow a reducer pattern.

For example [linodes.events.ts](linodes/linodes.events.ts). This file reduces the API provided event to a Redux action which is dispatched. That dispatched action is what will impact the store, not the API event directly.

### Pattern for Asynchronous Requests
The pattern is to wrap our asynchronous requests in [Thunks>(https://github.com/reduxjs/redux-thunk). A Thunk is a dispatchable request that has the context to the data store and the ability to dispatch other actions. The request cycle looks something like this;
    1. A component dispatches a Thunk action creator.
    2. redux-thunk middleware intercepts the action and invokes the body of the function with dispatch and getStore arguments.
    3. redux-thunk returns the value returned from the Thunk, which should be a Promise so the consumers can await its response.

This system requires the asynchronous Thunk and synchronous actions. So we start by using `typescript-fsa` to generate our async action.

```ts
const actionCreator = actionCreatorFactory(`@@manager/linodes`);

type Request = { page: number; page_size: number; filter?: any };

type Response = Linode.ResourcePage<Linode.Linode[]>;

type Error = Linode.ApiFieldError[];

const getLinodesPageActions = actionCreator.async<Request, Response, Error>(`get-page`);
```

When then create our Thunk and dispatch those actions at the appropriate times.

```ts
const getLinodesPage = (params: GetLinodesRequest) => async (dispatch, getStore) => {
  const { started, done, failed }  = getLinodesPageActions;

  try {
    /** Await the request **/
    const paginatedResponse = await _getLinodes(params);

    /** Dispatch the resulting data and the original params. **/
    dispatch(done({ result: paginatedResponse, params }));

    /** Return the resolution, allowing consumers to await. **/
    return paginatedResponse;
  } catch(error) {
    /** Dispatch the error, including the original request params. **/
    dispatch(failed({ error, params }));

    /** Return the resolution, allowing the consumers to awai. **/
    return error;
  }
};
```

This pattern is so common, we've created an abstraction for it called createRequestThunk. It requires the actions object created by `typescrip-fsa`, and function that maps the params to an asynchronous request.
```ts
export const getLinodesPage = createRequestThunk(
  getLinodesPageActions,
  ({ page, page_size, filter }) => _getLinodes({ page, page_size }, filter),
);
```

Now, when we need to get a page of Linodes;
```ts
/* Example only! Use reselect. */
import { connect } from 'react-redux';
import {getLinodesPage} from 'src/store/linodes/linodes.request';

const MyComponent = ({ getLinodesPage }) => {
  const onClick = () => getLinodesPage({page: 1, page_size: 25, filter: { region: 'us-east' }});

  return (<button onClick={onClick}>Get Linodes!</button>);
};

export default connect(undefined, { getLinodesPage })(MyComponent);

```

#### Thunks, Actions, and Boilerplate


# FAQ


**Why do reducers not include all start, done, and fail actions?**

The current model is to update the data store when the request has completed. In the future, if needed, we could optimistically update the store using the start action, then update it with the done, or reset with the failed.


**How do I deal with loading state at the component level?**

Each slice of entity state has a loading property and lastUpdated (default 0). Given a loading of true and a lastUpdated of 0 we know this is the first time we've loaded this data. Given a loading of true and a lastUpdated greater than 0, we know this is a refresh.

tldr: initialLoad = loading && lastUpdated == 0, refresh = loading && lastUpdated > 0

Contrived example assuming an initial Redux state of `{ linodes: [] }`  for your pleasure;
```jsx
/**
 * The state shape is an example, not actual. Additionally we should be using reselect selectors to
 * select the data we need efficiently.
 */

import { connect } from 'react-redux';
import { updateLinode } from 'src/store/linodes/linodes.request';

class MyComponent extends Component {
  state = {
    loading: false,
    error: undefined,
  }

  onClick = () => {
    this.setState({ loading: true });
    try {
      await getLinodesPage({page: 1, page_size: 25, filter: { region: 'us-east' }});
      this.setState({ loading: false });
    } catch(error) {
      this.setState({ error, loading: false });
    }
  };

  render(){
      return (
      <div>
        <button onClick={this.onClick}>Get Linodes!</button>
        { error && <span>{error}</span>}
        { loading && <LoadingBar />}
        { !loading && (
          <table>
          {
            linodes.map(linode => (
              <tr>
                <td>{linode.label}</td>
              </tr>
            ))
          }
        </table>
        ) }
      </div>
    );
  }
};

const mapState = state => ({ linodes: state.linodes });

const mapDispatch = { getLinodesPage }

export default connect(mapState, mapDispatch)(MyComponent);

```
Note we **did not** reference the returned data in `result`. Although `redux-thunk` does supply it, it's best practice to reference the data from the store. It's entirely possible we just return an empty promise in the future to discourage mounting returned data to local state.

This example is not our actual state. Our actual state includes loading and error alongside the data. So this usecase is unrealistic. A realisic example would be an update event where you would display an indicator of progress await the update.

* Actions are just messages.
* Developers can send messages.
* Middleware receive those message and decide to send other messages.
* Reducers receive messaged.
