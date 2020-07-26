//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true });

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemSchema = {
  name: String
}

const Item = mongoose.model("item", itemSchema);

const item1 = new Item({
  name: "Welcome to your Todolist"
});

const item2 = new Item({
  name: "Hit + to add new item to list"
});

const item3 = new Item({
  name: "<-- Hit checkbox to delete item from list"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items : [itemSchema]
}

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
  
  Item.find({}, function(err, foundItem){
    if(foundItem.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Inserted");
        }
      });
    res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItem});
    }
  })

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
 
});

app.post("/delete", function(req,res){
  const deleteItem = req.body.checkBox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(deleteItem , function(err){
      if(!err){
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deleteItem}}}, function(err){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }  
});

app.get("/:title", function(req,res){
  const listTitle = _.capitalize(req.params.title);

  List.findOne({name:listTitle}, function(err, foundlist){
    if(!err){
      if(!foundlist){
        const list = new List({
          name: listTitle,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + listTitle);
      }else{
        res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items });
      }
    }
  });
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
