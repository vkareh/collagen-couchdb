Collagen CouchDB
================

This module provides a CouchDB-based persistent storage for models in the
[Collagen.js](http://collagenjs.org) framework.

### Installation & Configuration
Install by running `npm install collagen-couchdb` in your Collagen.js app and
add `require('collagen-couchdb');` in your app's `index.js` file, anywhere
before the model that needs it is loaded. For example:

```js
var collagen = require('collagen');

require('collagen-couchdb'); // This module...
require('collagen-blog'); // Module that will use CouchDB

collagen.load(__dirname);
collagen.start();
```

You will need to add the CouchDB configuration details. In your `collagen.json`
file, add the following property, replacing values as appropriate.

```js
{
    "couchdb": {
        "host": "localhost",
        "port": 5984,
        "name": "collagen",
        "options": {
            "auth": {
                "username": "couchdb-username",
                "password": "couchdb-password"
            }
        }
    }
}
```

If you want to use the supplied CouchDB view for collections, you can install it
by running the following command in your terminal: `node index.js couchdb
install`. We also include the `node index.js couchdb index` command for
convienence; it triggers indexing for the supplied view.

### Usage
Once your module is installed and configured, you will need to add the `storage:
'couchdb'` property to the model or collection that will use it. For example:

```js
model = models.Model.extend({
    storage: 'couchdb',
    /* My other model properties */
});
```

If you want to add it to a third-party model (i.e. from an installed module), it
is good practice to not modify it and instead augment it in your own app. For
the example above, you would create a new `BlogPost.bones.js` file in your
`app/model` folder and add the following:

```js
model = models.BlogPost.augment({
    storage: 'couchdb'
});
```

This way the _BlogPost_ model from the _collagen-blog_ module will be augmented
to use CouchDB as the persistence storage, without having to modify the
_collagen-blog_ module. In addition to models, you would also want to add
`storage: 'couchdb'` to any collections that need it.

The collagen-couchdb module overrides the model's `sync()` method and provides a
`model.couchDb()` function that points to a CouchDB connection instance. You can
use this to override the module's `sync()` method with your own logic.
