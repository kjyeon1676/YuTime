
/**
 * Module dependencies.
 */
 var BUILDING_CODE={
'A02':'국제교류센터',
'A06':'디자인관',
'A07':'미술관',
'A08':'사범대학',
'A10':'음악대학',
'A11':'심포니홀',
'A13':'필승관',
'A14':'씨름장',
'A21':'대학원실기동',
'A22':'입체미술동A',
'A23':'입체미술동B',
'A24':'세라믹 실기동',
'B02':'상경관',
'B03':'인문관',
'B05':'법정관',
'B07':'이희건기념관',
'C02':'외국어교육원',
'C03':'종합강의동',
'C10':'실내골프연습장',
'C27':'제2인문관',
'E02':'천마아트센터',
'E04':'체조장',
'E05':'천마체육관',
'E21':'IT관',
'E22':'전기관',
'E23':'섬유관',
'E24':'화공관',
'E28':'소재관',
'E29':'기계관',
'F01':'약대 본관',
'F02':'약대 실험동',
'F03':'건축관',
'F04':'정보전산원',
'F05':'공과대학 강당',
'F07':'건설관',
'F21':'제1과학관',
'F22':'제2과학관',
'F23':'제3과학관',
'F26':'생명공학관',
'F27':'자연자원대 본관',
'F28':'자연자원대 제2실험동',
'F29':'자연자원대 제3실험동',
'G01':'생활과학대 본관',
'G02':'생활과학대 별관',
'G11':'CRC',
'G15':'생산기술연구원',
'H04':'H04',
     }
var express = require('express')
  , routes = require('./routes');
//var session = require('./node_modules/express-session');

var deepcopy=require('./node_modules/deepcopy')
var connect=require('./node_modules/connect');
var req = require('./node_modules/request');
var fs=require('fs');
var socketio=require('./node_modules/socket.io');
var mysql=require('./node_modules/mysql');
var client;

function get_year(){
    return new Date().getFullYear();
}

function get_semester(){
    var month= new Date().getMonth()+1;
    if(month>=1&&month<8){return 1;}
    else{return 2;}
}

function get_month(){
    return new Date().getMonth()+1;
}


function handleDisconnect() {
    client=mysql.createConnection({
        user:'root',
        password:'1234'
    });

  client.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  client.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
client.query('USE timetable');
}
handleDisconnect();



var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({secret:'keyboard cat',resave:false,saveUninitialized: true}));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/admin',routes.admin);
app.get('/sign_up',routes.sign_up);
app.post('/sign_up',routes.sign_up_post);
app.get('/login',routes.login);
app.post('/login',routes.login_post);
app.get('/logout',routes.logout);
app.get('/make_timetable',routes.make_timetable);
app.get('/evaluation',routes.evaluation);
app.get('/need_login',routes.need_login);
app.get('/community',routes.community);
app.get('/preference',routes.preference);
app.post('/preference',routes.preference_post);
app.get('/automake',routes.auto_make);

app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

var io=socketio.listen(app);

var sch_tm=function(result,socket,socketevent){
    socket.emit('delete_search_item');
    
    result.forEach(function(item,index){
        item['TimeCount']=0;
        item['Time']='';
        item['Classroom']='';
        client.query('SELECT * FROM timedetail WHERE Year='+get_year()+' and Semester=\''+get_semester()+'\' and CourseNumber=\''+item.CourseNumber+'\'',function(error,timeresult){
         if(error){} else{
            timeresult.forEach(function(timeitem,timeindex){
                item['TimeCount']=timeindex+1;
                item['Time']+='('+timeitem.Day+')'+timeitem.StartTime.substring(0,5)+'-'+timeitem.EndTime.substring(0,5)+'<br/>';
                if(timeitem.Building!='')
                item['Classroom']+=BUILDING_CODE[timeitem.Building]+'-'+timeitem.Classroom+'<br/>';
           });
           socket.emit(socketevent,item);
        }
       });
    });
}

io.sockets.on('connection',function(socket){
    
    socket.on('Search_Timetable_Info',function(){

    });
    
    socket.on('Search_CourseName',function(svalue){
        //console.log('과목:'+svalue)
        client.query('SELECT * FROM timetable.timetable WHERE Year='+get_year()+' and Semester=\''+get_semester()+'\' and CourseName like \'%'+svalue+'%\'',function(error,result,fields){
            if(error){}else{
                    sch_tm(result,socket,'result_search_item');
            }
        });
    });
    socket.on('Search_Building',function(svalue){
        //console.log('건물:'+svalue)

    });
    socket.on('Search_Professor',function(svalue){
        //console.log('교수:'+svalue)
        client.query('SELECT * FROM timetable.timetable WHERE Year='+get_year()+' and Semester=\''+get_semester()+'\' and Professor like \'%'+svalue+'%\'',function(error,result,fields){
            if(error){}else{
                    sch_tm(result,socket,'result_search_item');
            }
        });
    });
    socket.on('Search_Classroom',function(svalue){
        //console.log('교실:'+svalue)
            client.query('SELECT * FROM timetable WHERE CourseNumber in (SELECT DISTINCT CourseNumber FROM timedetail WHERE Classroom like \''+svalue+'\');',function(error,result){
            if(error){} else {
            sch_tm(result,socket,'result_search_item');
            }
    });
    });
    socket.on('Search_Class',function(svalue){
        //console.log('분반:'+svalue)
        client.query('SELECT * FROM timetable.timetable WHERE Year='+get_year()+' and Semester=\''+get_semester()+'\' and Class like \'%'+svalue+'%\'',function(error,result,fields){
            if(error){}else{
                    sch_tm(result,socket,'result_search_item');
            }
        });
    });
    socket.on('Search_CourseNumber',function(svalue){
        //console.log('수강번호:'+svalue)
        client.query('SELECT * FROM timetable.timetable WHERE  Year='+get_year()+' and Semester=\''+get_semester()+'\' and CourseNumber like \'%'+svalue+'%\'',function(error,result,fields){
            if(error){}else{
                    sch_tm(result,socket,'result_search_item');
            }
        });
    });
    socket.on('Search_Time',function(svalue){
        //console.log('시간:'+svalue)
        if(svalue.length==2){svalue+=':00'}
        if(svalue.length==5 && svalue.indexOf(':')==2){
        client.query('SELECT * FROM timetable WHERE CourseNumber in (SELECT DISTINCT CourseNumber FROM timedetail WHERE StartTime<=\''+svalue+'\' and EndTime >=\''+svalue+'\');',function(error,result){
            if(error){} else{
            sch_tm(result,socket,'result_search_item');
            }
        });
        }
        if(svalue.length==5 && svalue.indexOf('-')==2){svalue=svalue.substr(0,2)+':00-'+svalue.substr(3,2)+':00';}
        if(svalue.length==11 && svalue.indexOf('-')==5){
        client.query('SELECT * FROM timetable WHERE CourseNumber in (SELECT DISTINCT CourseNumber FROM timedetail WHERE StartTime>=\''+svalue.substr(0,5)+'\' and EndTime <=\''+svalue.substr(6,5)+'\');',function(error,result){
            if(error){} else {
            sch_tm(result,socket,'result_search_item');
            }
        });
        }
        
    });
    socket.on('Search_Day',function(svalue){
        //console.log('요일:'+svalue)
            client.query('SELECT * FROM timetable WHERE CourseNumber in (SELECT DISTINCT CourseNumber FROM timedetail WHERE Day=\''+svalue.substr(0,1)+'\');',function(error,result){
            if(error){} else {
            sch_tm(result,socket,'result_search_item');
            }
    });
    });
    socket.on('Search_Division',function(svalue){
        //console.log('이수구분:'+svalue)
        client.query('SELECT * FROM timetable.timetable WHERE  Year='+get_year()+' and Semester=\''+get_semester()+'\' and Division like \'%'+svalue+'%\'',function(error,result,fields){
            if(error){}else{
                    sch_tm(result,socket,'result_search_item');
            }
        });
    });
    socket.on('Search_Department',function(svalue){
        //console.log('학과:'+svalue)
        client.query('SELECT * FROM timetable.timetable WHERE  Year='+get_year()+' and Semester=\''+get_semester()+'\' and Department like \'%'+svalue+'%\'',function(error,result,fields){
            if(error){}else{
                    sch_tm(result,socket,'result_search_item');
            }
        });
    });
    socket.on('Search_Grade',function(svalue){
        //console.log('학년:'+svalue)
        client.query('SELECT * FROM timetable.timetable WHERE  Year='+get_year()+' and Semester=\''+get_semester()+'\' and Grade like \'%'+svalue+'%\'',function(error,result,fields){
            if(error){}else{
                    sch_tm(result,socket,'result_search_item');
            }
        });
    });
    socket.on('Search_Credit',function(svalue){
        //console.log('학점:'+svalue)
        client.query('SELECT * FROM timetable.timetable WHERE  Year='+get_year()+' and Semester=\''+get_semester()+'\' and Credit like \'%'+svalue+'%\'',function(error,result,fields){
            if(error){}else{
                    sch_tm(result,socket,'result_search_item');
            }
        });
    });
    socket.on('Search_Grade_Credit',function(svalue){
            client.query('SELECT * FROM timetable.timetable WHERE  Year='+get_year()+' and Semester=\''+get_semester()+'\' and (Credit = \''+svalue+'\' or Grade = \''+svalue+'\');',function(error,result,fields){
            if(error){}else{
                    sch_tm(result,socket,'result_search_item');
            }
        });
    })
    socket.on('Search_Somthing',function(svalue){
        client.query('SELECT * FROM timetable.timetable WHERE  Year='+get_year()+' and Semester=\''+get_semester()+'\' and (Grade like \'%'+svalue+'%\' or Division like \'%'+svalue+'%\' or CourseNumber like \'%'+svalue+'%\' or CourseName like \'%'+svalue+'%\' or Professor like \'%'+svalue+'%\' or Credit like \'%'+svalue+'%\' or Comment like \'%'+svalue+'%\' or Department like \'%'+svalue+'%\' or InternetGroup like \'%'+svalue+'%\' or Class like \'%'+svalue+'%\')',function(error,result){
            if(error){}else{
                    sch_tm(result,socket,'result_search_item');
            }
        });
    })
    socket.on('Search_Internet',function(){
        client.query('SELECT * FROM timetable.timetable WHERE  Year='+get_year()+' and Semester=\''+get_semester()+'\' and InternetGroup!=\'\'',function(error,result){
            if(error){}else{
                    sch_tm(result,socket,'result_search_item');
            }
        });
    })
    socket.on('Search_All',function(){
         client.query('SELECT * FROM timetable.timetable WHERE  Year='+get_year()+' and Semester=\''+get_semester()+'\'',function(error,result){
            if(error){}else{
                    sch_tm(result,socket,'result_search_item');
            }
         })
    });
    
    
    
    socket.on('submit_evaluation',function(containor){
        client.query('UPDATE timetable.mytimetable SET MyCredit=\''+containor.MyCredit+'\', Score=\''+containor.score+'\', Evaluation=\''+containor.text+'\', IsPublic=\''+containor.ispublic+'\',CommitTime=CURRENT_TIMESTAMP WHERE EMail=\''+containor.EMail+'\' and Year='+get_year()+' and Semester =\''+get_semester()+'\' and CourseNumber =\''+containor.CourseNumber+'\' and Department=\''+containor.Department+'\';');
        socket.emit('submit_evaluation_Ack',containor.CourseNumber+containor.Department);
    });
    
    
    socket.on('Search_Community',function(Index){
        client.query('SELECT DISTINCT timetable.CourseNumber,CourseName,Professor,timetable.Department,timetable.Grade,Credit,user.Name,mytimetable.MyCredit,timetable.IsPass,mytimetable.Score,mytimetable.IsPublic,Division,Evaluation,CommitTime FROM timetable.mytimetable inner join timetable.timetable inner join timetable.user where (timetable.Department=mytimetable.Department and timetable.CourseNumber=mytimetable.CourseNumber and mytimetable.EMail=user.EMail and MyCredit is not null) order by CommitTime DESC limit '+Index+',10;',function(error,result){
            result.forEach(function(item,index){
                    socket.emit('Search_Community_Result',item);
            });
        });
    });
    
    socket.on('Search_Community_CourseName',function(svalue,Index){
        client.query('SELECT DISTINCT timetable.CourseNumber,CourseName,Professor,timetable.Department,timetable.Grade,Credit,user.Name,mytimetable.MyCredit,timetable.IsPass,mytimetable.Score,mytimetable.IsPublic,Division,Evaluation,CommitTime FROM timetable.mytimetable inner join timetable.timetable inner join timetable.user where (timetable.Department=mytimetable.Department and timetable.CourseNumber=mytimetable.CourseNumber and mytimetable.EMail=user.EMail and timetable.CourseName like \'%'+svalue+'%\' and MyCredit is not null) order by CommitTime DESC limit '+Index+',10;',function(error,result){
            result.forEach(function(item,index){
                    socket.emit('Search_Community_Result',item);
            });
        });
    });
    
     socket.on('Search_Community_CourseNumber',function(svalue,Index){
        client.query('SELECT DISTINCT timetable.CourseNumber,CourseName,Professor,timetable.Department,timetable.Grade,Credit,user.Name,mytimetable.MyCredit,timetable.IsPass,mytimetable.Score,mytimetable.IsPublic,Division,Evaluation,CommitTime FROM timetable.mytimetable inner join timetable.timetable inner join timetable.user where (timetable.Department=mytimetable.Department and timetable.CourseNumber=mytimetable.CourseNumber and mytimetable.EMail=user.EMail and timetable.CourseNumber like \'%'+svalue+'%\' and MyCredit is not null) order by CommitTime DESC limit '+Index+',10;',function(error,result){
            result.forEach(function(item,index){
                    socket.emit('Search_Community_Result',item);
            });
        });
    });
    
     socket.on('Search_Community_Professor',function(svalue,Index){
        client.query('SELECT DISTINCT timetable.CourseNumber,CourseName,Professor,timetable.Department,timetable.Grade,Credit,user.Name,mytimetable.MyCredit,timetable.IsPass,mytimetable.Score,mytimetable.IsPublic,Division,Evaluation,CommitTime FROM timetable.mytimetable inner join timetable.timetable inner join timetable.user where (timetable.Department=mytimetable.Department and timetable.CourseNumber=mytimetable.CourseNumber and mytimetable.EMail=user.EMail and timetable.Professor like \'%'+svalue+'%\' and MyCredit is not null) order by CommitTime DESC limit '+Index+',10;',function(error,result){
            result.forEach(function(item,index){
                    socket.emit('Search_Community_Result',item);
            });
        });
    });
    
    socket.on('add_mytimetable_data',function(data){
        client.query('SELECT * FROM mytimetable WHERE  Year='+get_year()+' and Semester=\''+get_semester()+'\' and EMail=\''+data.EMail+'\' and CourseNumber=\''+data.CourseNumber+'\' and Department=\''+data.Department+'\';',function(error,result){
            if(error){} else {
                if(result[0]){
                    if(result[0].Removed==1){//데이터가 남아있다.
                        client.query('UPDATE mytimetable SET Removed=\''+0+'\' WHERE EMail=\''+data.EMail+'\' and Year ='+get_year()+' and Semester =\''+get_semester()+'\' and CourseNumber=\''+data.CourseNumber+'\' and Department =\''+data.Department+'\';');
                    }
                } else {//데이터가 아예 없다.
                    client.query('INSERT INTO mytimetable ( EMail, Year, Semester, CourseNumber, Department) VALUES (\''+data.EMail+'\', '+get_year()+', \''+get_semester()+'\', \''+data.CourseNumber+'\', \''+data.Department+'\');');
                }
            }
        });
    });
    
    socket.on('remove_mytimetable_data',function(data){
        client.query('SELECT * FROM mytimetable WHERE  Year='+get_year()+' and Semester=\''+get_semester()+'\' and EMail=\''+data.EMail+'\' and CourseNumber=\''+data.CourseNumber+'\' and Department=\''+data.Department+'\';',function(error,result){
            if(error){} else {
                if(result[0]){
                    if(result[0].MyCredit!=null){//평가를 한 상태다
                        client.query('UPDATE mytimetable SET Removed=\''+1+'\' WHERE EMail=\''+data.EMail+'\' and Year ='+get_year()+' and Semester =\''+get_semester()+'\' and CourseNumber=\''+data.CourseNumber+'\' and Department =\''+data.Department+'\';');
                    } else{
                        client.query('DELETE FROM mytimetable WHERE EMail=\''+data.EMail+'\' and Year ='+get_year()+' and Semester =\''+get_semester()+'\' and CourseNumber =\''+data.CourseNumber+'\' and Department =\''+data.Department+'\';');
                    }
                } 
            }
        });
    });
    
    socket.on('req_mytimetable_data',function(EMail){
        client.query('SELECT CourseNumber,Department,Year,Semester FROM mytimetable WHERE EMail=\''+EMail+'\' and Year='+get_year()+' and Semester=\''+get_semester()+'\' and Removed=\'0\';',function(error,result){
            if(error){} else {
                result.forEach(function(item,index){
                   client.query('SELECT * FROM timetable WHERE CourseNumber=\''+item.CourseNumber+'\' and Department=\''+item.Department+'\' and Year='+get_year()+' and Semester=\''+get_semester()+'\';',function(error,resultitem){
                       sch_tm(resultitem,socket,'result_mytimetable_data')
                   }); 
                });
            }
        });
    });
    
    socket.on('insert_badkeyword',function(keyword){
        client.query('INSERT INTO badkeyword (keyword) SELECT \''+keyword+'\' FROM DUAL WHERE NOT EXISTS (SELECT * FROM badkeyword where keyword=\''+keyword+'\')');
    })
    socket.on('update_user_rank',function(e,r){
       client.query('UPDATE user SET Rank=\''+r+'\' WHERE EMail=\''+e+'\';'); 
    });
    
    socket.on('update_evaluation',function(e,cn,dp){
       client.query('UPDATE mytimetable SET Evaluation=\'바르고 고운말을 씁시다.\' WHERE EMail=\''+e+'\' and CourseNumber=\''+cn+'\' and Department=\''+dp+'\';'); 
    });
    socket.on('broadcast_to_online',function(bcd){
        io.sockets.emit('broadcast_recieve',bcd);
    })
    
    //
    socket.on('req_autoconfig',function(svalue){
        var DayArr = new Array();
        var gradeArr = new Array();
        DayArr[0] = svalue.substring(1,2);
        DayArr[1] = svalue.substring(2,3);
        DayArr[2] = svalue.substring(3,4);
        DayArr[3] = svalue.substring(4,5);
        DayArr[4] = svalue.substring(5,6);
        gradeArr[0] = svalue.substring(7,8);
        gradeArr[1] = svalue.substring(8,9);
        gradeArr[2] = svalue.substring(9,10);
        gradeArr[3] = svalue.substring(10,11);
        var strArray = svalue.split('#');
        var dept = strArray[2].substr(0,strArray[2].length);
        var div = strArray[5].substr(0,2);
        var minor = strArray[3].substr(0,strArray[3].length);
        var doublemajor = strArray[4].substr(0,strArray[4].length);
        if(div=='부전'){ //부전공은 다 전공밖에 없음
            client.query('SELECT * FROM timetable WHERE MinorAllow!=0 AND Division like \'%전공%\' AND Department=\''+minor+'\' AND (Grade=\''+gradeArr[0]+'\' OR Grade=\''+gradeArr[1]+'\' OR Grade=\''+gradeArr[2]+'\' OR Grade=\''+gradeArr[3]+'\') AND CourseNumber in (SELECT DISTINCT CourseNumber FROM timedetail WHERE Day=\''+DayArr[0]+'\' OR Day=\''+DayArr[1]+'\' OR Day=\''+DayArr[2]+'\' OR Day=\''+DayArr[3]+'\' OR Day=\''+DayArr[4]+'\');',function(error,result){
            if(error){} else {
                sch_tm(result,socket,'recommand_search_item');
                }
            });
        }
        else if(div=='복전'){ //이것도 DoubleMajorAllow가 0이 아니면 다 전공임
            client.query('SELECT * FROM timetable WHERE MinorAllow!=0 AND Division like \'%전공%\' AND Department=\''+doublemajor+'\' AND (Grade=\''+gradeArr[0]+'\' OR Grade=\''+gradeArr[1]+'\' OR Grade=\''+gradeArr[2]+'\' OR Grade=\''+gradeArr[3]+'\') AND CourseNumber in (SELECT DISTINCT CourseNumber FROM timedetail WHERE Day=\''+DayArr[0]+'\' OR Day=\''+DayArr[1]+'\' OR Day=\''+DayArr[2]+'\' OR Day=\''+DayArr[3]+'\' OR Day=\''+DayArr[4]+'\');',function(error,result){
            if(error){} else {
                sch_tm(result,socket,'recommand_search_item');
                }
            });
        }
        else{
             client.query('SELECT * FROM timetable WHERE Division like \'%'+div+'%\' AND Department=\''+dept+'\' AND (Grade=\''+gradeArr[0]+'\' OR Grade=\''+gradeArr[1]+'\' OR Grade=\''+gradeArr[2]+'\' OR Grade=\''+gradeArr[3]+'\') AND CourseNumber in (SELECT DISTINCT CourseNumber FROM timedetail WHERE Day=\''+DayArr[0]+'\' OR Day=\''+DayArr[1]+'\' OR Day=\''+DayArr[2]+'\' OR Day=\''+DayArr[3]+'\' OR Day=\''+DayArr[4]+'\');',function(error,result){
            if(error){} else {
                sch_tm(result,socket,'recommand_search_item');
                }
            });
        }
    });
    socket.on('select_Department',function(){
        client.query('SELECT * FROM timetable.major',function(error,result,fields){
            if(error){}else{
                socket.emit('select_box_item',result);
            }
        });
    });
    //
    
});
