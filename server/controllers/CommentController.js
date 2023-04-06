import CommentModel from '../models/Comment.js';
import PostModel from '../models/Post.js';

export const create = async (req, res) => {
  try {
    const postId = req.params.id;

    const doc = new CommentModel({
      text: req.body.text,
      user: req.userId,
      post: postId,
    });

    PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $push: { comments: doc._id },
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Не удалось создать коментарий',
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
          });
        }
      },
    );

    const comments = await doc.save();
    res.json(comments);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось создать коментарий',
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const comments = await CommentModel.find().populate('user').exec();
    res.json(comments);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить комментарии',
    });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await CommentModel.find({ post: postId }).populate('user').exec();
    res.json(comments);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить комментарии к записи',
    });
  }
};
