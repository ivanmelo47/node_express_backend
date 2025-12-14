import UserProfile from "@/modules/users/models/UserProfile";
// @ts-ignore
import db from "@/config/database";

class UserProfileService {
  /**
   * Get user profile by user ID.
   * @param {number} userId
   * @returns {Promise<UserProfile|null>}
   */
  static async getProfile(userId: number) {
    return await UserProfile.findOne({ where: { userId } });
  }

  /**
   * Update or Create user profile.
   * @param {number} userId
   * @param {Object} data
   * @returns {Promise<UserProfile>}
   */
  static async updateOrCreate(userId: number, data: any) {
    // Flatten address object if present
    if (data.address && typeof data.address === 'object') {
      data = { ...data, ...data.address };
      delete data.address; // Remove the nested object after flattening
    }

    const t = await db.init();
    try {
      const [profile, created] = await UserProfile.findOrCreate({
        where: { userId },
        defaults: { ...data, userId },
        transaction: t,
      });

      if (!created) {
        await profile.update(data, { transaction: t });
      }

      await db.commit(t);
      return profile;
    } catch (error) {
      await db.rollback(t);
      throw error;
    }
  }

  /**
   * Update or Create user profile by User UUID.
   * @param {string} userUuid
   * @param {Object} data
   * @returns {Promise<UserProfile>}
   */
  static async updateOrCreateByUuid(userUuid: string, data: any) {
    // @ts-ignore
    const user = await import("@/modules/users/models/User").then((m) =>
      m.default.findOne({ where: { uuid: userUuid } })
    );

    if (!user) {
      throw new Error("User not found");
    }

    return await this.updateOrCreate(user.id, data);
  }
}

export default UserProfileService;
