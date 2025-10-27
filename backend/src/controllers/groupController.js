import { createGroup, getAllGroups, getGroupById } from "../models/groupModel.js";

// POST /api/groups
export const addGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const created_by = req.user.id;

    const group = await createGroup(name, description, created_by);
    res.status(201).json(group);
  } catch (error) {
    console.error("Create group error:", error.message);
    res.status(500).json({ message: "Failed to create group" });
  }
};

// GET /api/groups
export const listGroups = async (req, res) => {
  try {
    const groups = await getAllGroups();
    res.json(groups);
  } catch (error) {
    console.error("List groups error:", error.message);
    res.status(500).json({ message: "Failed to fetch groups" });
  }
};

// GET /api/groups/:id
export const getGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await getGroupById(id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch (error) {
    console.error("Get group error:", error.message);
    res.status(500).json({ message: "Failed to fetch group" });
  }
};
