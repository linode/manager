# Linode API - Redux Configuration Files

The files in this `generic` directory export configuration objects which are
used to generate all of the Redux entities for a given API endpoint:

* **Action Types**, the strings which name a type of state modification
* **Actions**, the objects which contain state and are dispatched to modify
it
* **Action Creators**, the functions which are called to return Actions that
are dispatched
* **Thunk Action Creators**, the functions which are called which return
functions that execute the Redux context and also act as Action
Creators
* **Reducers**, the pure functions which return a new state for each Action
that is dispatched

The result is an api interface that allows us to make calls like following,
without having to write any of the above "by-hand".

`dispatch(api.linodes.disks.post(data, linode.id))`

## Format of the `config` object

The configuration object must contain some information about the endpoint,
and possibly some "sub-endpoints". What we call the `config` object here is
a plain JavaScript object which can contain the following keys.

### `name: string` (required)

This is the name given to the resource on the resulting `api.` action
generator interface and in the `.api` branch of the Redux state. For a root
resource, this should be the same name as the module filename. For
subresources, should be the same name as the state subkey (without the
underscore). However the name can be arbitrary. It is reccomended that the
name match the first portion of the API endpoint path with which it is
associated. It is also reccomended that if the endpoint supports `ALL` (see
`supports`) then this name be plural, otherwise it should be singular.

#### **Examples**

* For a root endpoint

    name: 'linodes'

The resulting interface:

    // the name 'linodes' here comes strictly from the filename and NOT
    // the 'name'
    dispatch(api.linodes.all());
    dispatch(api.linodes.one([linodeId]));
    dispatch(api.linodes.page(2));
    dispatch(api.linodes.put(data, linodeId));
    dispatch(api.linodes.delete(linodeId));

    state.api.linodes;
    // the 'name' only affects the second 'linodes' here, the name of the
    // linodes collection
    state.api.linodes.linodes[linodeId];

* For a subresource

    name: 'configs'

The resulting interface:

    // 'configs' here DOES come from the name!
    api.linodes.configs.all([linodeId])
    // note that for all/page/one we pass an array of ids, the "path" to the resource
    api.linodes.configs.one([linodeId, configId]);
    api.linodes.configs.page(2, [linodeId]);
    // for post/put/delete we pass the "path" ids as separate arguments
    api.linodes.configs.post(data, linodeId, configId);

    // note that the path to a subresource in state is prefixed with the object's key
    state.api.linodes.linodes[linodeId]._configs.configs
    state.api.linodes.linodes[linodeId]._configs.configs[configId]


### `endpoint : function(id?: string): string` (required)

A function which returns a path to the resource, relative to the root of the
API server. If the resource has both a path for collections and individual
resources, then this function takes at least one argument, which is used as
the resource key in the returned path, to denote the individual resource. If the
function has this argument, then the function will be called internally with
that argument as an empty string in some cases, expecting the resulting path
to respond with collections. The paths must begin with a single `/`
character, but can end with or without a `/`. For subresources, this function
takes at least one argument, which are the id(s) of the parent resources
necessary to construct the path to the individual resource.

#### **Examples**:

For an endpoint that does not have a path to individual resources:

    endpoint: () => '/account/settings'

The resulting interface:

    dispatch(api.account.one());
    dispatch(api.account.put(data);

    state.api.account

For an endpoint that does have a path to individual resources:

    endpoint: id => `/domains/${id}`

The resulting interface:

    // This uses the endpoint with an empty string passed for the 'id' param
    dispatch(api.domains.all());
    // This uses the endpoint with 'domainId' passed for the the 'id' param
    dispatch(api.domains.one([domainId]));
    // This also uses the endpoint with 'domainId' passed for the 'id' param
    dispatch(api.domains.put(data, domainId));

    // all domains (object keyed by domainId)
    state.api.domains
    // a single domain
    state.api.domains.domains[domainId]

For a subresource:

    endpoint: (id, nbConfigId, nodeId) => {
        return `/nodebalancers/${id}/configs/${nbConfigId}/nodes/${nodeId}`;
    },

The resulting interface

    // Note that we need a "path" array of parent resource ids to indicate
    // which collection of nodes we want
    dispatch(api.nodebalancers.configs.nodes.all([nodebalId, configId]));
    dispatch(api.nodebalancers.configs.nodes.one([nodebalId, configId, nodeId]));
    // For put/post/delete calls, this path is provided as separate arguments
    dispatch(api.nodebalancers.configs.nodes.delete(nodebalId, configId, nodeId));

    // all nodebalancer nodes (object keyed by nodeId)
    state.api.nodebalancers.nodebalancers(nodebalId)._configs.configs(configId)._nodes.nodes
    // a single nodebalancer node
    state.api.nodebalancers.nodebalancers(nodebalId)._configs.configs(configId)._nodes.nodes(nodeId)

### `supports : Array<string>` (required)

An array indicating the types of action creators that should be generated
for this endpoint. These are one of `ONE`, `MANY`, `DELETE`, `PUT`, `POST`,
which are constants that can be imported from `api/internal.js`. `ONE`
indicates that the endpoint supports `GET` requests that will respond with
data for a single resource. `MANY` indicates that the endpoint supports
paginated get requests that will respond with a collection of objects. 
`DELTETE`, `PUT`, and `POST` indicate the endpoint supports those HTTP
methods respectively.

Note that the inclusion of `MANY` makes the endpoint a "plural" endpoint, and
changes the semantics of the `ONE` action creator! If the endpoint does not include
`MANY`, then the `.one` action creator stores the object data directly on the
branch of the Redux state tree for that resource. For example, `profile`:

    supports: [ONE, PUT]

The following call

    dispatch(api.profile.one())

Stores the profile data directly on

    api.state.profile

Whereas, `invoices` has the following supported action creators:

    supports: [ONE, MANY]

The following call

    dispatch(api.invoices.one([invoiceId]))

Will store the invoice at the following location

    api.invoices.invoices[invoiceId]

Note that the inclusion of `MANY` will add both the `.all` action creator
and the `.page` action creator.

Example for top level resource `linodes`:

    supports: [ONE, MANY, PUT, DELETE, POST]

    dispatch(api.linodes.one([linodeId]));
    dispatch(api.linodes.all());
    dispatch(api.linodes.page(2));
    dispatch(api.linodes.put(data, linodeId));
    dispatch(api.linodes.delete(linodeId));
    dispatch(api.linodes.post(data));

Example for a subresource `nodebalancers.configs.nodes`:

    supports: [ONE, MANY, PUT, POST, DELETE]

    dispatch(api.nodebalancers.configs.nodes.one([nodebalId, configId, nodeId]));
    dispatch(api.nodebalancers.configs.nodes.all([nodebalId, configId]));
    dispatch(api.nodebalancers.configs.nodes.page(0, [nodebalId, configId]));
    dispatch(api.linodes.put(data, nodebalId, configId, nodeId));
    dispatch(api.linodes.delete(data, nodebalId, configId, nodeId));
    dispatch(api.linodes.post(data, nodebalId, configId));

### `primaryKey : string` (required)

This is the property name of a given resource to use as the key for storage in
the Redux store. It must be a property that uniquely identifies the resource.
Examples:

For `linodes`

    primaryKey: id

Object stored in the Redux store

    state.api.linodes.linodes(linodeId)

For `users`

    primaryKey: username

Object stored in the Redux store

    state.api.users.users(username)

### `sortFn : function(ids : Array<string>, state) : Array<string>` (optional)

A function used to sort the ids which are placed in the `ids` array in the
Redux store. This ids array can be used to iterate over the objects in the
primary store, which are keyed by those ids. This function takes the current
list of `ids`, and the current `state` for the resource, and must return a
sorted list of ids. It's reccomended to use `Array.prototype.sort` on the ids
array.

Example, for `events`:

    sortFn: function (ids, state) {
        return ids.sort(function (a, b) {
        const aDate = new Date(state[a].created);
        const bDate = new Date(state[b].created);

        if (aDate > bDate) {
            return -1;
        }

        if (aDate < bDate) {
            return 1;
        }

        return 0;
        });
    },