# Search

Search is a parser written with [Peggy](https://peggyjs.org) that takes a human readable search query and transforms it into a [Linode API v4 filter](https://techdocs.akamai.com/linode-api/reference/filtering-and-sorting).

The goal of this package is to provide a shared utility that enables a powerful, scalable, and consistent search experience throughout Akamai Connected Cloud Manager.

## Example

### Search Query
```
label: my-volume and size >= 20
```
### Resulting `X-Filter`
```json
{
  "+and": [
    {
      "label": {
        "+contains": "my-volume"
      }
    },
    {
      "size": {
        "+gte": 20
      }
    }
  ]
}
```

## Supported Operations

| Operation | Aliases        | Example                        | Description                                                                                |
|-----------|----------------|--------------------------------|--------------------------------------------------------------------------------------------|
| `and`     | `&`, `&&`, ` ` | `label: prod and size > 20`    | Performs a boolean *and* on two expressions  (whitespace is interpreted as "and")          |
| `or`      | `\|`, `\|\|`   | `label: prod or size > 20`     | Performs a boolean *or* on two expressions                                                 |
| `>`       | None           | `size > 20`                    | Greater than                                                                               |
| `<`       | None           | `size < 20`                    | Less than                                                                                  |
| `>=`      | None           | `size >= 20`                   | Great than or equal to                                                                     |
| `<=`      | None           | `size <= 20`                   | Less than or equal to                                                                      |
| `!=`       | None          | `size != 1024`                 | Not equal to (does not work as a *not* for boolean expressions. Only works as "not equal") |
| `=`       | None           | `label = my-linode-1`          | Equal to                                                                                   |
| `:`       | `~`            | `label: my-linode`             | Contains                                                                                   |
