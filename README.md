## Erin?

Erin is the [UK Dynasty league](http://www.ukdynasty.com)'s GroupMe chat bot, providing information, initially about rookie draft picks, to the league group chat and by direct message.

## Who's it for? Can I use Erin for my own league's GroupMe chat?

Not without some/lots of tinkering, no. Because of the way our league is set up and hosted (we switch from ESPN to MyFantasyLeague in the off-season), the data for who owns rookie picks, etc., is sourced from a Google Sheet. You could of course mimic this setup and use this code as inspiration. 

I plan on using this project as a base for creating a reusable [GroupMe](https://www.groupme.com)/[MyFantasyLeague](https://www.myfantasyleague.com) chat bot in future, which would use the MyFantasyLeague API to respond to requests from a league's group chat. The idea would be that all you'd need to do is set up a GroupMe bot, and provide its ID and your MFL league ID as environment variables, and you'd be all set.

## Environment variables

The app depends on having access to the following environment variables, to avoid storing GroupMe bot IDs and, moreso, access tokens, in the repository.

- GROUPCHAT_BOT_ID: the GroupMe bot ID of the bot that's registered to the league chat.
- GROUPCHAT_BOT_NAME: the GroupMe bot name of the bot that's registered to the league chat. Important this is right! Stops infinite loops where the bot responds to itself.
- GROUPCHAT_BOT_GROUP_ID: the GroupMe group ID of the league chat group to which the bot is registered. Deprecated here, as not used in the code.

- DM_USER_ACCESS_TOKEN: the user account access token for the GroupMe bot USER, not bot. This allows the app to send direct messages as the user instead of just posting as a bot to a single group.

Set environment variables either on the command line by editing `.env.local` and running `source .env.local`, or setting them as config variables if running on Heroku.

## Run

`node ./src/index.js`

The app is laid out with one-click deployment to Heroku in mind.

## What can I ask?

For now, Erin responds only to 2 types of request:

- Who owns a particular draft pick? e.g. *Who owns pick 1.10?* or *Who does pick 2.04 belong to?*
- What draft picks does a particular franchise own? e.g. *What picks do the Seahawks have?*