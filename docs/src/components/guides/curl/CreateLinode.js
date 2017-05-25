import React from 'react';
import { Link } from 'react-router';
import { API_ROOT, API_VERSION } from '~/constants';

import { Table } from 'linode-components/tables';


export default function Introduction() {
  return (
    <section className="Article">
      <header>
          <h1>Creating a Linode</h1>
          <h5>by William Smith; last updated May 22nd, 2017</h5>
      </header>
      <section>
        <p>
          Creating a Linode requires you to be logged in. Before proceeding, make sure you have gone through the <Link to="/guides/curl/testing-with-curl">testing with curl guide</Link>, since you will need an authorization token to proceed.
        </p>
        <p>
          Before you can create a Linode, you will need to choose a <strong>region</strong>, a <strong>service plan</strong>, and a <strong>distribution</strong>. The API has endpoints available to help you do this.
        </p>
      </section>
      <section>
        <h2>Selecting a region</h2>
        <p>
          A region is a physical location which can run Linodes. To retrieve a list of available region, you can use the /regions API endpoint. To make an API call against this endpoint over curl, run the following command:
        </p>
        <pre>
          <code>
            curl {API_ROOT}/{API_VERSION}/regions
          </code>
        </pre>
        <p>
          Note that since the region list is public information, you don’t need to send your authorization token (although it will still work if you do). The above command will return a JSON object like the following:
        </p>
        <pre>
          <code>
{`{
    "regions": [
        {
            "id": "us-east-1a",
            "label": "Newark, NJ",
            "country": "US"
        }
        /* and so on */
    ],
    "page": 1,
    "total_pages": 1,
    "total_results": 7
}`}
          </code>
        </pre>
        <p>
          The region list is pretty self-explanatory: regions geographical locations are provided in the <code>label</code> field. The <code>id</code> field is a unique ID which you’ll use to refer to the region you want to select. For this example, we’ll go with the "Newark, NJ" region with ID "us-east-1a".
        </p>
      </section>
      <section>
        <h2>Selecting a service plan</h2>
        <p>
          Once you have a region in mind, the next step is to choose a Linode service plan. A service plan determines the resources available to your new Linode (such as memory, storage space, and network transfer). Run the following curl command to retrieve a list of available Linode plans:
        </p>
        <pre>
          <code>
            curl {API_ROOT}/{API_VERSION}/linode/types
          </code>
        </pre>
        <p>
          The above command will return a JSON object like the following:
        </p>
        <pre>
          <code>
{`{
    "services": [
        {
            "id": "g5-standard-1",
            "label": "Linode 2048",
            "vcpus": 1,
            "mbits_out": 125,
            "storage": 24576,
            "hourly_price": 1,
            "class": "standard",
            "ram": 2048,
            "monthly_price": 1000,
            "backups_price": 250,
            "transfer": 2000
        }
        /* and so on */
    ],
    "page": 1,
    "total_pages": 1,
    "total_results": 1
}`}
          </code>
        </pre>
        <p>
          Each entry in the services list represents an available Linode service plan. You can review the details of each plan, such as the number of Virtual CPUs, memory, disk space, monthly price, etc. For explanations of each field, see the <Link to="/reference/endpoints/linode/types">complete service reference</Link>. Once you have selected the service plan you want to launch, note its ID and continue to the next step.
        </p>
      </section>
      <section>
        <h2>Selecting a distribution</h2>
        <p>
          Now you need to choose a Linux distribution to deploy to your new Linode. Just like selecting a service and a region, issue a call to the API, this time for a list of available distributions:
        </p>
        <pre>
          <code>
            curl {API_ROOT}/{API_VERSION}/linode/distributions
          </code>
        </pre>
        <p>
          This will provide you with a list of distributions like the following:
        </p>
        <pre>
          <code>
{`{
    "distributions": [
        {
            "id": "linode/debian8",
            "label": "Debian 8",
            "vendor": "Debian",
            "x64": true,
            "recommended": true,
            "minimum_storage_size": 900,
            "created": "2015-04-27T16:26:41"
        }
        /* and so on */
    ],
    "page": 1,
    "total_pages": 1,
    "total_results": 1
}`}
          </code>
        </pre>
        <p>
          For detailed information about each field, see the complete distribution reference. For this example, we’ll go with Debian 8.
        </p>
      </section>
      <section>
        <h2>Creating your new Linode</h2>
        <p>
          Now that you’ve selected a region, service plan, and distribution, you’re ready to launch a new Linode! The API calls above were unauthenticated because they return only publicly visible information. However, launching a Linode is tied to your account so this call must be authenticated.
        </p>
        <p>
          You will need to substitute your authorization token in the command below before running it (replace <strong>$TOKEN</strong>). If you don’t yet have an authorization token, read through the Testing with curl guide before proceeding.
        </p>
        <p>
          You should also set a root password for the new Linode (replace <strong>$root_pass</strong>).
        </p>
        <p>
          As you can see, the region, service plan, and Linux distribution are all specified in the JSON POST data and can be changed as needed to deploy Linodes to different locations and with different characteristics. Customize the following curl command and run it when you’re ready to deploy:
        </p>
        <pre>
          <code>
{`curl -X POST ${API_ROOT}/${API_VERSION}/linode/instances \
-d '{"type": "g5-standard-1", "region": "us-east-1a", "distribution": "linode/debian8", "root_pass": "$root_pass", "label": "prod-1"}' \
-H "Authorization: token $TOKEN" -H "Content-type: application/json"
`}
          </code>
        </pre>
        <p>
          If all was successful, you should get a response object detailing the newly created Linode like the following:
        </p>
        <pre>
          <code>
{`{
   "id": 123456,
   "total_transfer": 2000,
   "label": "prod-1",
   "status": "provisioning",
   "group": "",
   "updated": "2016-11-10T19:01:12",
   "created": "2016-11-10T19:01:12",
   "hypervisor": "kvm",
   "ipv4": "97.107.143.56",
   "ipv6": "2600:3c03::f03c:91ff:fe0a:18ab/64",
   "region": {
      "id": "us-east-1a",
      "country": "us",
      "label": "Newark, NJ"
   },
   "type": [
      {
         "ram": 2048,
         "label": "Linode 2048",
         "monthly_price": 1000,
         "transfer": 2000,
         "class": "standard",
         "storage": 24576,
         "id": "g5-standard-1",
         "backups_price": 250,
         "mbits_out": 125,
         "hourly_price": 1,
         "vcpus": 1
      }
   ],
   "distribution": {
      "recommended": true,
      "x64": true,
      "created": "2015-04-27T16:26:41",
      "id": "linode/debian8",
      "label": "Debian 8.1",
      "vendor": "Debian",
      "minimum_storage_size": 900
   },
   "alerts": {
      "cpu": {
         "threshold": 90,
         "enabled": true
      },
      "transfer_out": {
         "enabled": true,
         "threshold": 10
      },
      "io": {
         "threshold": 10000,
         "enabled": true
      },
      "transfer_quota": {
         "threshold": 80,
         "enabled": true
      },
      "transfer_in": {
         "enabled": true,
         "threshold": 10
      }
   },
   "backups": {
      "snapshot": null,
      "last_backup": null,
      "enabled": false,
      "schedule": {
         "day": null,
         "window": null
      }
   }
}`}
          </code>
        </pre>
        <p>
          The above response contains lots of details about the newly created Linode, including IP addresses, alerts, region information, and meta-data like the date and time it was created. For information on all of the returned fields, please see the Linode object reference. Take note of the id field, as you will need it for the next step.
        </p>
      </section>
      <section>
        <h2>Booting a Linode</h2>
        <p>
          Before you can use your new Linode, you will need to boot it. Take the <code>id</code> returned by the previous API call and substitute it for <code>$linode_id</code> in the following curl command. Also remember to replace <strong>$TOKEN</strong> with your authorization token as in the previous API call.
        </p>
        <pre>
          <code>
{`curl -X POST ${API_ROOT}/${API_VERSION}/linode/instances/$linode_id/boot \
-H "Authorization: token $TOKEN"`}
          </code>
        </pre>
        <p>
          You’ll receive an empty response (<code>{`{}`}</code>) - this is the expected behavior. If the status code is 200, it worked. You can now watch for the Linode’s state field to change from "booting" to "running":
        </p>
        <pre>
          <code>
{`curl ${API_ROOT}/${API_VERSION}/linode/instances/$linode_id \
-H "Authorization: token $TOKEN"`}
          </code>
        </pre>
        <pre>
          <code>
{`{
    "linode": {
        "id": 123456,
        "label": "prod-1",
        "status": "running",
        /* and so on */
    }
}`}
          </code>
        </pre>
      </section>
      <section>
        <h2>SSH into your Linode</h2>
        <p>
          Run the SSH command from the Linode response object and enter the root password you set in the create Linode step:
        </p>
        <pre>
          <code>
{`ssh root@$public_ip`}
          </code>
        </pre>
        <p>
          Congratulations! You have now successfully launched a Linode through the API!
        </p>
      </section>
    </section>
  );
}
