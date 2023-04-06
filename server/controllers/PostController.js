import PostModel from '../models/Post.js';
import CommentModel from '../models/Comment.js';

export const getAllTags = async (req, res) => {
  try {
    const posts = await PostModel.find().exec();
    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .filter(Boolean);
    var unique = [...new Set(tags)];
    res.json(unique);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить теги',
    });
  }
};

export const getPostsByTag = async (req, res) => {
  try {
    const tag = req.params.name;
    const posts = await PostModel.find({ tags: tag }).populate('user').exec();
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи тега',
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().sort({ createdAt: -1 }).populate('user').exec();
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статью',
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        returnDocument: 'after',
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Не удалось вернуть статью',
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
          });
        }

        res.json(doc);
      },
    ).populate('user');
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;
    CommentModel.deleteMany(
      {
        post: postId,
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Не удалось удалить комментарий',
          });
        }
        if (!doc) {
          return res.status(404).json({
            message: 'Комментарий не найден',
          });
        }
      },
    );

    PostModel.findOneAndDelete(
      {
        _id: postId,
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Не удалось удалить статью',
          });
        }
        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
          });
        }
      },
    );
    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статью',
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags.split(/[,.;:]/g).filter(Boolean),
      user: req.userId,
    });

    const posts = await doc.save();

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось создать статью',
    });
  }
};

export const update = async (req, res) => {
  try {
    const postsId = req.params.id;
    await PostModel.updateOne(
      {
        _id: postsId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        user: req.userId,
        tags: req.body.tags.split(/[,.;:]/g).filter(Boolean),
      },
    );
    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить статью',
    });
  }
};

export const sortByViews = async (req, res) => {
  try {
    const posts = await PostModel.find().sort({ viewsCount: -1 }).populate('user').exec();
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось отсортировать посты',
    });
  }
};
