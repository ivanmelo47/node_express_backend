class BaseResource {
  protected resource: any;

  constructor(resource: any) {
    this.resource = resource;
  }

  /**
   * Transform the resource into an object.
   * This method should be overridden by child classes.
   */
  toArray(): any {
    return this.resource;
  }

  /**
   * Resolve the resource to an object or array of objects.
   */
  resolve(): any {
    if (!this.resource) {
      return null;
    }
    return this.toArray();
  }

  /**
   * Static method to transform a collection of resources.
   * @param {Array} collection 
   */
  static collection(collection: any[]): any[] {
    if (!collection) return [];
    return collection.map(resource => {
      // @ts-ignore
      return new this(resource).resolve();
    });
  }
}

export default BaseResource;
