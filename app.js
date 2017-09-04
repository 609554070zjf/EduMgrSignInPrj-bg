var express = require("express");
var schedule = require("node-schedule");
var path = require("path");
var url = require("url");
var app = express();
var router = require("./controller/router.js");

var multipart = require('connect-multiparty');

var multipartMiddleware = multipart();

app.use(multipart({
    // uploadDir: public.tmp
    uploadDir:"public"
}));
app.use(express.static("public"));
app.all('*', function(req, res, next) {
    console.log("access control here!");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    next();
});

app.get("/v1/stu/:stuno",router.getStuById);
app.get("/v1/tea/:teano",router.getTeaById);
app.get("/v1/stu/signin/:stuno",router.loadSignCntByStuNo);
app.get("/v1/stu/signin/:stuno/:state",router.addSignCnt);
app.get("/v1/course/:classday/:stuno",router.loadCoursesByClassDayAndStuno);
app.get("/v1/sign_record/:signintime/:stuno/:courseno",router.loadsignRecord);
app.post("/v1/sign_record/record",router.saveSignRecord);
app.post("/v1/updatepwd/:user",router.updatePwd);

app.post('/v1/fileUpload',multipartMiddleware, router.saveStudent);
app.get("/v1/loadStudents",router.loadStudents);
app.delete("/v1/stu/:stuno",router.deleteStu);
app.put("/v1/stu/:stuno",router.updateStu);

app.post("/v1/course",router.saveCourse);
app.get("/v1/loadCourses",router.loadCourses);

app.listen(80,function(){
	console.log("edumgr-bg is running at port 80 ok!");
});



var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 6)];
rule.hour = 23;
rule.minute = 50;
var j = schedule.scheduleJob(rule, function(){
    router.setAbsenceRecord();
});



//匹配顺序规则：先匹配静态路由，再匹配特定的个性化路径，最后匹配带有通配符的路径
// __dirname是当前文件的绝对路径
// . 是node命令执行时所在的目录。