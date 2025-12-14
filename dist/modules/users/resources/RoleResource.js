"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseResource_1 = __importDefault(require("@/common/resources/BaseResource"));
class RoleResource extends BaseResource_1.default {
    toArray() {
        return {
            id: this.resource.id,
            name: this.resource.name,
            description: this.resource.description,
        };
    }
}
exports.default = RoleResource;
