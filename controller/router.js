var formidable = require("formidable");
var path = require("path");
var querystring = require("querystring");
var sd = require("silly-datetime");
var fs = require("fs");
var db = require("../model/dbutils.js");
var util = require('util');


var getStuById = function(req,res){
  db.query("stuinfo",req.params,1,1,{},
    function(err,result){
      if(err){
          // console.log(err);
          res.json({"errormsg":err});
      }
      else{
          console.log(result);
          res.json({"result":result[0]});
      }
  });
};

var getTeaById = function(req,res){
  db.query("teainfo",req.params,1,1,{},
    function(err,result){
      if(err){
          // console.log(err);
          res.json({"errormsg":err});
      }
      else{
          console.log(result);
          res.json({"result":result[0]});
      }
  });
};

var loadSignCntByStuNo = function(req,res){
  var stuno = req.params.stuno;
  db.query("signincnt",{"stuno":stuno},1,1,{},
    function(err,result){
      if(err){
          // console.log(err);
          res.json({"errormsg":err});
      }
      else{
          res.json(result);
      }
  });
};

var loadCoursesByClassDayAndStuno = function(req,res){
  var classday = parseInt(req.params.classday);
  var stuno = req.params.stuno;

  var doc = {"classday":classday};
  if(stuno != "null"){
    doc.stuno = stuno;
  }

  console.log(classday);
  db.query("course",doc,0,1,{},
    function(err,result){
      if(err){
          // console.log(err);
          res.json({"errormsg":err});
      }
      else{
          res.json(result);
      }
  });
};

var loadsignRecord = function(req,res){
  var signintime = req.params.signintime;
  var stuno = req.params.stuno;
  var courseno = req.params.courseno;

  var doc = {};
  if(signintime != "null"){
    doc.signintime = signintime;
  }
  if(courseno != "null"){
    doc.courseno = courseno;
  }
  if(stuno != "null"){
    doc.stuno = stuno;
  }
  
  //{"signintime":signintime,"stuno":stuno,"courseno":courseno}
  console.log(req.params);
  db.query("signin_record",doc,0,1,{"signintime":1,"signintime":1},
    function(err,result){
      if(err){
          // console.log(err);
          res.json({"errormsg":err});
      }
      else{
          console.log(result);
          res.json(result);
      }
  });
};

var saveSignRecord = function(req,res){
  var signRecord = null;
  var form = new formidable.IncomingForm();
  form.parse(req,function(err,fields,files){
    fields.state = parseInt(fields.state);
    console.log(fields);
    db.insertOne("signin_record",fields,
    function(n){
      console.log("signin_record成功插入" + n + "条记录");
      if(n > 0)
        res.json({"success":true});
    });
  });
};

var addSignCnt = function(req,res){

  var stuno = req.params.stuno;
  var state = req.params.state; //n:正常，l:迟到，a:缺勤
  console.log("state:"+state);
  var doc = null;
  db.query("signincnt",{"stuno":stuno},1,1,{},
    function(err,result){
      if(err){
          res.json({"errormsg":err});
      }
      else{
          var signcnt = result[0];
          doc = getDocByState(state,signcnt);
           db.update("signincnt",{"stuno":stuno},{ $set: doc},function(n){
              console.log("signincnt成功更新" + n + "条记录");
              // res.send("成功更新" + n + "条记录");
              db.query("signincnt",{"stuno":stuno},1,1,{},function(error,value){
                if(error){                 
                    res.json({"errormsg":error});
                }
                else{
                    res.json(value);
                }
              });
           });
      }
  });

};


function getDocByState(state,result){
  var doc = null;
  if(state === "s"){
    var normalcnt = parseInt(result.normalcnt)+1;
    doc = {"normalcnt":normalcnt};
  }
  else if(state === "l"){
    var latecnt = parseInt(result.latecnt)+1;
    doc = {"latecnt":latecnt};
  }
  else if(state === "a"){
    var absencecnt = parseInt(result.absencecnt)+1;
    doc = {"absencecnt":absencecnt};
  }

  return doc;
}


var updatePwd = function(req,res){
  var user = req.params.user;
  var collectionName = null;
  var filter = {};

  var form = new formidable.IncomingForm();
  form.parse(req,function(err,fields,files){
    console.log(fields);

    if(user === "stu"){
    collectionName = "stuinfo";
    filter = {stuno:fields.stuno};
    }else if(user === "tea"){
      collectionName = "teainfo";
      filter = {teano:fields.teano};
    }
    db.update(collectionName,filter,{$set:{password:fields.password}},
      function(n){
        console.log(collectionName+"成功修改密码：" + n + "条记录");
        if(n > 0){
          res.json({success:true});
        }
    });
  });
};



var saveStudent = function(req,res){
    var fileName = req.files.file.name;
    var fileStr = fileName.split(".");
    var filePostfix = fileStr[fileStr.length-1];

    var stu = req.body;
    stu._id = stu.stuno;
    stu.picname = stu.stuno + "." + filePostfix;
    console.log(stu);

    fs.rename(req.files.file.path,"public/upload/student/"+stu.picname);

    db.insertOne("stuinfo",stu,function(n){
        console.log("成功插入"+n+"条记录");
    });

    var signincnt = {
      "stuno" : stu.stuno,
      "stuname" : stu.stuname,
      "normalcnt" : 0,
      "latecnt" : 0,
      "absencecnt" : 0
    };
    db.insertOne("signincnt",signincnt,function(n){
        console.log("成功插入"+n+"条记录");
    });
};


var loadStudents = function(req,res){
  /*
    xxx?page=<page_no>&pagesize=<per_page>
    page_no:页数，表示第几页
    per_page：每页数据条数
    如：GET /v1/rtu/<rtu_id>/devices?page=2&pagesize=50
   */
  var pageNo = parseInt(req.query.page);
  var pageSize = parseInt(req.query.pagesize);
  console.log(pageNo + ":" + pageSize);
  getCount("stuinfo",function(err,count){
      // console.log(count);
      var pageCnt = Math.ceil(count/pageSize);
      console.log(pageCnt);
      // 
      db.query("stuinfo",{},pageSize,pageNo,{"stuno":1},
      function(err,result){
        if(err){
            // console.log(err);
            res.json({"errormsg":err});
        }
        else{
            // console.log(result);
            //link：<http://xxx/xxx?page=3& pagesize =50>; rel="next",
            //< http://xxx/xxx?page=20& pagesize =50>; rel="last"
            if(pageNo >= pageCnt){
              pageNo = pageCnt;
            }
            else{
              pageNo = pageNo + 1;
            }
            res.setHeader("Access-Control-Expose-Headers","X-Total-Page,link");
            res.setHeader("X-Total-Page",pageCnt);
            
            // res.setHeader("Access-Control-Expose-Headers","link");
            res.setHeader("link","<http://localhost/v1/loadStudents?page="+(pageNo)+"&pagesize="+ pageSize+">;rel='next',<http://localhost/v1/loadStudents?page="+(pageCnt)+"&pagesize="+ pageSize+">;rel='last'");
            
            res.json(result);
        }
      });
  });
;

function getCount(collectionName,callback){
  db.count(collectionName,{},callback);
}

var deleteStu = function(req,res){
  var stuno = req.params.stuno;
  console.log(stuno);
  // db.delete("stuinfo",{"stuno":stuno},function(n){
  db.update("stuinfo",{"stuno":stuno},{$set:{state:0}},function(n){
    if(n > 0){
      console.log("成功删除" + n + "条记录");
      res.json({"success":true});
    }  
  });
};

var updateStu = function(req,res){
  var stuno = req.params.stuno;
  console.log(stuno);

  var stu = "";
  req.on("data", function(postDataChunk) {
      console.log(postDataChunk);
        stu += postDataChunk;
    });
    req.on("end", function() {
        console.log(stu);
        //stuno=s005&stuname=%E5%BC%A0%E6%95%8F%E6%95%8F&password=s005&state=1&sex=F
        stu = querystring.parse(stu);
        stu.state = parseInt(stu.state);
        
        db.update("stuinfo",{"stuno":stuno},
          {$set:{
            stuname:stu.stuname,
            sex:stu.sex,
            password:stu.password,
            state:stu.state
          }},function(n){
            if(n > 0){
              console.log("成功修改" + n + "条记录");
              res.json({"success":true});
            }
          });
     });
};

var saveCourse = function(req,res){

  var form = new formidable.IncomingForm();
  form.parse(req,function(err,fields,files){
    fields.classday = parseInt(fields.classday);
    console.log(fields);

    db.insertOne("course",fields,function(n){
        if(n > 0){
          console.log("成功插入"+n+"条记录");
          res.json({"success":true});  
        }
    });

  });
};

var loadCourses = function(req,res){
  var pageNo = parseInt(req.query.page);
  var pageSize = parseInt(req.query.pagesize);
  console.log(pageNo + ":" + pageSize);
  getCount("course",function(err,count){
      var pageCnt = Math.ceil(count/pageSize);
      console.log(pageCnt);
 
      db.query("course",{},pageSize,pageNo,{"courseno":1},
      function(err,result){
        if(err){
            res.json({"errormsg":err});
        }
        else{
            if(pageNo >= pageCnt){
              pageNo = pageCnt;
            }
            else{
              pageNo = pageNo + 1;
            }
            res.setHeader("Access-Control-Expose-Headers","X-Total-Page,link");
            res.setHeader("X-Total-Page",pageCnt);
            res.setHeader("link","<http://localhost/v1/loadCourses?page="+(pageNo)+"&pagesize="+ pageSize+">;rel='next',<http://localhost/v1/loadCourses?page="+(pageCnt)+"&pagesize="+ pageSize+">;rel='last'");
            res.json(result);
        }
      });
    });
};


/**
 * [setAbsenceRecord description]
 * 插入缺勤记录
 * //思路：
 *       查询今日所有的课程
 *       查询所有的学生（在学）
 *       根据课程和学生查询签到记录，若该课程该学生未签到，则插入缺勤记录
 */
var setAbsenceRecord = function(){
  var date = new Date();
  var today = date.getDay();
  var dateStr = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
  db.query("course",{classday:today},0,1,{},
    function(err,courses){
          db.query("stuinfo",{state:1},0,1,{},function(err,stus){
            for(var i = 0;i<courses.length;i++){
            var course = courses[i];
              for(var j = 0; j < stus.length;j++){
                var stu = stus[j];
                var doc = {
                  stuno:stu.stuno,
                  courseno:course.courseno
                };
               db.query("signin_record",doc,0,1,{},function(err,result,j){
                    var stu = stus[j];
                    // console.log(result);
                    if(!result.stuno){
                      var fields = {
                        stuno:stu.stuno,
                        stuname:stu.stuname,
                        courseno:course.courseno,
                        coursename:course.coursename,
                        signintime:dateStr,
                        begintime:course.begintime,
                        endtime:course.endtime,
                        state:3
                    };
                    // console.log(fields);
                      db.insertOne("signin_record",fields,
                      function(n){
                        console.log("signin_record成功插入" + n + "条记录");
                      });
                      // db.update("signincnt",{"stuno":stuno},{ $set:{absencecnt:absencecnt+1}},function(n){
                      //     console.log("signincnt成功更新" + n + "条记录");
                      // });
                    }
                },j);
              }
            }
          });
  });
};

//var async = require('async');
// async.seies({
//   one: function(callback){
//     callback(null, 1);
//   },
//   two: function(callback){
//     callback(null, 2);
//   }
// },function(err, results) {
//   console.log(results);
// });


exports.setAbsenceRecord = setAbsenceRecord;
exports.deleteStu = deleteStu;
exports.updateStu = updateStu;
exports.loadStudents = loadStudents;
exports.saveStudent = saveStudent;

exports.saveCourse = saveCourse;
exports.loadCourses = loadCourses;
exports.updatePwd = updatePwd;
exports.saveSignRecord = saveSignRecord;
exports.loadsignRecord = loadsignRecord;
exports.loadCoursesByClassDayAndStuno = loadCoursesByClassDayAndStuno;
exports.loadSignCntByStuNo = loadSignCntByStuNo;
exports.addSignCnt = addSignCnt;
exports.getStuById = getStuById;
exports.getTeaById = getTeaById;