async function selectroom(req, res) {
  const { selectedValue } = req.body;

  console.log(selectedValue);
  res
    .status(200)
    .json({ message: "Data received successfully", selectedValue });
}

module.exports = {
  selectroom,
};
