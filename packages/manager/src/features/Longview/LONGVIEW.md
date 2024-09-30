# Longview

Longview is a monitoring service that allows you to monitor either a Linode service, such as a Linode or NodeBalancer. To get started, [please see the Linode documentation.](https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-longview)

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

You can also batch datasets with comma-separated keys like so:

```
curl --request POST \
  --url https://longview.linode.com/fetch \
  --header 'content-type: multipart/form-data; boundary=---011000010111000001101001' \
  --form api_key=1234 \
  --form api_action=batch \
  --form 'api_requestArray=[{ "api_action": "getLatestValue", "keys": [ "Disk.*", "Memory.*" ]  }]'
```

We recommend to keep `--form api_action=batch \` untouched and instead make changes to the `api_requestArray` field to filter down the data. There are a couple configurable fields here that you can change in the `apiRequestArray`:

#### `api_action`

| api_action      | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| getValues       | Gets all data points for the specified key                   |
| getLatestValue  | Gets the latest data point for the specified key             |
| getTopProcesses | Gets all the top processes running on the server             |
| lastUpdated     | Returns a datetime when the Longview stats were last updated |

#### `keys`

| key         | Returned Unit      | Description                                                                                                                                      |
| ----------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| \*          |                    | Returns everything. This is _extremely_ slow, so run at your own risk.                                                                           |
| Disk.\*     | Bytes              | Returns all storage information for each disk. Run `df -h` on the server to compare data.                                                        |
| Memory.\*   | Kilobytes          | Returns all data for ext4 and swap memory. Run `free` on the server to compare data.                                                             |
| CPU.\*      | Literal Percentage | Returns usage for all CPUs on the server. Run `top` on the server to compare data                                                                |
| Load.\*     | Literal number     | Returns the literal number for how much Load is on the system. 1 load === 100% of CPU utilized                                                   |
| Network.\*  | Bytes              | Returns interfaces for inbound and outbound network traffic on the server. Run `apt install -y netload && netload` on the server to compare data |
| Packages.\* | Array              | Returns an array of Packages that have available upgrades. This check is performed every 24 hours by the agent                                   |

## Longview Errors and Notifications

Errors or warnings from the Longview API will always have HTTP status code 200, so using response codes to identify an error won't work.
To detect errors/warnings, look in the NOTIFICATIONS array included in every Longview response, which has the following shape:

```
{
  CODE: 10,
  SEVERITY: 1,
  TEXT: "An error message"
}
```

Severity values are interpreted as follows:

- 0: Message
- 1: Slightly more important message
- 2: Warning/non-fatal error
- 3: Fatal error

Within Cloud Manager, we treat notifications of severity 3 as actual errors, and will reject the Promise for any request that returns
one or more notifications of this type. Other notifications are passed through to the app normally and handled by consuming components.

The full list of possible notifications can be found in the Longview server repo and is reproduced in the table below:

| Name            | SEVERITY | CODE | TEXT                                                                                                    |
| --------------- | -------- | ---- | ------------------------------------------------------------------------------------------------------- |
| BADMETHOD       | 3        | 1    | No such method.                                                                                         |
| BADAUTH         | 3        | 4    | Authentication failed.                                                                                  |
| INVALIDPROPERTY | 3        | 7    | Property is invalid.                                                                                    |
| TRANSITION      | 1        | 8    | Your data is currently in a transitional state. Any irregularities will clear up shortly.               |
| THROTTLED       | 3        | 14   | Requests are temporarily throttled for this Longview client. Please try again later.                    |
| MAINTENANCE     | 3        | 23   | Longview is currently under maintenance. Data is temporarily unavailable.                               |
| STORAGEERROR    | 2        | 29   | We've detected a problem with your Longview data. Please contact Support.                               |
| READONLY        | 1        | 30   | Longview is currently in read-only mode. Current data may not be available at this time.                |
| FUTUREDATA      | 1        | 38   | Your system's clock is fast. Please ensure that ntp is installed and running.                           |
| PASTDATA        | 1        | 39   | Your system's clock is slow. Please ensure that ntp is installed and running.                           |
| CLIENTUPDATE    | 0        | 60   | An update for the Longview agent is available. Please update your installation of Longview.             |
| MULTIPOST       | 2        | 50   | Multiple clients appear to be posting data with this API key. Please check your clients' configuration. |

## Populating your Linode with Data

While developing with Longview, you may find it useful to populate your Linode with data for the Longview Client to record. Here are some tricks to up the usage of each reporting area:

### CPU

### RAM

### Swap

1. SSH into your Linode.

2. `$ touch filename.c`

3. Open `filename.c` with the editor of your choice, and paste the following:

```
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main(int argc, char** argv) {
    int max = 8211;
    int mb = 0;
    char* buffer;

    if(argc > 1)
        max = atoi(argv[1]);

    while((buffer=malloc(1024*1024)) != NULL && mb < max) {
        memset(buffer, 0, 1024*1024);
        mb++;
        printf("Allocated %d MB\n", mb);
    }
return 0;
}
```

4. `$ dd if=/dev/urandom of=/dev/sdb bs=1M count=256`

5. `$ gcc filename.c -o memeater`

6. `$ ./memeater`

7. In a separate terminal, SSH into your Linode and run `$ free h` to see your usage increase (this may take a few minutes).

### Load

### Networking

## FAQ

### I have 2 CPUs and `Load.*` is telling me I have a combined Load of `2.5`. What does that mean?

If you have 2 CPUs, a Load of 2 means that both CPUs are 100% utilizied. Anything past that, that means there are scheduled processes that will begin when the Load clears up.

As per @abemassry:

> a 1 Core system with a load of 1 is running at 100%

> a 1 core system with a load of 2 has double the amount of work scheduled than it can handle at that particular time slice

See [this blog post](http://www.brendangregg.com/blog/2017-08-08/linux-load-averages.html) for a more detailed explanation.

---

### How do I calculate my actual used memory on my ext disk?

Actual used memory is `used - (buffers + cache)` which are all returned from the Longview API.

Please note, however, that full memory on the system is `used + free`

---

### How do I determine the maximum amount of network traffic I can have?

Idk. Still have to figure this out.

---
