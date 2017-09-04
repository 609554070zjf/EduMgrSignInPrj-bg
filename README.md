# EduMgrSignInPrj-bg
# 教务考勤签到系统后台
该系统为教务考勤签到系统（EduMgrSignInPrj)的后台中间件部分  
前台使用AJAX请求该中间件，获取mongodb中的数据  
前台与后台使用RESTful API 进行路由  
## 路由配置（RESTful）：  
+ 查询指定学生：
  [GET]　/v1/stu/:stuno  
  - stuno：为学生学号
+ 查询指定教师： [GET]　/v1/tea/:teano
  - teano：为教师编号
+ 查询指定学生的考勤次数： [GET]　/v1/stu/signin/:stuno
  - stuno：为学生学号 
+ 增加指定学生指定状态的考勤次数： [GET]　/v1/stu/signin/:stuno/:state
  - stuno：为学生学号
  - state：为状态（n:正常，l:迟到，a:缺勤)
+ 根据学号和星期几获取课表： [GET]　/v1/course/:classday/:stuno
  - classday：为星期几（0-6：日-六）
  - stuno：为学生学号
+ 查询学生某天某课程的签到记录： [GET]　/v1/sign_record/:signintime/:stuno/:courseno
  - signintime：为签到日期：yyyy-MM-dd  
  - stuno：为学生学号
  - courseno：为课程编号
+ 保存签到记录： [POST]　/v1/sign_record/record"
+ 修改用户密码： [POST]　/v1/updatepwd/:user
  - user:为用户身份（stu:学生，tea:教师）
+ 保存学生： [POST]　/v1/fileUpload
+ 获取学生分页信息： [GET]　/v1/loadStudents
  - Resonse Head:
     - X-Total-Page:xx  
	 - link：<http://xxx/xxx?page=3& pagesize =50>; rel="next",  
　　   <http://xxx/xxx?page=20& pagesize =50>; rel="last"  
   　　 说明：”next”:表示下一页的页编码　“last”:表示最后一页的页编码
+ 删除指定学生： [DELETE]　/v1/stu/:stuno
  - stuno：为学生学号
+ 修改学生信息： [PUT] /v1/stu/:stuno
  - stuno：为学生学号
+ 保存课程： [POST] /v1/course
+ 获取课程分页信息： [GET]　/v1/loadCourses
  - Resonse Head:
     - X-Total-Page:xx  
	 - link：<http://xxx/xxx?page=3& pagesize =50>; rel="next",  
　　   <http://xxx/xxx?page=20& pagesize =50>; rel="last"  
   　　 说明：”next”:表示下一页的页编码　“last”:表示最后一页的页编码