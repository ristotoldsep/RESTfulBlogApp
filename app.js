const express          = require("express"),
	  app              = express(),
  	  bodyParser       = require("body-parser"),
	  mongoose         = require("mongoose"),
	  methodOverride   = require("method-override"),
	  expressSanitizer = require("express-sanitizer"),
	  port 			   = process.env.PORT || 3000; 

// assign mongoose promise library and connect to database
mongoose.Promise = global.Promise;

//APP CONFIG
// mongoose.connect('mongodb://localhost:27017/restful_blog_app', { //connect to a mongoose DB (have to initialize name)
mongoose.connect("mongodb+srv://blogapp.yzgin.mongodb.net/restful_blog_app", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message)); //CALLED PROMISES, had to add with new version of mongoose

app.use(bodyParser.urlencoded({extended: true})); //To get input from form
app.use(express.static("public")); //To use public as main dir for js and css files
app.set("view engine", "ejs"); //Don't have to name files .ejs 
app.use(methodOverride("_method")); //looks for requests with _method and treats it as a PUT/DELETE request!
app.use(expressSanitizer()); //Must come after body-parser for some reason..

//Creating blog data scheme
const blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now} 
});

const Blog = mongoose.model("Blog", blogSchema); //Compiling schema into mongoose model, mongoose will pluralise "Blog"

//JUST TO TEST IF ADDING A BLOG WORKS
// Blog.create({ 
// 	title: "My First Article",
// 	image: "https://jalgpall.ee/images/players/0DF4AC67DE53CF7EDD61025071751B0D",
// 	body: "This is Rix's first article on the topic of Web Development."
// }, (err, blogSchema) => {
// 	if(err)
// 		{
// 			console.log(err);
// 		} else {
// 			console.log("Blog added!");
// 		}
// });

//RESTFUL ROUTES

//ROOT route - it's conventional to redirect root route to INDEX page
app.get("/", (req, res) => {
	res.redirect("/blogs");
});

//INDEX route - display all blogs
app.get("/blogs", (req, res) => {
	Blog.find({}, (err, blogs) => { //find every blog from DB
		if(err) {
			console.log("Error!");
		} else {
			res.render("index", {blogs: blogs});
		}
	});
});

//NEW route - show new blog creation page
app.get("/blogs/new", (req, res) => {
	res.render("new");
});

//CREATE route - create new blog
app.post("/blogs", (req, res) => {
	//console.log(req.body);
	req.body.blog.body = req.sanitize(req.body.blog.body); //Sanitizer for script inputs
	//console.log(req.body);

	Blog.create(req.body.blog, (err, newBlog) => {
		if(err) {
			res.render("new");
		} else {
			res.redirect("/blogs");
		}
	});
});

//SHOW route - show more info on a blog
app.get("/blogs/:id", (req, res) => {
	Blog.findById(req.params.id, (err, foundBlog) => {
		if(err) {
			res.redirect("/blogs");
		} else {
			res.render("show", {blog: foundBlog});
		}
	});
});

//EDIT route - display edit form for existing blog - Combination of NEW and SHOW
app.get("/blogs/:id/edit", (req, res) => {
	Blog.findById(req.params.id, (err, foundBlog) => {
		if(err) {
			console.log("ERROR!");
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: foundBlog});
		}
	});
});

//UPDATE route - PUT request to update edited blog post!
app.put("/blogs/:id", (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body); //SANITIZER for script inputs
	//Blog.findByIdAndUpdate(id, newData, callback)
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
		if(err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

//DESTROY route - delete blog from app
app.delete("/blogs/:id", (req, res) => {
	Blog.findByIdAndRemove(req.params.id, (err) => {
		if(err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	});
});	

app.listen(port, () => {
	console.log("Blog server has started!");
});
