import { joinGroup, leaveGroup, getGroupMembers, getMembershipRole } from "../models/membershipModel.js";

export const getMyRoleInGroup = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { groupId } = req.params;

    if (!userId || !groupId) {
      return res.status(400).json({ error: "Missing user or group" });
    }

    const role = await getMembershipRole(groupId, userId);

    if (!role) {
      return res.status(403).json({ error: "Not a member of this group" });
    }

    return res.json({ role });
  } catch (error) {
    console.error("Get my role error:", error.message);
    return res.status(500).json({ message: "Failed to fetch role" });
  }
};

// POST /api/memberships/join/:group_id
export const join = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { group_id } = req.params;

    if (!userId || !group_id) {
      return res.status(400).json({ message: "Missing user or group" });
    }

    // IMPORTANT: membershipModel.joinGroup signature is (groupId, userId)
    const result = await joinGroup(group_id, userId);

    if (result?.status === "already_member") {
      return res.status(200).json({
        status: "already_member",
        message: "Already a member of this group",
        membership: result.membership
      });
    }

    return res.status(201).json({
      status: "joined",
      message: "Joined group successfully",
      membership: result?.membership ?? null
    });
  } catch (error) {
    console.error("Join group error:", error.message);
    return res.status(500).json({ message: "Failed to join group" });
  }
};

// DELETE /api/memberships/leave/:group_id
export const leave = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { group_id } = req.params;

    if (!userId || !group_id) {
      return res.status(400).json({ message: "Missing user or group" });
    }

    // membershipModel.leaveGroup signature is (groupId, userId)
    const membership = await leaveGroup(group_id, userId);

    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    return res.json({ message: "Left group successfully" });
  } catch (error) {
    console.error("Leave group error:", error.message);
    return res.status(500).json({ message: "Failed to leave group" });
  }
};

// GET /api/memberships/group/:group_id
export const listMembers = async (req, res) => {
  try {
    const { group_id } = req.params;

    if (!group_id) {
      return res.status(400).json({ message: "Missing group" });
    }

    const members = await getGroupMembers(group_id);
    return res.json(members);
  } catch (error) {
    console.error("Get group members error:", error.message);
    return res.status(500).json({ message: "Failed to fetch members" });
  }
};
