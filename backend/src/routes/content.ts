import express from 'express';
import Content from '../models/Content';
import { auth } from '../middleware/auth';

const router = express.Router();

// Add new content item
router.post('/', auth, async (req, res) => {
  try {
    const { url, title, type, source, summary, thumbnail, tags, isPublic } = req.body;

    // Check if content already exists for this user
    const existingContent = await Content.findOne({ user: req.user._id, url });
    if (existingContent) {
      return res.status(400).json({ message: 'Content already exists in your list' });
    }

    const newContent = new Content({
      user: req.user._id,
      url,
      title,
      type,
      source,
      summary,
      thumbnail,
      tags: tags || [],
      isPublic: isPublic !== undefined ? isPublic : true,
    });

    await newContent.save();
    res.status(201).json(newContent);
  } catch (error) {
    console.error('Add content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's content items
router.get('/me', auth, async (req, res) => {
  try {
    const contents = await Content.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(contents);
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get public content items for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const contents = await Content.find({ 
      user: req.params.userId,
      isPublic: true 
    }).sort({ createdAt: -1 });
    
    res.json(contents);
  } catch (error) {
    console.error('Get user content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update content item
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, summary, tags, isPublic } = req.body;
    const updates: any = {};

    if (title) updates.title = title;
    if (summary) updates.summary = summary;
    if (tags) updates.tags = tags;
    if (isPublic !== undefined) updates.isPublic = isPublic;

    const content = await Content.findOne({ _id: req.params.id, user: req.user._id });
    if (!content) {
      return res.status(404).json({ message: 'Content not found or not authorized' });
    }

    const updatedContent = await Content.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    res.json(updatedContent);
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete content item
router.delete('/:id', auth, async (req, res) => {
  try {
    const content = await Content.findOne({ _id: req.params.id, user: req.user._id });
    if (!content) {
      return res.status(404).json({ message: 'Content not found or not authorized' });
    }

    await Content.findByIdAndDelete(req.params.id);
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get feed (content from users you follow)
router.get('/feed', auth, async (req, res) => {
  try {
    const user = await req.user.populate('following');
    const followingIds = user.following.map((user: any) => user._id);

    const contents = await Content.find({
      user: { $in: followingIds },
      isPublic: true
    })
    .sort({ createdAt: -1 })
    .limit(50);
    
    res.json(contents);
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;