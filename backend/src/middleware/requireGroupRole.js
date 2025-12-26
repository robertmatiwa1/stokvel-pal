import { getMembershipRole } from "../models/membershipModel.js";

const resolveGroupId = (req) => {
  return (
    req.params.groupId ||
    req.params.group_id ||
    req.body.groupId ||
    req.body.group_id ||
    req.query.groupId ||
    req.query.group_id ||
    null
  );
};

/**
 * Require user to have one of the allowed roles in a group.
 *
 * Examples:
 * requireGroupRole(["member"])
 * requireGroupRole(["treasurer", "chairperson"])
 * requireGroupRole(["chairperson"])
 */
export const requireGroupRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const groupId = resolveGroupId(req);

      if (!userId || !groupId) {
        return res.status(400).json({ message: "Missing user or group" });
      }

      const role = await getMembershipRole(groupId, userId);

      if (!role) {
        return res.status(403).json({ message: "Not a member of this group" });
      }

      req.groupRole = role;
      req.groupId = groupId;

      if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      return next();
    } catch (e) {
      console.error("Role check failed:", e.message);
      return res.status(500).json({ message: "Role check failed" });
    }
  };
};
