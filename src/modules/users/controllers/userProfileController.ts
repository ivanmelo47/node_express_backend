import { Request, Response, NextFunction } from "express";
// @ts-ignore
import UserProfileService from "@/modules/users/services/UserProfileService";
// @ts-ignore
import UserProfileResource from "@/modules/users/resources/UserProfileResource";

export const getMyProfile = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const profile = await UserProfileService.getProfile(userId);

    if (!profile) {
      // @ts-ignore
      return res.errorResponse("Profile not found. Please complete your profile.", 404);
    }

    // @ts-ignore
    res.successResponse(new UserProfileResource(profile).resolve());
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userUuid = req.user.uuid;
    const profile = await UserProfileService.updateOrCreateByUuid(
      userUuid,
      req.body
    );

    // @ts-ignore
    // @ts-ignore
    res.successResponse(new UserProfileResource(profile).resolve(), "Profile updated successfully");
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uuid } = req.params;

    // Check if target user exists and is not admin
    // @ts-ignore
    const user = await import("@/modules/users/models/User").then((m) =>
      m.default.findOne({
        where: { uuid },
        include: ["Role"],
      })
    );

    if (!user) {
      // @ts-ignore
      return res.errorResponse("User not found", 404);
    }

    // Prevent updating other admins
    // Assuming Role model is included and has a 'name' field
    if (user.Role && user.Role.name === "admin") {
      // @ts-ignore
      return res.errorResponse("Cannot update profile of another admin", 403);
    }

    const profile = await UserProfileService.updateOrCreateByUuid(
      uuid,
      req.body
    );

    // @ts-ignore
    res.successResponse(new UserProfileResource(profile).resolve(), "Profile updated successfully");
  } catch (error) {
    next(error);
  }
};
