Todos = new Meteor.Collection('todos');

if (Meteor.isClient) {
  //Subscribe to todos
  Meteor.subscribe('todos');
  //Helpers that run the TodosPanel
  Template.TodosPanel.helpers({
    //A helper that finds the todo Items for {{#each}}
    items: function () {
      return Todos.find({}, {
        //sort the todos in descending order relating to their date
        sort: {
          created_at: -1
        }
      });
    },
//a function to assign the class of 'done' to TodoItem
    isDoneClass: function (){
      return this.is_done ? 'done' : '';
    }
  });
  Template.TodoItem.helpers({
    //Returns 'checked' if item is done, else ''
    isDoneChecked: function () {
      return this.is_done ? 'checked' : '';
    }
  });

  Template.TodoItem.events({
    //Responds to click event where [name=is_done], e is event object, tmpl is template
    'click [name=is_done]': function (e, tmpl){
      //this points to data context, the particular TodoItem
      var id = this._id;
      //Similar to jQuery .find(), look for element of type input and see whether or not it is checked
      var isDone = tmpl.find('input').checked;
      //update data where _id = var id
      Todos.update({_id: id}, {
        //use mongo $set modifier to set is_done = var isDone boolean
        $set: {
          is_done:isDone
        }
      });
    }
  });
  Template.CreateTodoItem.events({
    //responding to 'submit form' event
    'submit form': function (e, tmpl){
      //prevents default of browser posting back server on form submit
      e.preventDefault();
      //look for element of type 'input' and grab its value
      var subject = tmpl.find('input').value;
      //Todos insert method with the following properties, not is_done default is false
      Todos.insert({
        subject: subject,
        created_at: new Date,
        is_done: false,
        user_id: Meteor.userId()
      });
      //grab form and clear it
      var form = tmpl.find('form');
      form.reset();
    }
  });

  Template.TodosCount.helpers({
    //Returns a count of the TodoItems that are done
    completedCount: function () {
      return Todos.find({is_done: true}).count();
    },
    totalCount: function () {
      //Returns a count of the total TodoItems
      return Todos.find({}).count();
    }
  });
}

if (Meteor.isServer) {
  //Publish todos, made up of Todos.find();
  Meteor.publish('todos', function() {
    return Todos.find({user_id: this.userId});
  });
  //if userId is truthy, user logged in, then they can add todo
  Todos.allow({
    insert: function (userId, doc) {
      return userId;
    },
    update: function (userId, doc, fieldNames, modifier) {
      return doc.user_id ===userId;
    },
    remove: function (userId, doc){
      return doc.user_id ===userId;
    }
  });
}
