import express from 'express';
import multer from 'multer';
import cors from 'cors';
import mongoose from 'mongoose';

import {
  registerValidation,
  loginValidation,
  postCreateValidation,
  commentCreateValidation,
} from './validations.js';
import { checkAuth, handleValidationErrors } from './utils/index.js';
import { UserController, PostController, CommentController } from './controllers/index.js';

mongoose
  .connect('mongodb://127.0.0.1:27017/PocketMentor')
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('Error connecting', err));

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, 'uploads/images');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/images/${req.file.originalname}`,
  });
});

app.get('/tags', PostController.getAllTags);
app.get('/tags/:name', PostController.getPostsByTag);

app.get('/comments', CommentController.getAll);
app.get('/posts/:id/comment', CommentController.getPostComments);
app.post('/posts/:id/comment', checkAuth, commentCreateValidation, CommentController.create);

app.get('/posts/sort/views', PostController.sortByViews);
app.get('/posts', PostController.getAll);
app.get('/posts/tags', PostController.getAllTags);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update,
);

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('Server OK');
});
