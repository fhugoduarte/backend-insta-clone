const Post = require("../models/Post");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

module.exports = {
  async index(req, res) {
    const post = await Post.find().sort("-createdAt");

    return res.json(post);
  },

  async store(req, res) {
    const { author, place, description, hashtags } = req.body;

    const file = req.files[0];
    const { originalname: image } = file;
    const [name] = image.split(".");
    const fileName = `${name}.jpg`;

    await sharp(file.path)
      .resize(500)
      .jpeg({ quality: 70 })
      .toFile(path.resolve(file.destination, "resized", fileName));

    fs.unlinkSync(file.path);

    const post = await Post.create({
      author,
      place,
      description,
      hashtags,
      image: fileName
    });

    req.io.emit("post", post);

    return res.json(post);
  }
};
