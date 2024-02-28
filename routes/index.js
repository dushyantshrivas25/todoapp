var express = require('express');
var router = express.Router();

const UserModel = require("../models/userModel")
const TodoModel = require("../models/todoModel");
const fs = require("fs")

const upload = require("../utils/multer")
const {sendmail} = require("../utils/mail")
const passport = require("passport")
const LocalStrategy = require("passport-local")
passport.use(new LocalStrategy(UserModel.authenticate()))

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Homepage',user:req.user });
});

router.get("/signup",function(req,res,next){
  res.render("signup",{title:"signup-page",user:req.user})
})

router.post("/signup",async function(req,res,next){
try {
  const {username,password,email} = req.body;
  const newuser = new UserModel({username,email})
  const user = await UserModel.register(newuser,password)
res.redirect("/signin")
} catch (error) {
  res.send(error)
}
})

router.get("/signin",function(req,res,next){
res.render("signin",{title:"signin-page",user:req.user})
})

router.post("/signin",
  passport.authenticate("local", { failureRedirect: "/signin",
   successRedirect: "/home",
  }),
  function (req, res, next) {}
);




router.get('/home',isLoggedIn, async function(req, res, next) {
  try {
    console.log(req.user);
    // const users = await UserModel.find();
    // res.render('home', { title: 'Homepage', users, user:req.user });

    const { todos } = await req.user.populate("todos");
    console.log(todos);
    res.render("home", { title: "Homepage", todos, user: req.user });
  } catch (error) {
    res.send(error)
  }
  });
  
  router.get("/profile", isLoggedIn, async function (req, res, next) {
    try {
        res.render("profile", { title: "Profile", user: req.user });
    } catch (error) {
        res.send(error);
    }
  });
  
  
  router.post(
    "/avatar",
    upload.single("avatar"),
    isLoggedIn,
    async function (req, res, next) {
        try {
            if (req.user.avatar !== "default.jpg") {
                fs.unlinkSync("./public/images/" + req.user.avatar);
            }
            req.user.avatar = req.file.filename;
            req.user.save();
            res.redirect("/profile");
        } catch (error) {
            res.send(error);
        }
    }
  );
  
  
  
  router.get("/signout", isLoggedIn, async function (req, res, next) {
    req.logout(() => {
        res.redirect("/signin");
    });
  });
  
  
  
  router.get('/signup', function(req, res, next) {
    res.render('signup', { title: 'signup',user: req.user });
  });
  // router.post('/signup', async function(req, res, next) {
  // try {
  //   const newuser = new User(req.body);
  //   await newuser.save();
  //   res.redirect("/signin")
   
  // } catch (error) {
  //   res.send(error);
  // }
  
  router.post("/signup", async function (req, res, next) {
    try {
        const { username, email,password } = req.body;
  
        const newuser = new UserModel({ username, email });
  
        const user = await UserModel.register(newuser, password);
  
        // await newuser.save();
        res.redirect("/signin");
    } catch (error) {
        res.send(error.message);
    }
  });
  
  
  // router.post("/signup",async function(req,res,next){
  // try{
  //   const newuser = UserModel(req.body)
  //   await newuser.save();
  //   res.redirect("/signin")
  // }
  // catch(error){
  //     res.send(error)
  // }
  // })
  //  const newuser = new User(req.body);
  //  newuser 
  //  .save()
  //  .then(() => res.redirect("/signin"))
  //  .catch((err) => res.send(err));
  // });
  
  router.get("/get-email",function(req,res,next){
    res.render("get-email",{title:"get-email",user: req.user})
  })
  
  router.get('/delete/:id', async function(req, res, next) {
    try {
      await UserModel.findByIdAndDelete(req.params.id)
   res.redirect("/profile")
    } catch (error) {
      res.send(error)
    }
    
    });
  
    /*router.get('/update/:userId', async function(req, res, next) {
     var currentUser = await UserModel.findOne(
      {
        _id:req.params.userId
      }
     )
     res.render("updateUser",{user:currentUser,title:"Edit user"})
      });/*
  
  /*router.post("updateUser/:userId", async function (req,res,next){
        console.log(req.body);
        var currentUser = await UserModel.findOneAndUpdate({_id:req.params.userId},{
          username:req.body.username,
          email:req.body.email,
          password:req.body.password,
        },
        {
          new:true
        })
        res.redirect('/profile')
      } ) */
      
      /*router.post("/updateUser/:userId", async function (req, res, next) {
        console.log(req.body);
        try {
          var currentUser = await UserModel.findOneAndUpdate(
            { _id: req.params.userId },
            {
              username: req.body.username,
              email: req.body.email,
              password: req.body.password,
            },
            { new: true } // Add this option to get the updated document as a result
          );
          res.redirect('/profile');
        } catch (err) {
          // Handle any errors that might occur during the update process
          console.error(err);
          res.status(500).send("Error updating user.");
        }
      });*/
  
  
  
      router.get("/update/:id",async function(req,res,next){
        try {
          const user = await UserModel.findById(req.params.id)
          res.render("update",{title:"update",User,user: req.user})
          
        } catch (error) {
          res.send(error)
        }
      });
  
      router.post("/update/:id",async function(req,res,next){
        try {
          await UserModel.findByIdAndUpdate(req.params.id,req.body);
          res.redirect("/profile")
        } catch (error) {
          res.send(error)
        }
      })
  
      router.post("/get-email", async function (req, res, next) {
        try {
            const user = await UserModel.findOne({ email: req.body.email });
    
            if (user === null) {
                return res.send(
                    `User not found. <a href="/get-email">Forget Password</a>`
                );
            }
            sendmail(req, res, user);
        } catch (error) {
            res.send(error);
        }
    });
    
      router.get("/change-password/:id",function (req,res,next){
        res.render("change-password",{
          title:"change-password",
          id:req.params.id,
          user: null
        })
      })
  
      router.post("/change-password/:id", async function (req, res, next) {
        try {
            const user = await UserModel.findById(req.params.id);
            if (user.passwordResetToken === 1) {
                await user.setPassword(req.body.password);
                user.passwordResetToken = 0;
            } else {
                res.send(
                    `link expired try again <a href="/get-email">Forget Password</a>`
                );
            }
            await user.save();
    
            res.redirect("/signin");
        } catch (error) {
            res.send(error);
        }
    });
    
  // router.get("/reset/:id", function (req,res,next){
  //   res.render("reset",{title:"Reset password",id:req.params.id})
  // });
  
  router.get("/reset/:id",isLoggedIn, function(req,res,next){
      res.render("reset",{title:"reset password",id:req.params.id,user: req.user})
  });
  
  
  router.post("/reset/:id",async function (req,res,next){
    try {
      await req.user.changePassword(req.body.oldpassword,req.body.password)
      await req.user.save();
     
     res.redirect("/profile")
    } catch (error) {
      res.send(error)
    }
  })
  
  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/signin");
  }
  
  


  router.get("/createtodo", isLoggedIn, async function (req, res, next) {
    res.render("createtodo", {
        title: "Create Todo",
        user: req.user,
    });
});

router.post("/createtodo", isLoggedIn, async function (req, res, next) {
    try {
        const todo = new TodoModel(req.body);
        todo.user = req.user._id;
        req.user.todos.push(todo._id);
        await todo.save();
        await req.user.save();
        res.redirect("/home");
    } catch (error) {
        res.send(error);
    }
});

router.get("/updatetodo/:id",isLoggedIn, async function(req,res,next){
  try {
    const todo = await TodoModel.findById(req.params.id);
    res.render("updatetodo",{
      title:"update-todo",
      user:req.user,
      todo
    })
  } catch (error) {
    res.send(error)
  }
})
  
router.post("/updatetodo/:id",isLoggedIn ,async function(req,res,next){
try {
 await TodoModel.findByIdAndUpdate(req.params.id,req.body)

  res.redirect("/home")
} catch (error) {
  res.send(error)
}
})

router.get("/deletetodo/:id",async function(req,res,next){
try {
  await TodoModel.findByIdAndDelete(req.params.id);
  res.redirect("/home");
} catch (error) {
  rs.send(error)
}
})
module.exports = router;
