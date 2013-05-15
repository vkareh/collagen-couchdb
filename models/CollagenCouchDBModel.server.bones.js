// CouchDB-based back-end store.
var sync = function(method, model, options) {

    // Verify model access
    if (!model.access(method)) return options.error(new Error('You do not have permission to ' + method + ' this ' + model.constructor.title));

    switch (method) {
        case 'read':
            // Read from CouchDB
            if (model.id) {
                model.couchDb.get(model.id, function(err, doc) {
                    if (err) return options.error(err);
                    model.set(doc);
                    options.success(model);
                });
            }
            break;
        case 'create':
            // Set data type
            if (!model.get('type')) model.set({type: model.constructor.title});
            // Assign a user to the model
            if (!model.get('user')) model.set({user: Collagen.user.get('id')});
        case 'update':
            // Store latest version
            if (model.get('_rev')) {
                // This is an update.
                // Ensure that partial updates work by retrieving the model
                // and merging its attributes.
                model.couchDb.get(model.id, function(err, doc) {
                    if (err) return options.error(err);
                    if (doc._rev !== model.get('_rev')) {
                        // Create a fake object; we already know that sending
                        // the request would fail.
                        var err = new Error('Document update conflict.');
                        err.reason = 'Document update conflict.';
                        err.statusCode = 409;
                        options.error(err);
                    } else {
                        model.couchDb.save(model.id, model.get('_rev'), model.attributes, function(err, doc) {
                            if (err) return options.error(err);
                            model.set({_rev: doc.rev});
                            options.success(model);
                        });
                    }
                });
            } else {
                // This is a create.
                model.couchDb.save(model.attributes, function(err, doc) {
                    if (err) return options.error(err);
                    model.id = doc.id;
                    model.set({_id: doc.id, _rev: doc.rev});
                    options.success(model);
                });
            }
            break;
        case 'delete':
            // Remove form CouchDB
            model.couchDb.remove(model.id, model.get('_rev'), function(err, doc) {
                if (err) return options.error(err);
                model.clear();
                options.success(model);
            });
            break;
        default:
            return options.error(new Error('An error ocurred with your request.'));
    }
}

var cradle = require('cradle');
var register = models.Model.register;
models.Model.register = function(server) {
    if (!this.prototype.couchDb) {
        // Connect to configured CouchDB instance
        var config = Collagen.config && Collagen.config.couchdb || {};
        var couchDb = new(cradle.Connection)(config.host, config.port, config.options).database(config.name);

        // Give model access to the CouchDB object
        this.prototype.couchDb = couchDb;
    }

    // Use CouchDB as persistent storage for models
    if (this.prototype.storage === 'couchdb') {
        this.prototype.sync = sync;
    }
    return register.apply(this, arguments);
}
