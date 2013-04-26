var fs = require('fs')
,   path = require('path')
,   cradle = require('cradle');

command = Bones.Command.extend({});

command.description = 'CouchDB backend storage management.';
command.usage = ['install', 'index'];

command.prototype.initialize = function(plugin, callback) {
    var action = plugin.argv._[1];
    if (this[action]) {
        this[action].command(plugin.argv, callback);
    } else {
        plugin.help(callback);
    }
};

command.prototype.install = {
    name: 'couchdb install',
    description: 'Install collagen/collection view on your configured CouchDB instance.',
    command: function(argv, callback) {
        if (Collagen.config && Collagen.config.couchdb) {
            var config = Collagen.config && Collagen.config.couchdb;
            var view = fs.readFileSync(path.join(__dirname, '../couchdb.json'), 'utf8');
            try {
                view = JSON.parse(view);
            } catch(err) {
                return console.error(err);
            }
            var couch = new(cradle.Connection)(config.host, config.port, config.options).database(config.name);
            couch.save(view, function(err, res) {
                if (err) return console.error(err);
                console.log('CouchDB view installed successfully.');
            });
        } else {
            console.error('CouchDB configuration not found.');
            console.error('Please see the README file for what options to add in your collagen.json file.');
        }
        callback && callback();
    }
}

command.prototype.index = {
    name: 'couchdb index',
    description: 'Index CouchDB views.',
    command: function(argv, callback) {
        if (Collagen.config && Collagen.config.couchdb) {
            var config = Collagen.config && Collagen.config.couchdb;
            var couch = new(cradle.Connection)(config.host, config.port, config.options).database(config.name);
            couch.view('collagen/collection', {reduce: false, limit: 1}, function(err, res) {
                if (err) return console.error(err);
                console.log('CouchDB finished indexing successfully.');
            });
        } else {
            console.error('CouchDB configuration not found.');
            console.error('Please see the README file for what options to add in your collagen.json file.');
        }
        callback && callback();
    }
}
