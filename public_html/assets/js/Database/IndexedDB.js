export class IndexedDB {
    constructor() {
        if (!window.indexedDB) {
            window.alert("Your browser doesn't support a stable version of IndexedDB.");
        }
    }
    initDatabase(database, version = 1, structur, callback, caller) {
        var cla = this;
        this.request = window.indexedDB.open(database, version);
        this.request.onerror = function (event) {
            console.log("Error to connect to DB!");
        };
        this.request.onupgradeneeded = function (event) {
            cla.db = event.target.result;
            for (var objectname in structur) {
                cla.createObject(structur[objectname]);
            }
        };
        this.request.onsuccess = function (event) {
            cla.db = cla.request.result;
            callback(true, caller);
        };
    }
    add(object, data, callback, caller) {
        var request = this.db.transaction([object.name], "readwrite")
            .objectStore(object.name)
            .add(data);
        request.onsuccess = function (event) {
            callback(true, caller);
        };
        request.onerror = function (event) {
            callback(false, caller);
        };
    }
    read(object, query, callback, caller) {
        var store = this.db.transaction(object.name, 'readonly').objectStore(object.name);
        if (query) {
            var cursorQuery = store.index(query.element.name).getAll(query.value);
        }
        else {
            var cursorQuery = store.getAll();
        }
        cursorQuery.onerror = ev => {
            callback(false, null, caller);
        };
        cursorQuery.onsuccess = ev => {
            callback(true, cursorQuery.result, caller);
        };
    }
    createObject(object) {
        var objectStore = this.db.createObjectStore(object.name, { keyPath: object.keyPath, autoIncrement: true });
        for (var elementName in object.elements) {
            this.createElement(object.elements[elementName], objectStore);
        }
    }
    createElement(element, objectStore) {
        objectStore.createIndex(element.name, element.name, { unique: element.unique });
    }
}
//# sourceMappingURL=IndexedDB.js.map