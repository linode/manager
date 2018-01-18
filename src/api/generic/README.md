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
actually the object passed to genConfig. This is a plain object which can
contain the following keys.

### `name: string` (required)

This

### `endpoint : function(id?: string): string` (required)

A function which returns a path to the resource, relative to the root of the
API server. If the resource has both a path for collections and individual
entities, then this function takes one argument, which must be used as the
entity key used in the returned path to denote the individual entity. If the
function has this argument, then the function will be called internally
with that argument as an empty string in some cases, expecting the resulting
path to respond with collections. The paths must begin with a single `/`
character, but can end with or without a `/`.

#### **Examples**:

For an endpoint that does not have a path to individual entities:

    endpoint: () => '/account/settings',

For an endpoint that does have a path to individual entities:

    endpoint: id => `/domains/${id}`,