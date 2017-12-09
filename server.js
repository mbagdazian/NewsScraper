var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
var request = require("request");
var cheerio = require("cheerio");

mongoose.Promise = Promise;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static("public"));

// mongoose.connect("mongodb://localhost/week18day3mongoose");
mongoose.connect("mongodb://heroku_n4crqrg5:hfbag41l40kannarbsppipf0ch@ds133856.mlab.com:33856/heroku_n4crqrg5");
var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});

app.get("/scrape", function(req, res) {

  request("https://www.nytimes.com/section/technology", function(error, response, html) {
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2.headline").each(function(i, element) {

      var result = {};

      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      var entry = new Article(result);

      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(doc);
        }
      });

    });
  });
  console.log("Scrape Complete");
  res.redirect("/");
});

app.get("/articles", function(req, res) {

  Article.find({}, function(error, doc) {
    if (error) {
      res.send(error);
    }
    else {
      res.send(doc);
    }
  });

});

app.get("/saved", function(req, res) {

  Article.find({saved:'true'}, function(error, doc) {
    if (error) {
      res.send(error);
    }
    else {
      res.send(doc);
    }
  });

});

app.get("/articles/:id", function(req, res) {

  Article.find({_id:req.params.id})
    .populate('Comment')
    .exec(function(error, doc) {
      if (error) {
        res.send(error);
      }
      else {
        res.send(doc);
      }
    });

});

app.post("/articles/:id", function(req, res) {

  Article.find({_id:req.params.id}, {$set:{saved:'true'}}, function(error, doc) {
    if (error) {
      res.send(error);
    }
    else {
      res.send(doc)
    }
  });

});

app.listen(3000, function() {
  console.log("App running on port 3000!");
});
