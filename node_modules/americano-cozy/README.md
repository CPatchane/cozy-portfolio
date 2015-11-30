# Americano Cozy

When you want to write [Cozy](http://cozy.io) applications with 
[Americano](https://github.com/frankrousseau/americano), you don't have the
good helpers to write your models. Here are some that could make your life
easier, notably about declaring your requests.

## Getting Started

Add americano-cozy to the list of your plugins in the Americano configuration file. Then add it as a dependency of your project:

    npm install americano-cozy -g


## Models

Do no think about including JugglingDB and its configuration for Cozy 
anymore, Americano Cozy does the job for you:


```coffeescript
americano = require 'americano-cozy'

module.exports = americano.getModel 'Task',
    done: Boolean
    completionDate: Date
```

## Requests

Describe your Data System requests in a single file:

```coffeescript
# server/models/requests.coffee
americano = require 'americano-cozy'

module.exports =
    task:
        all: americano.defaultRequests.all
        analytics:
            map: (doc) ->
                if doc.completionDate? and doc.done
                    date = new Date doc.completionDate
                    dateString = "#{date.getFullYear()}-"
                    dateString += "#{date.getMonth() + 1}-#{date.getDate()}"
                    emit dateString, 1
            reduce: (key, values, rereduce) ->
                sum values
```

## What about contributions?

Here is what I would like to do next:

* write tests
* remove async from the dependency (use recursive functions instead)
* make Data System URL configurable

I didn't start any development yet, so you're welcome to participate!

## What is Cozy?

![Cozy Logo](https://raw.github.com/mycozycloud/cozy-setup/gh-pages/assets/images/happycloud.png)

[Cozy](http://cozy.io) is a platform that brings all your web services in the
same private space.  With it, your web apps and your devices can share data
easily, providing you
with a new experience. You can install Cozy on your own hardware where no one
profiles you. You install only the applications you want. You can build your
own one too.

## Community 

You can reach the Cozy community via various support:

* IRC #cozycloud on irc.freenode.net
* Posting on our [Forum](https://forum.cozy.io/)
* Posting issues on the [Github repos](https://github.com/cozy/)
* Via [Twitter](http://twitter.com/mycozycloud)
