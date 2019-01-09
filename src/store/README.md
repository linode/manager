# Cloud Manager State Management

# The Problem
The API's current state requires that we have context of all entities for grouping by tags and
searching efficiently. Additionally, due to the interdependent nature of these entities we often
need the context of other entities for search, display, and other organizational efforst.

# The Plan
- Create a centralized and serializable data store.
- Create a pattern for updating the store in response to external event.
- Create a pattern for making asynchronous requests to the API and updating the store with the results.

### Centralized Data Store
Redux already exists in the project. If you're unfamiliar with it, or the Flux architecture, I recommend
the following;

#### Redux Primer
[Flux | Application Architecture for Building User Interfaces](https://facebook.github.io/flux/)
[Core Concepts · Redux](https://redux.js.org/introduction/core-concepts)

[**Actions · Redux**](https://redux.js.org/basics/actions)
> Actions are payloads of information that send data from your application to your store. They are
the only source of information for the store. You send them to the store using store.dispatch().

[**Reducers** · Redux](https://redux.js.org/basics/reducers)
> Reducers specify how the application's state changes in response to actions sent to the store.
Remember that actions only describe what happened, but don't describe how the application's state changes.

[**Middleware · Redux**](https://redux.js.org/advanced/middleware)
> It provides a third-party extension point between dispatching an action, and the moment it reaches
the reducer. People use Redux middleware for logging, crash reporting, talking to an asynchronous API,
routing, and more.

[**Action Creator · Redux**](https://redux.js.org/recipes/reducing-boilerplate#action-creators)
> Action creators are functions which return a Redux action.

### Updating in response to [Events](https://developers.linode.com/api/v4#operation/getEvents)
The Manager project is constantly injesting a stream of [events](https://developers.linode.com/api/v4#operation/getEvents)
from the API. These events signal actions that have happened or are currently happening to an
entity. Anytime the application receives an event from the API  we dispatch the `ADD_EVENTS` action
with those events [\[source\]](events/events.reducer.ts#L226). The events middleware is
comprised of entity specific functions which follow a reducer pattern. For example
[linodes.events.ts](linodes/linodes.events.ts). This file reduces the API provided event
to a Redux action which is dispatched. That dispatched action is what will impact the store, not the
API event directly.

### Pattern for Asynchronous Requests
The pattern is for initiating and responding to asynchronous requests is straightforward;
1. A Redux "request" action is dispatched.
2. The [request.middleware.ts](request/request.middleware.ts) intercepts the action.
    1. The using the payload and meta data we create an AxiosRequestConfig.
    2. Dispatch the "started" action associated with this request with the params used to make the request.
    3. Make the network request.
    4. On success dispatch the "done" action with the resulting data and the params used to make the request.
    5. On failure dispatch the "failed" action with the resulting error and the params used to make the request.
    6. The request cycle is complete and the "request action" is discarded (never dispatched).
3. Reducers respond to the the "started", "done", and "failed" actions updating state as necessary. For
example; The [linodes.reducer.ts](linodes/linodes.reducer.ts) is setup to respond to the
"start", "done" and "failed".

#### Actions and Action Creators
You may have noticed in the preceeding section that we made mention of four actions per request-cycle.
This is necesssay due to the sychronous nature of Reducers and asynchronous nature of Middleware. To
alleviate some of this boilerplate we've created [requestActionCreatorFactory](request/request.helpers.ts#L102).

The requestActionCreatorFactory will create type-safe action creators for started, done, failed and request.
requestActionCreatorFactory is an abstraction of [actionCreatorFactory](https://github.com/aikoven/typescript-fsa/blob/master/src/index.ts#L154) and `createMeta`.
These two functions combined produce the common shapes required to handle the entire request cycle.
To generate the action creators, simply provide the type, action, and configuration object for the request.
The results will be;

For example, to create a action creators to get a Linode;

```ts
  type RequestParams = { id: number };
  type Response = Linode.Linode
  type Error = Linode.ApiFieldError[];

  export const getLinode = requestActionCreator(
      `linode`,
      `get-one`,
      { method: 'GET', endpoint: (params: RequestParams) => `/linodes/${params.id}` },
  );
```

if we were to write that out it would look like...
```ts
  type RequestParams = { id: number };
  type Response = Linode.Linode
  type Error = Linode.ApiFieldError[];
  type SuccessType = { result: Response; params: RequestParams };
  type FailType = { error: Error; params: RequestParams };

  const type: `@@manager/linode/get-one`;

  const started: (payload: RequestParams) => ({
    type: `${type}_STARTED`,
    payload: { id: payload.id }
  });

  const done: (payload: SuccessType) => ({
    type: `${type}_DONE`,
    payload,
  });

  const failed: (payload: FailType) => ({
    type: `${type}_FAILED`,
    isError: true,
    payload,
  });

  const request: (payload: RequestParams) => ({
    type: `${type}`,
    payload,
    meta: {
      __request: {
        method: 'GET',
        endpoint: (params: RequestParams) => `/linodes/${params.id}`,
        actions: [started, done, failed],
      },
    },
  });

  export const getLinode = { type, started, done, failed, request };
```


# FAQ
1. Why do reducers not include all start, done, and fail actions?
> The current model is to update the data store when the request has completed. In the future, if
needed, we could optimistically update the store using the start action, then update it with the
done, or reset with the failed.

2. How do I deal with loading state at the component level?
> Each slice of entity state has a loading property and lastUpdated (default 0). Given a loading of
true and a lastUpdated of 0 we know this is the first time we've loaded this data. Given a loading of
true and a lastUpdated greater than 0, we know this is a refresh.
tldr: initialLoad = loading && lastUpdated == 0, refresh = loading && lastUpdated > 0

In the event of an update, such as updating the Label of a Linode, we can await the dispatch of the
request action.
```ts
// ...
updateLabel = async () => {
  const { linodeId } = this.props;
  const { updatedLabel } = this.state;

  this.setState({ loading: true });

try{
    const result = await this.props.updateLinode({ id: linodeId, label: updatedLabel});
    this.setState({ loading: false });
  } catch(e) {
    this.setState({ loading: false });
  }
}
// ...
```
Note we **did not** reference the returned data in `result`. Although request.middleware.ts does supply it, it's
best practice to reference the data from the store. It's entirely possible we just return an empty promise
in the future to discourage mounting returned data to local state.

```ts
/* Example only! Use reselect. */
const connected = connect(
  (state, ownProps) => state.__resources.linodes.find(id => ownProps.linodeId),
  { updateLinode },
);
```

* Actions are just messages.
* Middleware sends messages.
* Reducers receive messaged.
