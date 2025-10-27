import { joinGroup, leaveGroup, getGroupMembers } from "../models/membershipModel.js";

// POST /api/memberships/join/:group_id
export const join = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { group_id } = req.params;

    const membership = await joinGroup(user_id, group_id);
    res.status(201).json({ message: "Joined group successfully", membership });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ message: "Already a member of this group" });
    }
    console.error("Join group error:", error.message);
    res.status(500).json({ message: "Failed to join group" });
  }
};

// DELETE /api/memberships/leave/:group_id
export const leave = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { group_id } = req.params;

    const membership = await leaveGroup(user_id, group_id);
    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }
    res.json({ message: "Left group successfully" });
  } catch (error) {
    console.error("Leave group error:", error.message);
    res.status(500).json({ message: "Failed to leave group" });
  }
};

// GET /api/memberships/group/:group_id
export const listMembers = async (req, res) => {
  try {
    const { group_id } = req.params;
    const members = await getGroupMembers(group_id);
    res.json(members);
  } catch (error) {
    console.error("Get group members error:", error.message);
    res.status(500).json({ message: "Failed to fetch members" });
  }
};
