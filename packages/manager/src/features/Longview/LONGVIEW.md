# Longview

Longview is a monitoring service that allows you to monitor either a Linode service, such as a Linode or NodeBalancer. To get started, [please see the Linode documentation.](https://www.linode.com/docs/platform/longview/longview/)

## Making Requests

Once you have Longview installed on a server, now you can start making requests using both APIv4 and the Longview API. First is the APIv4 interactions.

### Getting your API key from APIv4

Once you have a server and a Longview client created, send a GET request to the API to get the API key for your Longview client. Here's an example curl request:

```
curl --request GET \
  --url https://api.linode.com/v4/longview/clients/230115 \
  --header 'authorization: Bearer 12345'
```

which should return a shape that looks like:

```js
{
  "id": 230115,
  "apps": {
    "nginx": false,
    "apache": false,
    "mysql": false
  },
  "install_code": "1234",
  "created": "2019-10-10T17:16:54",
  "api_key": "1234",
  "updated": "2019-10-11T14:15:25",
  "label": "longview_client"
}
```

Hang on to the `api_key`. We'll need it to make requests to the Longview API.

### Using the Longview API

Here's an example Longview request:

```
curl --request POST \
  --url https://longview.linode.com/fetch \
  --header 'content-type: multipart/form-data; boundary=---011000010111000001101001' \
  --form api_key=1234 \
  --form api_action=batch \
  --form 'api_requestArray=[{ "api_action": "getLatestValue", "keys": [ "Disk.*" ]  }]'
```

We reccommend to keep `--form api_action=batch \` untouched and instead make changes to the `api_requestArray` field to filter down the data. There are a couple configurable fields here that you can change in the `apiRequestArray`:

#### `api_action`
| api_action      |  Description                                                 |
|-----------------|--------------------------------------------------------------|
| getValues       | Gets all data points for the specified key                   |
| getLatestValue  | Gets the latest data point for the specified key             |
| getTopProcesses | Gets all the top processes running on the server             |
| lastUpdated     | Returns a datetime when the Longview stats were last updated |

#### keys

| key       | returned unit  | description                                                                                                                        |
|-----------|----------------|------------------------------------------------------------------------------------------------------------------------------------|
| *         |                | Returns everything. This is _extremely_ slow, so run at your own risk.                                                             |
| Disk.*    | Bytes          | Returns all storage information for each disk. Run `df -h` on the server to compare data.                                          |
| Memory.*  | Kilobytes      | Returns all data for ext4 and swap memory. Run `free` in the terminal to compare data.                                             |
| CPU.*     | Percentage     | Returns usage for all CPUs on the server. Run `top` on the server to compare data                                                  |
| Load.*    | Literal number | Returns the literal number for how much Load is on the system. 1 load === 100% of CPU utilized                                     |
| Network.* | Bytes          | Returns interfaces for inbound and outbound network traffic on the server. Run `apt install -y netload && netload` to compare data |





