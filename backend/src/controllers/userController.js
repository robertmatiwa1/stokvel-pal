// controllers/userController.js

// GET /api/users
export const getUsers = (req, res) => {
  const users = [
    { id: 1, name: "Robert Matiwa" },
    { id: 2, name: "Tendai Matiwa" },
    { id: 3, name: "Lilitha Matiwa" },
  ];
  res.json(users);
};

// GET /api/users/profile
export const getProfile = async (req, res) => {
  try {
    // The token middleware attaches the decoded user to req.user
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT id, username, email, created_at FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Profile fetch error:", error.message);
    res.status(500).json({ message: "Could not fetch profile" });
  }
};
