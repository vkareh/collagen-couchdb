// CouchDB-based back-end store.
var sync = function(method, collection, options) {
    var params = {
        startkey: [Bones.utils.singularize(collection.constructor.title)],
        endkey: [Bones.utils.singularize(collection.constructor.title), {}],
        reduce: false,
        include_docs: true
    };
    collection.couchDb.view('collagen/collection', params, function(err, docs) {
        if (err) return options.error(err);

        var models = _.chain(docs).pluck('doc').map(function(doc) {
            // Initialize each document into its corresponding model
            doc.id = doc._id;
            return new collection.model(doc);
        }).filter(function(model) {
            // Filter by read access
            return model.access('read');
        }).value();

        options.success(models);
    });
}

var cradle = require('cradle');
var register = models.Models.register;
models.Models.register = function(server) {
    if (!this.prototype.couchDb) {
        // Try to reuse CouchDB connection
        if (this.prototype.model && this.prototype.model.prototype.couchDb) {
            this.prototype.couchDb = this.prototype.model.prototype.couchDb;
        } else {
            var config = Collagen.config && Collagen.config.couchdb || {};
            this.prototype.couchDb = new(cradle.Connection)(config.host, config.port, config.options).database(config.name);
        }
    }

    // Use CouchDB as persistent storage for collections
    if (this.prototype.storage === 'couchdb') {
        this.prototype.sync = sync;
    }
    return register.apply(this, arguments);
}
