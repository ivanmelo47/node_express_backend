import BaseResource from '@/common/resources/BaseResource';

class UserProfileResource extends BaseResource {
  toArray() {
    return {
      uuid: this.resource.uuid,
      firstName: this.resource.firstName,
      lastNamePaternal: this.resource.lastNamePaternal,
      lastNameMaternal: this.resource.lastNameMaternal,
      dateOfBirth: this.resource.dateOfBirth,
      gender: this.resource.gender,
      curp: this.resource.curp,
      rfc: this.resource.rfc,
      contact: {
        primary: this.resource.phonePrimary,
        secondary: this.resource.phoneSecondary,
        alternateEmail: this.resource.emailAlternate,
      },
      address: {
        street: this.resource.street,
        exterior: this.resource.exteriorNumber,
        interior: this.resource.interiorNumber,
        neighborhood: this.resource.neighborhood,
        city: this.resource.city,
        state: this.resource.state,
        zip: this.resource.zipCode,
        country: this.resource.country,
      },
      bio: this.resource.bio,
      nationality: this.resource.nationality,
      updatedAt: this.resource.updatedAt,
    };
  }
}

export default UserProfileResource;
