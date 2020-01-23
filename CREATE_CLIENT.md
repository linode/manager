# Creating an OAuth Client

This document explains how to properly create an OAuth Client which
is a requirement for running some projects contained in this repository - the Cloud Manager, for example. By the end of this document, you should have a newly created Client ID which will be used as an environment variable, usually located in a `.env` file.

## Disclaimer

Keep in mind these instructions assume you already have an account with Linode.com. If you do not have an account, [please create one here.](https://login.linode.com/signup)

## Creating a Client ID

The first step in getting UI apps running locally is to create an OAuth Client.
[You can create one here.](https://cloud.linode.com/profile/clients) On this screen, click _Create an OAuth App_

![Screen Shot 2019-04-10 at 2 47 57 PM](https://user-images.githubusercontent.com/7387001/55906071-69899f80-5ba1-11e9-85cd-bfd1a5e90eb8.png)

Once the drawer opens up, enter the values below and click _Submit_

<img width="477" alt="Screen Shot 2019-04-11 at 10 18 01 AM" src="https://user-images.githubusercontent.com/7387001/55964735-3992d880-5c43-11e9-9975-4b22c52b3115.png">

Finally, keep the client ID in the table row handy. You'll need it later:

![Screen Shot 2019-04-10 at 3 04 02 PM](https://user-images.githubusercontent.com/7387001/55906313-fc2a3e80-5ba1-11e9-8f8a-6323649c301d.png)
