import BaseResource from './BaseResource';

class RoleResource extends BaseResource {
  toArray() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      description: this.resource.description,
    };
  }
}

export default RoleResource;
