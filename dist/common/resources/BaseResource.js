"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseResource {
    resource;
    constructor(resource) {
        this.resource = resource;
    }
    /**
     * Transform the resource into an object.
     * This method should be overridden by child classes.
     */
    toArray() {
        return this.resource;
    }
    /**
     * Resolve the resource to an object or array of objects.
     */
    resolve() {
        if (!this.resource) {
            return null;
        }
        return this.toArray();
    }
    /**
     * Static method to transform a collection of resources.
     * @param {Array} collection
     */
    static collection(collection) {
        if (!collection)
            return [];
        return collection.map(resource => {
            // @ts-ignore
            return new this(resource).resolve();
        });
    }
}
exports.default = BaseResource;
