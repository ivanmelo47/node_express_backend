const BaseResource = require('./BaseResource');
const RoleResource = require('./RoleResource');

class UserResource extends BaseResource {
  toArray() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      email: this.resource.email,
      image: this.resource.image,
      role: this.resource.Role ? new RoleResource(this.resource.Role).resolve() : null,
      // Add other fields as needed, excluding sensitive ones like password
      createdAt: this.resource.createdAt,
      updatedAt: this.resource.updatedAt,
    };
  }
}

module.exports = UserResource;
