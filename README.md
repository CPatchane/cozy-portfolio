# Description

Cozy-Portfolio is a Cozy Cloud application which allows you to 
do a portfolio. This application was started as a student project of Cédric PATCHANE from Telecom Bretagne, you can read more about that in the wiki.

Here are the main features :
* Grab documents and information from a DoYouBuzz account (API keys required but free and easy to get, see here)
* Grab badges from an OpenBadges backpack
* Display a public view of the portfolio (only documents selected by the user will be visible)
* Give to the user the entire control about his data : what information, what badge, what document should be displayed on his pubic portfolio page or not

For this last point, all profile information and documents/badges will have a dedicated checkbox. If this checkbox is grey that means your document won't be displayed. If it's green, the document will be displayed on your portfolio public page.

# Hack
Hacking the portfolio app requires you the dev environment (see the [tutorial from Cozy Cloud](https://dev.cozy.io/#set-up-the-development-environment)). After that you can enjoy hacking the portfolio as you want.
```shell
$ git clone https://github.com/CPatchane/cozy-portfolio.git
$ npm install
$ cd client
$ npm install
```

You can find more details about setting up your dev environment and install the application in the wiki.

# Development
With your dev environment started, you can start the server:
```shell
$ node server.js
```
Then (in a new terminal) start the brunch watcher to recompile and to reload the front-end app in your browser each time you make a change:
```shell
$ cd client
$ brunch watch
```
And finally you deploy your app in you dev environment:
```shell
$ cozy-dev deploy 9250
```

You can also find more details about that in the wiki.

## What is Cozy?

![Cozy Logo](https://raw.github.com/cozy/cozy-setup/gh-pages/assets/images/happycloud.png)

[Cozy](http://cozy.io) is a platform that brings all your web services in the
same private space.  With it, your web apps and your devices can share data
easily, providing you
with a new experience. You can install Cozy on your own hardware where no one
profiles you. You install only the applications you want. You can build your
own one too.

## Community

You can reach the Cozy community via various support:

* IRC #cozycloud on irc.freenode.net
* Post on our [Forum](https://forum.cozy.io)
* Post issues on the [Github repos](https://github.com/cozy/)
* Via [Twitter](http://twitter.com/mycozycloud)
