# Cozy-fixtures
Manage easily the data fixtures for your Cozy developments!

# Usage
Please note that the "load" process do the following:

* removing all the data for the concerned doctypes
* adding the fixtures for the concerned doctypes

The "concerned doctypes" are the ones found in the fixture files or the ones you gaves through parameters.

## CLI
When you develop an application you might want to feed the Data System with data.

```bash
npm install -g cozy-fixtures
cozy-fixtures load # will load all the fixtures inside ./tests/fixtures/
cozy-fixtures load ./fixtures/ # you can specify a folder
cozy-fixtures load ./fixtures/my-super-fixtures.json # or a file
cozy-fixtures load -d contact # only load the documents for a specified doctype
cozy-fixtures load -s # run the script quietly
cozy-fixutres -l load # doesn't remove documents before loading
```

## Automatic Tests
You can use cozy-fixtures programatically to ease automatic testing:

* First, add it to your dev dependencies:
```bash
npm install cozy-fixtures --save-dev
```
* Then use it where you need it

```coffeescript
fixtures = require 'cozy-fixtures'
fixtures.load
    dirPath: 'path/to/fixtures' # default is './tests/fixtures/'
    doctypeTarget: 'doctypeName' # default is null
    silent: true # default is false
    removeBeforeLoad: false # default is true. Remove docs for concerned doctypes before loading the data
    callback: yourCallback # default is null
```

You can also do more precise action like:

* deleting all the documents for a specified doctype

```coffeescript
fixtures = require 'cozy-fixtures'
fixtures.removeDocs "doctypeName", (err) ->
    console.log err if err?
```

* deleting all the documents from the database

```coffeescript
fixtures = require 'cozy-fixtures'
    fixtures.resetDatabase
        callback: (err) -> console.log err if err?
        designsToRemove: [] # default is empty, removes all the design docs in the database (and related) views or just the specified ones
```

If you want to have the same configuration for every call, use the setDefaultValues method:

```coffeescript
fixtures = require 'cozy-fixtures'
fixtures.setDefautValues
            target: './a/custom/target.json'
            silent: true
            removeBeforeLoad: false
fixtures.load callback: (err) -> console.log "fixtures loaded !"
```

You can still override the defautl values by passing the arguments to the load function.


# How to format the fixtures
* You must put the fixtures into files
* Fixtures must be described in valid JSON
* Don't forget the "docType" field in the fixtures

A simple example:
```json
[
    {
        "docType": "Alarm",
        "action": "DISPLAY",
        "trigg": "Tue Jul 02 2013 16:00:00",
        "description": "Réunion review scopyleft",
        "related": null
    },
    {
        "docType": "Contact",
        "fn": "John Doe",
        "datapoints": [
            {
                "name": "about",
                "type": "birthday",
                "value": "02/02/1980",
                "id": 1
            },
            {
                "name": "tel",
                "type": "main",
                "value": "+33 12 34 56 78",
                "id": 2
            }
        ],
        "note": "Données complémentaires sur le contact."
    }
]
```

# Todo
* adding tests
