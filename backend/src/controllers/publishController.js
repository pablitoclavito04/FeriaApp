require('dotenv').config();
const octokit = require('../config/octokit');
const Fair = require('../models/Fair');
const Caseta = require('../models/Caseta');
const Menu = require('../models/Menu');
const Concert = require('../models/Concert');
const fs = require('fs');
const path = require('path');

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const branch = 'gh-pages';

// Helper to upload a file to GitHub
const uploadFile = async (filePath, content, isBase64 = false) => {
  const contentBase64 = isBase64 ? content : Buffer.from(content).toString('base64');

  let sha;
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path: filePath, ref: branch });
    sha = data.sha;
  } catch (err) {
    if (err.status !== 404) {
      throw err;
    }
  }

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message: sha ? `Update ${filePath}` : `Create ${filePath}`,
    content: contentBase64,
    ...(sha && { sha }),
    branch,
  });
};

// Helper to upload images from uploads folder
const uploadImages = async () => {
  const uploadsDir = path.join(__dirname, '../../uploads');
  
  if (!fs.existsSync(uploadsDir)) return;
  
  const files = fs.readdirSync(uploadsDir);
  
  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    const fileContent = fs.readFileSync(filePath);
    const base64Content = fileContent.toString('base64');
    await uploadFile(`uploads/${file}`, base64Content, true);
  }
};

// @desc    Generate static files and push to GitHub Pages
// @route   POST /api/publish
// @access  Private
const publish = async (req, res) => {
  try {
    // Get all data from MongoDB
    const fairs = await Fair.find();
    const casetas = await Caseta.find().populate('fair', 'name');
    const menus = await Menu.find().populate('caseta', 'name number');
    const concerts = await Concert.find().populate('caseta', 'name number');

    // Generate JSON data files
    await uploadFile('data/fairs.json', JSON.stringify(fairs, null, 2));
    await uploadFile('data/casetas.json', JSON.stringify(casetas, null, 2));
    await uploadFile('data/menus.json', JSON.stringify(menus, null, 2));
    await uploadFile('data/concerts.json', JSON.stringify(concerts, null, 2));

    // Upload images
    await uploadImages();

    res.json({ message: 'Published successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error publishing to GitHub Pages' });
  }
};

module.exports = { publish };