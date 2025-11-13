// routes/bookmarks.js
import express from 'express';
import  authMiddleware  from '../middleware/authMiddleware.js';
import Bookmark from '../models/Bookmark.js'; // Mongoose model

const router = express.Router();

// Get current user's bookmarks
router.get('/bookmark', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const bookmarks = await Bookmark.find({ userId });
  res.json(bookmarks);
});

// Add a bookmark
router.post('/bookmark', authMiddleware, async (req, res) => {
  const { destinationId } = req.body;
  const userId = req.user.id;

  // Avoid duplicates
  let bookmark = await Bookmark.findOne({ userId, destinationId });
  if (!bookmark) {
    bookmark = new Bookmark({ userId, destinationId });
    await bookmark.save();
  }
  res.json(bookmark);
});

// Remove a bookmark
router.delete('/:destinationId', authMiddleware, async (req, res) => {
  const { destinationId } = req.params;
  const userId = req.user.id;
  await Bookmark.findOneAndDelete({ userId, destinationId });
  res.json({ success: true });
});

export default router;
