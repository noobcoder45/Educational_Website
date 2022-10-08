const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const fs = require('fs');
const path =require('path');
const app=express();
const multer = require("multer");
mongoose.connect('mongodb://localhost:27017/coachingDB',{useNewUrlParser: true});

const storage = multer.diskStorage({ destination:function(req, file, cb){
  var dir="";
  console.log("yup");
  console.log(file.fieldname[0]);
  if(file.fieldname[0]==="d"){
    dir="./doubts/"+file.fieldname;
  }
  else{
  dir="./uploads/"+file.fieldname;
  }
  cb(null,dir);
},
filename: function(req, file, cb){
  if(file.fieldname[0]==='d'){
    cb(null,fieldname.slice(5))
  }
  else{cb(null,file.originalname);}
}});
const upload_doubt=multer({
  storage:storage,
//  limits:{fileSize: 10},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
});
const upload=multer({
  // use `props.header`
  storage:storage,
//  limits:{fileSize: 10},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).any();
function checkFileType(file, cb){
  const filetypes= /jpeg|jpg|png|gif|pdf/;
  const extname= filetypes.test(path.extname(file.originalname));
  const mimetype=filetypes.test(file.mimetype);
  if(mimetype && extname){
    return cb(null, true);
  }
  else{
    cb('Error: Images Only!');
  }
}
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine','ejs');
const meetingSchema=new mongoose.Schema(
  { group:Number,
    students:Array,
    link:String,
    time:String,
    date:Date,
    description:String
  }
);
const doubtSchema=new mongoose.Schema(
  {
    asker:String,
    route:String,
    Subject:String,
    Chapter:String,
    type:String,
    description:String,
  }
);
const answerSchema=new mongoose.Schema(
  {
    answerer:String,
    route:String,
    answer:String
  }
);
const accountSchema=new mongoose.Schema({
  Name:String,
  Phone:Number,
  Password:String,
  College:String,
  Email:String,
  Class:Number
});
const teacherSchema=new mongoose.Schema({
  name:String,
  subjects:Array,
  number:Number,
  Email:String,
  Password:String
});
const invitecodeSchema=new mongoose.Schema({
  type:String,
  code:String
});
const Teacher=new mongoose.model("Teacher",teacherSchema);
const Answer=new mongoose.model("Answer",answerSchema);
const Doubt=new mongoose.model("Doubt",doubtSchema);
const Meeting=new mongoose.model("Meeting",meetingSchema);
const Account=new mongoose.model("Account",accountSchema);
const Invite=new mongoose.model("Invite",invitecodeSchema);
//client
app.get("/",function(req,res){
  res.redirect("/signin");
})
app.post("/not_member",function(req,res){res.redirect("/registration")});
app.post("/91515566012/not_member",function(req,res){res.redirect("/91515566012/registration")});
app.get("/homepage/:id",function(req,res){
  Account.findOne({_id:req.params.id},function(err,found){
      if(err){
        res.send(err);
      }
      else{
      const p=found.Name;
      res.render("Student_Home",{name:p,id:req.params.id});
    }
  })
});
app.get("/registration",function(req,res){
  res.render("registration",{admin:false,incorrect:false});
});
app.post("/register",function(req,res){
  if(req.body.Password===req.body.Repassword){
    const account=new Account({
      Name:req.body.Name,
      Phone:req.body.Phone,
      Password:req.body.Password,
      Email:req.body.Email,
      College:req.body.College,
      Class:req.body.Class
    })
    account.save();
    res.render("signin",{admin:false,incorrect:false});
  }
  else{
    res.render("registration",{admin:false,incorrect:true});
}
})
app.get("/signin",function(req,res){
  res.render("signin",{admin:false,incorrect:false});
})
app.post("/sign",function(req,res){
  Account.findOne({Email:req.body.email},function(err,found){
    if(err){
    res.send(err);
    }
    else{
      if(found.Password===req.body.password){
        res.redirect("/homepage/"+found.id);
      }
      else{
        res.render("signin",{admin:false,incorrect:true})
      }
    }
  })
})
app.get("/91515566012",function(req,res){
  res.render("signin",{admin:true,incorrect:false});
})
app.post("/91515566012/sign",function(req,res){
  Teacher.findOne({Email:req.body.email},function(err,found){
    if(err){
    res.send(err);
    }
    else{
      if(found.Password===req.body.password){
        res.redirect("/91515566012/admin/"+found.id);
      }
        else{
          res.render("signin",{admin:true,incorrect:true})
      }
    }
  })
})
app.post("/91515566012/register",function(req,res){
  if(req.body.Password===req.body.Repassword){
    const teacher=new Teacher({
      Name:req.body.Name,
      Phone:req.body.Phone,
      Password:req.body.Password,
      Email:req.body.Email,
      subjects:req.body.subjects
    })
    teacher.save();
    res.render("signin",{admin:true,incorrect:false});
  }
  else{
    res.render("registration",{admin:true,incorrect:true});
  }
})
app.get("/91515566012/registration",function(req,res){
  res.render("registration",{admin:true,incorrect:false});
})

//going to chapter page
let physics_chapters=["Vectors","Kinematics","NLM","Work Power Energy","System of particles","Rotational Dynamics","Fluid Mechanics","Elasticity","SHM","Waves","Sound","Thermal Properties","Thermodynamics","Wave Optics","Ray Optics","Electrostatics","Capacitors","Current ELectricity","Magnetism","EMI","Photo Electric effect","Atomic Structure","Nuclear Physics"];
let maths_chapters=["Equations","Matrices","Determinants","Complex Numbers","P&C","Binomial Theorem","Probability","Trigo","Inverse Trigo","POT","Straight Lines","Parabola","Cirlce","Ellipse","Hyperbola","Functions","Limits C&D","AOD","Indefinite Integrations","Definite Integrations","Areas","Differential Equations"];
let chemistry_chapters=[  ];
app.get("/maths/:id",function(req,res){
  res.render("Subject",{Subject:"Mathematics",chapters:maths_chapters,admin:false,id:req.params.id}) ;
});

app.post("/maths/:id", function(req,res){
  res.redirect("/maths/"+req.params.id);
});
app.get("/Physics",function(req,res){
  res.render("Subject",{Subject:"Physics",chapters:physics_chapters});
});

app.post("/Physics", function(req,res){
  res.redirect("/Physics");
});
app.get("/Chemistry",function(req,res){
  res.render("Subject",{Subject:"Chemistry",chapters:chemistry_chapters});
});

app.post("/Chemistry", function(req,res){
  res.redirect("/Chemistry");
});

//going to chapter
//---------------------------------------physics----------------------------------------
app.get("/physics/:chapter",function(req,res){
res.render("Chapter",{chapter:req.params.chapter});
});

app.post("/physics/:chapter/:type", function(req,res){
  res.redirect("/physics/"+req.params.chapter+"/"+req.params.type);
});

app.get("/physics/:chapter/:type", function(req,res){
  if(req.params.type === "Notes"){
    let note_links=[];
    fs.readdir("uploads/physics/"+req.params.chapter+"/Notes", function (err, files) {
      if (err) {
          return console.log('Unable to scan directory: ' + err);
      }
      else{
        files.forEach(function (file) {
            let note_link="/uploads/physics/"+req.params.chapter+"/Notes/"+file;
            note_links.push(note_link);
        });
        res.render('Chapter_notes',{notes:note_links});
      }
    });
  }
    if(req.params.type === "Worksheets"){
        let worksheet_links=[];
      fs.readdir("uploads/physics/"+req.params.chapter+"/Worksheets", function (err, files) {
      if (err) {
          return console.log('Unable to scan directory: ' + err);
      }
      else{
        files.forEach(function (file) {
            let worksheet_link="uploads/physics/"+req.params.chapter+"/Worksheets/"+file;
            worksheet_links.push(worksheet_link);
        });
        res.render('Chapter_Worksheets',{worksheets:worksheet_links});
      }
      });
    }
    if(req.params.type === "Revision"){
      let revision_links=[];
      fs.readdir("uploads/physics/"+req.params.chapter+"/Worksheets", function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        else{
          files.forEach(function (file) {
              let revision_link="uploads/physics/"+req.params.chapter+"/Revision/"+file;
              revision_links.push(revision_link);
          });
          res.render('Chapter_Revision',{revisions:revision_links});
        }
      });
    }
  });

app.post("/physics/:chapter",function(req, res){
  res.redirect("/physics/"+req.params.chapter);
});

//----------------------------------------------maths-------------------------------------------------
app.get("/maths/:chapter/:id",function(req,res){
res.render("Chapter",{chapter:req.params.chapter,admin:false,id:req.params.id});
});

app.post("/maths/:chapter/:type/:id", function(req,res){
  res.redirect("/Maths/"+req.params.chapter+"/"+req.params.type+"/"+req.params.id);
});

app.get("/maths/:chapter/:type/:id", function(req,res){
  if(req.params.type === "Notes"){
    let note_links=[];
    fs.readdir("uploads/Maths/"+req.params.chapter+"/Notes", function (err, files) {
      if (err) {
          return console.log('Unable to scan directory: ' + err);
      }
      else{
        files.forEach(function (file) {
            let note_link=file;
            //"/uploads/Maths/"+req.params.chapter+"/Notes/"+
            console.log(note_link);
            note_links.push(note_link);
        });
        res.render('Chapter_notes',{notes:note_links,admin:false,subject:"Maths",chapter:req.params.chapter,id:req.params.id});
      }
    });
  }
    if(req.params.type === "Worksheets"){
        let worksheet_links=[];
      fs.readdir("uploads/Maths/"+req.params.chapter+"/Worksheets", function (err, files) {
      if (err) {
          return console.log('Unable to scan directory: ' + err);
      }
      else{
        files.forEach(function (file) {
            let worksheet_link=file;
            worksheet_links.push(worksheet_link);
        });
        res.render('Chapter_Worksheets',{worksheets:worksheet_links,admin:false,id:req.params.id});
      }
      });
    }
    if(req.params.type === "Revision"){
      let revision_links=[];
      fs.readdir("uploads/Maths/"+req.params.chapter+"/Revision", function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        else{
          files.forEach(function (file) {
              let revision_link=file;
              revision_links.push(revision_link);
          });
          res.render('Chapter_Revision',{revisions:revision_links,admin:false,id:req.params.id});
        }
      });
    }
  });

app.post("/maths/:chapter/:id",function(req, res){
  res.redirect("/maths/"+req.params.chapter+"/"+req.params.id);
});
//discussions
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//Admin
app.get("/91515566012/admin/:id", function(req,res){
  res.sendFile(__dirname+"/admin.html");
});

//uploading material
app.post("/admin/material",function(req,res){
  res.redirect("/admin/material");
})
app.get("/admin/material",function(req,res){
res.render("Subject",{Subject:"Mathematics",chapters:maths_chapters,admin:true,id:""});
})

app.get("/admin/material/:chapter",function(req,res){
res.render("Chapter",{chapter:req.params.chapter,admin:true,id:""});
});

app.post("/admin/material/:chapter/:type", function(req,res){
  res.redirect("/admin/material/"+req.params.chapter+"/"+req.params.type);
});

app.get("/admin/material/:chapter/:type", function(req,res){
  if(req.params.type === "Notes"){
    let note_links=[];
    fs.readdir("uploads/Maths/"+req.params.chapter+"/Notes", function (err, files) {
      if (err) {
          return console.log('Unable to scan directory: ' + err);
      }
      else{
        files.forEach(function (file) {
            let note_link=__dirname+"/uploads/Maths/"+req.params.chapter+"/Notes/"+file;
            note_links.push(note_link);
        });
        res.render('Chapter_notes',{notes:note_links,admin:true,subject:"Maths",chapter:req.params.chapter,id:""});
      }
    });
  }
    if(req.params.type === "Worksheets"){
        let worksheet_links=[];
      fs.readdir("uploads/Maths/"+req.params.chapter+"/Worksheets", function (err, files) {
      if (err) {
          return console.log('Unable to scan directory: ' + err);
      }
      else{
        files.forEach(function (file) {
            let worksheet_link="uploads/Maths/"+req.params.chapter+"/Worksheets/"+file;
            worksheet_links.push(worksheet_link);
        });
        res.render('Chapter_Worksheets',{worksheets:worksheet_links,admin:true,id:""});
      }
      });
    }
    if(req.params.type === "Revision"){
      let revision_links=[];
      fs.readdir("uploads/Maths/"+req.params.chapter+"/Worksheets", function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        else{
          files.forEach(function (file) {
              let revision_link="uploads/Maths/"+req.params.chapter+"/Revision/"+file;
              revision_links.push(revision_link);
          });
          res.render('Chapter_Revision',{revisions:revision_links,admin:true,id:""});
        }
      });
    }
  });

app.post("/admin/material/:chapter",function(req, res){
  res.redirect("/admin/material/"+req.params.chapter);
});

app.post("/pspk25",function(req,res){
  res.sender
})
//------------------------------------------------------------------------------------------------------------------------------------------------
app.post("/upload_material",function(req,res){
   upload(req, res, (err) => {
     if(err){
       console.log(err);
     }
     else{
       res.send("done");
     }
});
})
//-------------------------------------------------------------------------------------------------------------------------------------------------------------
app.post("/class",function(req,res){
  res.redirect("/class");
});

app.get("/class",function(req,res){
  Account.find({},function(err,account){
      res.render("class",{students:account});
    }
)})

app.get("/schedule/:id",function(req,res){
  Meeting.find({},function(err,meetings){
      Account.find({__id:req.params.id},function(err,found){
          res.render("schedule",{meetings:meetings,id:req.params.id,class:found.Class});
      })
  })
})

app.post("/schedule/:id",function(req,res){
  res.redirect("/schedule/"+req.params.id);
})
app.post("/class_upload",function(req,res){
  const meeting=new Meeting({
    group:req.body.group,
    students:req.body.students,
    link:req.body.link,
    time:req.body.time,
    date:req.body.date,
    description:req.body.description
  })
  meeting.save()
  res.redirect("/class");
})
//---------------------------------------------------------------------------------------------------------------------------------------------
app.post("/discussions/:id",function(req,res){
  res.redirect("/discussions/"+req.params.id);
})
app.get("/discussions/:id",function(req,res){
  Account.findOne({_id:req.params.id},function(err,found){
    if(err){
      console.log(err);
    }
    else{
    name=found.Name;
    Doubt.find({},function(err,doubts){
        res.render("discussion",{name:name,doubts:doubts,id:req.params.id});
    })
  }
})
})
app.post("/post_doubt/:id",function(req,res){
upload(req, res, (err) => {
const doubt=new Doubt({
  asker:req.body.name,
  route:"./doubts/",
  Subject:req.body.Subject,
  Chapter:req.body.chapter,
  type:req.body.Type,
  description:req.body.description
})
doubt.save()
res.redirect("/discussions/"+req.params.id);
}
)}
);
app.post("/go_to_doubt/:id",function(req,res){
  res.render("look_up",{description:req.body.description,route:req.body.route,id:req.params.id})
})
//-------------------------------------------------------------------------------------------------------------
app.post("/post_answer/:id",function(req,res){
  upload(req, res, (err) => {
      if(err){
        console.log(err);
      }
      else{
        const answer=new Answer({
          answerer:"sak",
          route:"./doubts/"+"sak",
          answer:req.body.answer
        })
        answer.save();
        res.redirect("/look_up",{id:req.params.id});
      }
  });
})
//---------------------------------------------------------------------------------------------------------------------------------------------
app.listen(3000,function(){console.log("Server running successfully on port 3000")});
