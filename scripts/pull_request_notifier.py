import requests
import os
from random import randint



messages = [
"""> 🛠️ **New Pull Request Created**  
> **Title:** _{TITLE}_  
> 👤 Author: `{AUTHOR}`  
> 🔗 [View PR]({URL})  
>  
> Dev team, jump in for review when you can!
""",
"""> 🚀 **Code drop incoming!**  
> _{TITLE}_  
> 👤 `{AUTHOR}`  
> 🔗 [Open PR]({URL})  
>  
> Let’s get this reviewed and merged quickly.
""",
"""> 🔍 **Time for code review**  
> _{TITLE}_  
> 👤 Submitted by: `{AUTHOR}`  
> 🔗 [Take a look]({URL})  
>  
> Tag reviewers if needed and let's move it forward.
""",
"""> 🔧 **New PR waiting for feedback**  
> **Title:** _{TITLE}_  
> 👤 `{AUTHOR}`  
> 🔗 [View it here]({URL})  
>  
> Devs, your input help me ship faster.
""",
"""> 💬 **Heads up, team!**  
> A PR has been opened: _**{TITLE}**_  
> 👤 Author: `{AUTHOR}`  
> 🔗 [Check the PR]({URL})  
>  
> Feedback welcome — drop comments if anything stands out.
""",
"""> 🧪 **Ready for testing & review**  
> _{TITLE}_  
> 👤 By: `{AUTHOR}`  
> 🔗 [Review PR]({URL})  
>  
> Dev team, give it a run and flag anything off.
""",
"""> 📣 **New PR just landed**  
> **{TITLE}**  
> 👤 Created by: `{AUTHOR}`  
> 🔗 [View PR]({URL})  
>  
> Reviewers, you're up!
""",
"""> 📦 **Pull Request Created**  
> _{TITLE}_  
> 👤 Author: `{AUTHOR}`  
> 🔗 [See Details]({URL})  
>  
> Let’s get eyes on this and merge when ready.
""",
"""> 🔄 **Code changes submitted**  
> _{TITLE}_  
> 👤 Submitted by: `{AUTHOR}`  
> 🔗 [Open PR]({URL})  
>  
> Review and suggestions welcome!
""",
"""> ✅ **PR Ready for Review**  
> _{TITLE}_  
> 👤 `{AUTHOR}`  
> 🔗 [Go to PR]({URL})  
>  
> Let’s review and keep things moving.
""",
"""> ⏳ **Pending Review**  
> _{TITLE}_  
> 👤 Author: `{AUTHOR}`  
> 🔗 [Review Here]({URL})  
>  
> Don’t let it sit too long 😅
""",
"""> 🔁 **Review Time!**  
> _{TITLE}_  
> 👤 From: `{AUTHOR}`  
> 🔗 [View PR]({URL})  
>  
> Let’s keep the cycle moving 🚀
""",
"""> 📌 **Code Update Alert**  
> _{TITLE}_  
> 👤 Author: `{AUTHOR}`  
> 🔗 [Jump to PR]({URL})  
>  
> Please review and share feedback.
""",
"""> 🧠 **New PR = Fresh Thinking**  
> **Title:** _{TITLE}_  
> 👤 Submitted by: `{AUTHOR}`  
> 🔗 [Open Link]({URL})  
>  
> Quick code review help me.
""",
"""> 🧰 **Pull Request Submitted**  
> _{TITLE}_  
> 👤 By: `{AUTHOR}`  
> 🔗 [View Pull Request]({URL})  
>  
> Reviewers, your input is appreciated 🙌
"""]


def send_message():
    BOT_TOKEN = os.getenv('BOT_TOKEN')
    ROOM_ID = os.getenv('ROOM_ID')
    URL = os.getenv('url')
    TITLE = os.getenv('title')
    AUTHOR = os.getenv('author')

    url = 'https://webexapis.com/v1/messages'
    headers = {
        'Authorization': f'Bearer {BOT_TOKEN}',
        'Content-Type': 'application/json'
    }
    data = {        
        'roomId': ROOM_ID,
        'markdown': getRandomMessage().format(TITLE=TITLE, AUTHOR=AUTHOR, URL=URL),
    }

    requests.post(url, headers=headers, json=data)

def getRandomMessage():

    return messages[randint(0, len(messages) - 1)]

send_message()

