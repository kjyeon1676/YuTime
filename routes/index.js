
/*
 * GET home page.
 */

var mysql=require('../node_modules/mysql');
var client;

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

crypto = require('crypto');

 var crypto_key = '_Password_Crypto_Key_For_YuTime_Rhkdgnl';


exports.index = function(req, res){
    var userInfo = req.session.userInfo;
    var EMail = '';
    var Rank='';
    var cookieemail=req.cookies.cookieemail;

    if(cookieemail!=null){
 var decipher = crypto.createDecipher('aes192', crypto_key);
 var deoutput=decipher.update(cookieemail, 'base64', 'utf8');
     deoutput += decipher.final('utf8');}
    
    try {
        EMail = userInfo.EMail;
        Rank=userInfo.Rank;
    } catch (e) { }
    if (EMail == '') {
            if(cookieemail!=null){
            client.query('SELECT * FROM user WHERE EMail=\''+deoutput+'\';',function(error,result){
                if(error){}else{
                    if(result[0]){
                        
                        if(result[0].Rank=='차단'){res.clearCookie('cookieemail');res.send('<script>alert(\'차단된 사용자 입니다.\'); location.href=\"/\"</script>');} else{
                        req.session.userInfo={'EMail':deoutput,'Rank':result[0].Rank};
                        res.render('index', { title: 'YuTime','EMail':deoutput,'Rank':Rank });
                        }
                    } else{
                        res.render('index', { title: 'YuTime','EMail':'손님','Rank':'손님' });
                    }
                }
            });
            } else{
                res.render('index', { title: 'YuTime','EMail':'손님','Rank':'손님' });
            }
        
    } else {
    res.render('index', { title: 'YuTime','EMail':EMail,'Rank':Rank })
    }
};

exports.admin = function(req, res){
      var userInfo = req.session.userInfo;
    var EMail = '';
    var Rank='';
    var badkeywords='';
    var badevalquery='SELECT DISTINCT user.EMail,user.Rank,user.Name,mytimetable.Evaluation,mytimetable.CourseNumber,mytimetable.Department FROM timetable.mytimetable inner join timetable.user on mytimetable.EMail=user.EMail where ';
    try {
        EMail = userInfo.EMail;
        Rank=userInfo.Rank;
    } catch (e) { }
    if (EMail == '') {
       res.redirect('/');
    } else {
        if(Rank=='관리자'){
            
            client.query('SELECT * FROM user',function(error,resultusr){
                if(error){} else{
                    
                    client.query('SELECT * FROM badkeyword',function(error,resultbk){
                        if(error){} else{
                            resultbk.forEach(function(item,index){
                                if(index==0){
                                badkeywords+=item.keyword;
                                    badevalquery+=' Evaluation like \'%'+item.keyword+'%\'';
                                } else {
                                    badkeywords+=','+item.keyword;
                                    badevalquery+=' or Evaluation like \'%'+item.keyword+'%\'';
                                }
                            })
                            badevalquery+=';';
                            if(resultbk[0]){
                            client.query(badevalquery,function(error,resultev){
                            res.render('admin', { title: 'Admin','EMail':EMail,'Rank':Rank ,'userdata':resultusr,'badkeywords':badkeywords,'evaluation':resultev});
                            })}
                            else{
                            res.render('admin', { title: 'Admin','EMail':EMail,'Rank':Rank ,'userdata':resultusr,'badkeywords':badkeywords,'evaluation':''});
                            }
                            
                        }
                    });
                }
            });
        } else{
            res.redirect('/');
        }
    }
};

exports.login = function(req, res){
    var userInfo = req.session.userInfo;
    var EMail = '';
    try {
        EMail = userInfo.EMail;
    } catch (e) { }
    if (EMail == '') {
        res.render('login', {
            title: '로그인','EMail':'손님','Rank':'손님'});
    } else {
        res.redirect('/');
    }
};

exports.login_post = function(req, res){
	var e=req.body.EMail;
	var p=req.body.PassWord;
	client.query('SELECT EMail,PassWord,Rank FROM user WHERE EMail=\''+e+'\'',function(error,result,fields){
		if(error){}
		else{
			if(result[0]){
                if(result[0].Rank=='차단'){res.clearCookie('cookieemail');res.send('<script>alert(\'차단된 사용자 입니다.\'); location.href=\"/\"</script>');} else {
				if(result[0].EMail==e&&result[0].PassWord==p){
					var userInfo={EMail:e,Rank:result[0].Rank};
					req.session.userInfo=userInfo;
                    console.log(e+'님 로그인.');
					res.redirect('/');
				}else{
                    res.send('<script>alert(\'등록되지 않은 사용자이거나 잘못된 비밀번호 입니다.\'); location.href=\"/login\"</script>');
				}
            }
			}else{
              res.send('<script>alert(\'등록되지 않은 사용자이거나 잘못된 비밀번호 입니다.\'); location.href=\"/login\"</script>');
            }
        }
	});	
};

exports.logout=function(req,res){
    console.log(req.session.userInfo.EMail+'님 로그아웃.');
    req.session.destroy(function(error){
        res.clearCookie('cookieemail');
        res.send('<script>alert(\'로그아웃 되었습니다.\'); location.href=\"/\"</script>');
    })
}

exports.sign_up = function(req, res){
    var userInfo = req.session.userInfo;
    var EMail = '';
    var Rank='';
    try {
        EMail = userInfo.EMail;
        Rank=userInfo.Rank;
    } catch (e) { }
    if (EMail == '') {
       res.render('sign_up', { title: 'YuTime','EMail':'손님','Rank':'손님' });
    } else {
    res.redirect('/');
    }
};

exports.sign_up_post = function(req, res){
    var e=req.body.EMail;
    var p=req.body.PassWord;
    var pr=req.body.PassWordRe;
    client.query('SELECT EMail FROM user where EMail=\''+e+'\'',function(error,result,fields){
        if(error){console.log('error')
        }else{
            if(result[0]){
            res.send('<script>alert(\'둥록된 메일 입니다.\'); location.href=\"/sign_up\"</script>');
            }else{
            client.query('INSERT INTO user (EMail,PassWord,Rank,Name,Grade,Major) VALUES(?,?,?,?,?,?)',[e,p,'회원',req.body.Name,req.body.Grade,req.body.Major]);
            req.session.userInfo={EMail:e,Rank:'회원'}
            res.send('<script>alert(\'가입 완료되었습니다.\'); location.href=\"/\"</script>');
            }
        }
    });
};

exports.need_login=function(req,res){
        var userInfo = req.session.userInfo;
    var EMail = '';
    var Rank='';
    try {
        EMail = userInfo.EMail;
        Rank=userInfo.Rank;
    } catch (e) { }
    if (EMail == '') {
       res.render('need_login',{title:'로그인이 필요한 서비스 입니다.','EMail':'손님','Rank':'손님'});
    } else {
        res.redirect('/');
        }
}

exports.make_timetable = function(req, res){
    var userInfo = req.session.userInfo;
    var EMail = '';
    var Rank='';
//    var time=new Array();
//    time[0]='18:00 - 18:45';
//    time[1]='18:50 - 19:35';
//    time[2]='19:40 - 20:25';
//    time[3]='20:30 - 21:15';
//    time[4]='21:20 - 22:05';
//    time[5]='22:10 - 22:55';
    
    try {
        EMail = userInfo.EMail;
        Rank=userInfo.Rank;
    } catch (e) { }
    if (EMail == '') {
       res.render('make_timetable', { title: '시간표 만들기','EMail':'손님','Rank':'손님' });
    } else {
        res.render('make_timetable', { title: '시간표 만들기','EMail':EMail,'Rank':Rank })
    }
};

exports.evaluation=function(req,res){
    var userInfo = req.session.userInfo;
    var EMail = '';
    var Rank='';
    try {
        EMail = userInfo.EMail;
        Rank=userInfo.Rank;
    } catch (e) { }
    if (EMail == '') {
       res.redirect('/need_login');
    } else {
        client.query('SELECT DISTINCT timetable.CourseNumber,CourseName,Professor,timetable.Department,Grade,Credit,mytimetable.MyCredit,timetable.IsPass,mytimetable.Score,mytimetable.IsPublic,Comment,Division,Evaluation,Removed,mytimetable.Year,mytimetable.Semester FROM timetable.mytimetable inner join timetable.timetable where ( mytimetable.Year='+get_year()+' and mytimetable.Semester=\''+get_semester()+'\' and timetable.Department=mytimetable.Department and timetable.CourseNumber=mytimetable.CourseNumber and Removed=\'0\' and EMail=\''+EMail+'\');',function(error,result){
        if(error){}else{
            var all=0,alld=0;
            var maj=0,majd=0;
            var lib=0,libd=0;
            var tec=0;tecd=0;
            var nor=0;nord=0;
            for(var i=0;result[i];++i){
                var item=result[i];
                if(item.MyCredit!=null){all+=item.MyCredit*Number(item.Credit);alld+=Number(item.Credit);}
                if(item.Division=='전공교양'&&item.MyCredit!=null){maj+=item.MyCredit*Number(item.Credit);majd+=Number(item.Credit);}
                else if(item.Division=='부전공'&&item.MyCredit!=null){}
                else if(item.Division=='일반선택'&&item.MyCredit!=null){nor+=item.MyCredit*Number(item.Credit);nord+=Number(item.Credit);}
                else if(item.Division=='교직'&&item.MyCredit!=null){tec+=item.MyCredit*Number(item.Credit);tecd+=Number(item.Credit);}
                else if(item.Division.indexOf('전공')!=-1&&item.MyCredit!=null){maj+=item.MyCredit*Number(item.Credit);majd+=Number(item.Credit);}
                else if(item.Division.indexOf('교양')!=-1&&item.MyCredit!=null){lib+=item.MyCredit*Number(item.Credit);libd+=Number(item.Credit);}
                else if(item.Division.indexOf('복수')!=-1&&item.MyCredit!=null){}
            }
        res.render('evaluation', { title: '평가','EMail':EMail,'Rank':Rank,'data':result,'rat_all':all,'rat_maj':maj,'rat_lib':lib,'rat_tec':tec,'rat_nor':nor,'rat_alld':alld,'rat_majd':majd,'rat_libd':libd,'rat_tecd':tecd,'rat_nord':nord });}
        });
    }
}

exports.community = function(req, res){
    var userInfo = req.session.userInfo;
    var EMail = '';
    var Rank='';
    try {
        EMail = userInfo.EMail;
        Rank=userInfo.Rank;
    } catch (e) { }
    if (EMail == '') {
       res.render('community', { title: '평가 보기','EMail':'손님','Rank':'손님' });
    } else {
       res.render('community', { title: '평가 보기','EMail':EMail,'Rank':Rank })
    }
};

exports.preference = function(req, res){
    var userInfo = req.session.userInfo;
    var EMail = '';
    var Rank='';
    var cookie='';
    if(req.cookies.cookieemail!=null){cookie='true';}
    else{cookie='false';}
    try {
        EMail = userInfo.EMail;
        Rank=userInfo.Rank;
    } catch (e) { }
    if (EMail == '') {
       res.redirect('/need_login');
    } else {
        client.query('SELECT * FROM user WHERE EMail=\''+EMail+'\'',function(error,result){
            if(error){}else{
                if(result[0].DoubleMajor1==null){result[0].DoubleMajor1='';}
                if(result[0].Minor==null){result[0].DoubleMajor2='';}
                if(result[0].Minor==null){result[0].Minor='';}
       res.render('preference', { title:'설정','EMail':EMail,'Rank':Rank,'Data':result,'cook':cookie });
            }
        });
    }
};

exports.preference_post = function(req, res){
    var e=req.session.userInfo.EMail;
    var npw=req.body.npw;
    var nm=req.body.NickName;
    var gd=req.body.Grade;
    var mj=req.body.Major;
    var d1=req.body.DoubleMajor1;
    var d2=req.body.DoubleMajor2;
    var mi=req.body.Minor;
    
    client.query('SELECT PassWord FROM user where EMail=\''+e+'\'',function(error,result,fields){
        if(error){console.log('error')}else{
            if(result[0].PassWord!=req.body.pw){}
            else{
                if(npw==''){npw=req.body.pw;}
                    client.query('UPDATE timetable.user SET PassWord=\''+npw+'\', Name=\''+nm+'\', Grade='+gd+', Major=\''+mj+'\', DoubleMajor1=\''+d1+'\', DoubleMajor2=\''+d2+'\', Minor=\''+mi+'\' WHERE EMail=\''+e+'\';');    
                    var cipher = crypto.createCipher('aes192', crypto_key);
                    var output=cipher.update(e, 'utf8', 'base64');
                    output += cipher.final('base64');
                    if(req.body.autologin){res.cookie('cookieemail',output,{expires:new Date(Date.now()+1000*60*60*24*100)});}
                    else{res.clearCookie('cookieemail');}
                    res.send('<script>alert(\'수정 완료되었습니다.\'); location.href=\"/\"</script>');
            }
        }
    });
};

exports.auto_make = function(req, res){
    var userInfo = req.session.userInfo;
    var EMail = '';
    var Rank='';
    
    try {
        EMail = userInfo.EMail;
        Rank=userInfo.Rank;
    } catch (e) { }
    if (EMail == '') {
       res.render('automake', { title: '시간표 추천','EMail':'손님','Rank':'손님' });
    } else {
        res.render('automake', { title: '시간표 추천','EMail':EMail,'Rank':Rank })
    }
};


//exports.index = function(req, res){
//    var userInfo = req.session.userInfo;
//    var EMail = '';
//    var Rank='';
//    try {
//        EMail = userInfo.EMail;
//        Rank=userInfo.Rank;
//    } catch (e) { }
//    if (EMail == '') {
//       res.render('index', { title: 'YuTime','EMail':'손님','Rank':'손님' });
//    } else {
//    res.render('index', { title: 'YuTime','EMail':EMail,'Rank':Rank })
//    }
//};