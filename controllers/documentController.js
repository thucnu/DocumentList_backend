const Document = require("../models/Document");

exports.createDocument = async (req, res) => {
  try {
    let data = { ...req.body, owner: req.user.userId };
    if (data.path) {
      const filename = data.path.split("/").pop().split("\\").pop();
      data.path = `uploads/${filename}`;
    }
    const doc = new Document(data);
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ owner: req.user.userId });
    res.json(docs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    await Document.deleteOne({ _id: req.params.id, owner: req.user.userId });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
