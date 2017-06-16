const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost/myapp');
let db = mongoose.connection;

// Check connection to mongodb
db.once('open', function() {
  console.log('Connected to mongodb');
});

// Check for db errors
db.on('error', function(err) {
  console.log(err);
});

// Init app
const app = express();

// Bring in models
let Article = require('./models/article');

// Load view engine
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'pug');

// body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Home route
app.get('/', function(req, res) {
  Article.find({}, function(err, articles) {
    if(err) {
      console.log(err);
    } else {
      res.render('index', {
        title: 'Articles',
        articles: articles
      });
    }
  });
});

// Add route
app.get('/articles/add', function(req, res) {
  res.render('add_article', {
    title: 'Add article'
  });
});

// Add submit POST route
app.post('/articles/add', function(req, res) {
  let article = new Article();
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  article.save(function(err) {
    if(err){
      console.log(err);
      return;
    } else {
      res.redirect('/');
    }
  });
  return;
});

// Get single article
app.get('/article/:id', function(req, res) {
  Article.findById(req.params.id, function(err, article) {
    res.render('article', {
      article:article
    });
  });
});

// Load edit form
app.get('/article/edit/:id', function(req, res) {
  Article.findById(req.params.id, function(err, article) {
    res.render('edit_article', {
      title:'Edit article',
      article:article
    });
  });
});

// Edit submit POST
app.post('/articles/edit/:id', function(req, res) {
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id}

  Article.update(query, article, function(err) {
    if(err){
      console.log(err);
      return;
    } else {
      res.redirect('/');
    }
  });
});

// DELETE
app.delete('/articles/:id', function(req, res){
  let query = {_id:req.params.id}

  Article.remove(query, function(err) {
    if(err) {
      console.log(err);
    }
    res.send('Success!');
  })
});

// Start server
app.listen(2000, function() {
  console.log("Server started on port 2000...");
});
