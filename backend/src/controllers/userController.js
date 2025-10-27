export const getUsers = (req, res) => {
  const users = [
    { id: 1, name: "Robert Matiwa" },
    { id: 2, name: "Tendai Matiwa" },
    { id: 3, name: "Jude Matiwa" },
  ];
  res.json(users);
};
