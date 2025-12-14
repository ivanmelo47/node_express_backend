"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseResource_1 = __importDefault(require("@/common/resources/BaseResource"));
const RoleResource_1 = __importDefault(require("./RoleResource"));
class UserResource extends BaseResource_1.default {
    toArray() {
        return {
            id: this.resource.id,
            name: this.resource.name,
            email: this.resource.email,
            image: this.resource.image,
            images: this.resource.image ? {
                jpg: `/uploads/profiles/${this.resource.image}.jpg`,
                png: `/uploads/profiles/${this.resource.image}.png`,
                webp: `/uploads/profiles/${this.resource.image}.webp`,
            } : null,
            role: this.resource.Role ? new RoleResource_1.default(this.resource.Role).resolve() : null,
            // Add other fields as needed, excluding sensitive ones like password
            createdAt: this.resource.createdAt,
            updatedAt: this.resource.updatedAt,
        };
    }
}
exports.default = UserResource;
