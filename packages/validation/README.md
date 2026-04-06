# Linode API Validation Schemas

## Usage

This library consists of [Yup](https://github.com/jquense/yup) schemas corresponding to the endpoints of the
[Linode API](https://techdocs.akamai.com/linode-api/reference/api), intended to be used for client-side validation.
They closely (though not exactly) match the validation that is run by the API back-end when a
request is received. They can be used to validate API request payloads manually or to validate forms (for example through
Formik&rsquo;s `validationSchema`). They also work well with the [@linode/api-v4](https://npmjs.com/@linode/api-v4) package.

### Manual Validation

```js
import { CreateLinodeSchema } from '@linode/validation';

const payload = { label: 'My Linode', type: 'g6-standard-1' };
CreateLinodeSchema.validateSync(payload);
// Uncaught: u [ValidationError]: Region is required.
```

### With the @linode/api-v4 package

NOTE: This feature is in development.

```js
import { createLinode } from '@linode/api-v4';
import { CreateLinodeSchema } from '@linode/validation';

const payload = { label: 'My Linode', type: 'g6-standard-1' };
createLinode(payload, { schema: CreateLinodeSchema }).catch((error) => {
  console.log(error);
});

// { field: 'region', reason: 'Region is required.' }
```

## Why is it a separate library?

These schemas were originally included in the @linode/api-v4 package by default, and automatically
applied before any network request was made. This worked well in the early days of Cloud Manager,
especially before @linode/api-v4 was published as a separate package. However, as the project grew,
this setup caused a few problems:

1. Coupling the request handlers and validation schemas meant that it wasn't possible to turn client-side validation off, which isn't a good fit for a public package.
2. The validation doesn't match the API&rsquo;s exactly. There are some things, such as uniqueness, that are
   difficult to validate on the client. There are some additional cases where the validation is too complex, and
   we made a decision to fall back on the backend validation. This was acceptable when the schemas were only used internally by the Cloud
   Manager, but can lead to confusion for external users (in fact it's unlikely that most external users were even aware that validation
   was happening on the client side).
3. The auto-validation meant that we were double-validating in many cases; when using Formik, for example, the same schema is run on form submit, then run again in the JS client.
4. The api-v4 bundle was too big, and the schemas were a big part of it. This is unfortunate especially since not everyone necessarily wants to run client validation.
