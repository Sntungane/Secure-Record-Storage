import express from 'express';
import { Note } from '../../models/index.js';
import { authMiddleware } from '../../utils/auth.js';

const router = express.Router();

router.use(authMiddleware);

// GET all notes for logged-in user
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/notes user:', req.user);

    const notes = await Note.find({ user: req.user._id });
    res.json(notes);
  } catch (err) {
    console.log('GET NOTES ERROR:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST create note
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/notes req.user:', req.user);
    console.log('POST /api/notes req.body:', req.body);

    const note = await Note.create({
      title: req.body.title,
      content: req.body.content,
      user: req.user._id,
    });

    res.status(201).json(note);
  } catch (err) {
    console.log('CREATE NOTE ERROR:', err);
    res.status(400).json({ message: err.message, error: err });
  }
});

// PUT update note
router.put('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'No note found with this id!' });
    }

    if (note.user.toString() !== req.user._id) {
      return res.status(403).json({
        message: 'User is not authorized to update this note.',
      });
    }

    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updatedNote);
  } catch (err) {
    console.log('UPDATE NOTE ERROR:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'No note found with this id!' });
    }

    if (note.user.toString() !== req.user._id) {
      return res.status(403).json({
        message: 'User is not authorized to delete this note.',
      });
    }

    await Note.findByIdAndDelete(req.params.id);

    res.json({ message: 'Note deleted!' });
  } catch (err) {
    console.log('DELETE NOTE ERROR:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;