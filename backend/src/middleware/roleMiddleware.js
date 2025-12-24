import { getMembershipRole } from "../models/membershipModel.js";

/**
 * Require that the authenticated user is a member of the group.
 * Expects:
 * req.user.id to exist (set by requireAuth),
 * group id in req.params.groupId OR req.body.groupId.
 */
export async function requireGroupMember(req, res, next) {
  try {
    const groupId = req.params.groupId || req.body.groupId;

    if (!groupId) {
      return res.status(400).json({ message: "groupId is required" });
    }

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const role = await getMembershipRole(groupId, userId);

    if (!role) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    req.groupRole = role;
    return next();
  } catch (err) {
    return res.status(500).json({ message: "Role check failed" });
  }
}

/**
 * Require a minimum role.
 * Usage: requireGroupRole("admin") or requireGroupRole("member")
 * For now:
 * admin can do everything
 * member can only pass "member"
 */
export function requireGroupRole(requiredRole) {
  return async function (req, res, next) {
    try {
      const groupId = req.params.groupId || req.body.groupId;

      if (!groupId) {
        return res.status(400).json({ message: "groupId is required" });
      }

      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const role = await getMembershipRole(groupId, userId);

      if (!role) {
        return res.status(403).json({ message: "You are not a member of this group" });
      }

      const ok =
        role === requiredRole ||
        (role === "admin" && requiredRole === "member");

      if (!ok) {
        return res.status(403).json({ message: `Requires ${requiredRole} role` });
      }

      req.groupRole = role;
      return next();
    } catch (err) {
      return res.status(500).json({ message: "Role check failed" });
    }
  };
}
