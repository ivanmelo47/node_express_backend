const BaseResource = require('./BaseResource');

class RoleResource extends BaseResource {
  toArray() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      description: this.resource.description,
    };
  }
}

module.exports = RoleResource;
