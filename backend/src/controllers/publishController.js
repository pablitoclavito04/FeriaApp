require('dotenv').config();
const octokit = require('../config/octokit');
const Fair = require('../models/Fair');
const Caseta = require('../models/Caseta');
const Menu = require('../models/Menu');
const Concert = require('../models/Concert');

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const branch = 'gh-pages';

// Helper to upload a file to GitHub
const uploadFile = async (path, content) => {
  const contentBase64 = Buffer.from(content).toString('base64');

  try {
    // Check if file already exists
    const { data } = await octokit.repos.getContent({ owner, repo, path, ref: branch });
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Update ${path}`,
      content: contentBase64,
      sha: data.sha,
      branch,
    });
  } catch {
    // File does not exist, create it
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Create ${path}`,
      content: contentBase64,
      branch,
    });
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

    res.json({ message: 'Published successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error publishing to GitHub Pages' });
  }
};

module.exports = { publish };