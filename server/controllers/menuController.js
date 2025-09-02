const Menu = require('../models/Menu');

exports.getMenus = async (req, res) => {
  try {
    const menus = await Menu.find();
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addMenu = async (req, res) => {
  try {
    const { title, href, icon, children } = req.body;

    // Basic validation (you can expand this as needed)
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required and must be a string.' });
    }
    if (href && typeof href !== 'string') {
      return res.status(400).json({ error: 'Href must be a string.' });
    }
    if (icon && typeof icon !== 'string') {
      return res.status(400).json({ error: 'Icon must be a string.' });
    }
    // children can be any structure; optionally validate recursively

    const newMenu = new Menu({ title, href, icon, children });
    await newMenu.save();

    res.status(201).json(newMenu);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
