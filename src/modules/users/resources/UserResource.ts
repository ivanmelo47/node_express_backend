import BaseResource from '@/common/resources/BaseResource';
import RoleResource from './RoleResource';

class UserResource extends BaseResource {
  toArray() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      email: this.resource.email,
      image: this.resource.image,
      images: this.resource.image ? {
        jpg: `/api/v1/storage/private/profiles/${this.resource.image}.jpg`,
        png: `/api/v1/storage/private/profiles/${this.resource.image}.png`,
        webp: `/api/v1/storage/private/profiles/${this.resource.image}.webp`,
      } : null,
      role: this.resource.Role ? new RoleResource(this.resource.Role).resolve() : null,
      // Add other fields as needed, excluding sensitive ones like password
      createdAt: this.resource.createdAt,
      updatedAt: this.resource.updatedAt,
    };
  }
}

export default UserResource;
