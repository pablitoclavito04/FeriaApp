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

// Local mirror of the published data, served by nginx at /data on feriaapp.com
// so the public web can be served from our own server, not only from GitHub
// Pages. Lives inside the uploads volume so it persists across restarts.
const uploadsDir = path.join(__dirname, '../../uploads');
const publicDataDir = path.join(uploadsDir, 'public-data');

// Write one JSON file to the local public-data mirror.
const writeLocalData = (fileName, content) => {
  if (!fs.existsSync(publicDataDir)) {
    fs.mkdirSync(publicDataDir, { recursive: true });
  }
  fs.writeFileSync(path.join(publicDataDir, fileName), content);
};

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
  if (!fs.existsSync(uploadsDir)) return;

  const files = fs.readdirSync(uploadsDir);

  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    // Skip the public-data mirror folder; only image files belong on Pages.
    if (fs.statSync(filePath).isDirectory()) continue;
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

    // Serialize once, then publish to both targets.
    const fairsJson = JSON.stringify(fairs, null, 2);
    const casetasJson = JSON.stringify(casetas, null, 2);
    const menusJson = JSON.stringify(menus, null, 2);
    const concertsJson = JSON.stringify(concerts, null, 2);

    // Generate JSON data files on GitHub Pages
    await uploadFile('data/fairs.json', fairsJson);
    await uploadFile('data/casetas.json', casetasJson);
    await uploadFile('data/menus.json', menusJson);
    await uploadFile('data/concerts.json', concertsJson);

    // Mirror the same JSON locally so feriaapp.com (served by our nginx) shows
    // the published data too. The images already live in the uploads volume.
    writeLocalData('fairs.json', fairsJson);
    writeLocalData('casetas.json', casetasJson);
    writeLocalData('menus.json', menusJson);
    writeLocalData('concerts.json', concertsJson);

    // Upload images to GitHub Pages
    await uploadImages();

    res.json({ message: 'Published successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error publishing to GitHub Pages' });
  }
};

module.exports = { publish };