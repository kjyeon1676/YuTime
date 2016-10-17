var socket=io.connect();
 
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
 var searchTimer=null;
 var Search_Community_Index=0;
 var sessionEmail;
window.onload=function(){
    document.getElementById('timedatadivision').style.maxHeight=window.innerHeight*0.85+"px";
         if(window.innerWidth<1024){
         document.getElementsByClassName('search_width').Search_Bar.style.width="50%";
         document.getElementsByClassName('search_width').timedatadivision.style.width="50%";
         document.getElementById('CourseDetail').style.width="45%";
         document.getElementById('autoconfig').style.width="50%";
         document.getElementById('autoconfig').style.right="-50%";
         
         }
}
window.onresize=function(){
     document.getElementById('timedatadivision').style.maxHeight=window.innerHeight*0.85+"px";
     if(window.innerWidth<1024){
        document.getElementsByClassName('search_width').Search_Bar.style.width="50%";
        document.getElementsByClassName('search_width').timedatadivision.style.width="50%";
        document.getElementById('CourseDetail').style.width="45%";
        document.getElementById('autoconfig').style.width="50%";
         }
     else{
        document.getElementsByClassName('search_width').Search_Bar.style.width="30%";
        document.getElementsByClassName('search_width').timedatadivision.style.width="30%";
        document.getElementById('CourseDetail').style.width="20%";
        document.getElementById('autoconfig').style.width="20%";
         }
}
$(document).ready(function(){ 
    sessionEmail=document.getElementById('EMail').getAttribute('EMail');
    
    if(document.title=='평가 보기'){
    socket.emit('Search_Community',Search_Community_Index);
    Search_Community_Index+=10;
    }
    
    if(document.title=='시간표 만들기'||document.title=='YuTime'){
        if(sessionEmail!='손님'){
            socket.emit('req_mytimetable_data',sessionEmail);
        }
            socket.emit('select_Department');
    }
});
socket.on('select_box_item',function(result){
    result.forEach(function(item){
        $("#deptSelect").append('<option value=\''+item.Major+'\'>'+item.Major+'</option>');
        $("#minorSelect").append('<option value=\''+item.Major+'\'>'+item.Major+'</option>');
        $("#doublemajorSelect").append('<option value=\''+item.Major+'\'>'+item.Major+'</option>');
    });
});

//function toggle_hide_appear(){
//    var cont=document.getElementById('hide_appear_arrow');
//    var top=document.getElementById('hide_appear_arrow_top');
//    var bottom=document.getElementById('hide_appear_arrow_bottom');
//    
//    if(top.style.transform=="rotate(45deg)"){
//        //cont.style.left="-10px";
//    top.style.transform="rotate(-45deg)";
//    bottom.style.transform="rotate(45deg)";
//    document.getElementsByClassName('col-sm-3 col-md-2 sidebar').style.width="0px";
//    } else {
//       // cont.style.left="90%";
//            top.style.transform="rotate(45deg)";
//    bottom.style.transform="rotate(-45deg)";
//    document.getElementsByClassName('col-sm-3 col-md-2 sidebar').style.width="";
//    }
//    
//}
 
function signup_check(){
	 var e=document.getElementById("EMailin");
	 var p=document.getElementById("PassWord");
	 var pr=document.getElementById("PassWordRe");
     var n=document.getElementById('NickName');
     var m=document.getElementById('Major');
	 
	 if(e.value==''){alert('EMail 입력하세요.');e.focus();return false;}
	 else if(e.value.indexOf('@')==-1){alert('메일 형식(@)을 입력하세요.');e.focus();return false;}
	 else if(p.value==""){alert('PassWord 입력하세요.');p.focus();return false;}
	 else if(pr.value==""){alert('PassWord 확인을 입력하세요.');pr.focus();return false;}
	 else if(p.value!=pr.value){alert('패스워드를 확인하세요.');p.focus();}
     else if(n.value==''){alert('이름[닉네임]을 적어주세요.');n.focus();}
     else if(m.value==''){alert('전공을 입력하세요.');m.focus();}
	else{
        document.sign_up.submit();
	}
}

function login_check(){
    var e=document.getElementById("EMailin");
    var p=document.getElementById("PassWord");
    if(e.value==""){alert('EMail 입력하세요.');e.focus();return false;}
    else if(p.value==""){alert('PassWord 입력하세요.');p.focus();return false;}
    else{
        document.login.submit();
    }
}


function Search_Timetable_Info(){
    if(searchTimer!=null){
        clearTimeout(searchTimer);
        searchTimer=null;
    }
    document.getElementById('CourseDetail').style.display='none';
    searchTimer=setTimeout("Search_Timetable()",500);
}

function Search_Timetable(){
        if(searchTimer!=null){
        clearTimeout(searchTimer);
        searchTimer=null;
    }
    var svalue=document.getElementById("Search_Bar").value;
    var index=0;
    if(svalue==''){return;}//모든 데이터 검색
    
    //명령어를 이용한 검색
    if(svalue.indexOf('과목 ')!=-1){if(svalue.length==3){return;}svalue=svalue.substring(3,svalue.length);socket.emit('Search_CourseName',svalue);}
    else if(svalue.indexOf('과목명 ')!=-1){if(svalue.length==4){return;}svalue=svalue.substring(4,svalue.length);socket.emit('Search_CourseName',svalue);}
    else if(svalue.indexOf('건물 ')!=-1){if(svalue.length==3){return;}svalue=svalue.substring(3,svalue.length);socket.emit('Search_Building',svalue);}
    else if(svalue.indexOf('교수 ')!=-1){if(svalue.length==3){return;}svalue=svalue.substring(3,svalue.length);socket.emit('Search_Professor',svalue);}
    else if(svalue.indexOf('교실 ')!=-1){if(svalue.length==3){return;}svalue=svalue.substring(3,svalue.length);socket.emit('Search_Classroom',svalue);}
    else if(svalue.indexOf('분반')!=-1){if(svalue.length==3){return;}svalue=svalue.substring(3,svalue.length);socket.emit('Search_Class',svalue);}
    else if(svalue.indexOf('수강번호 ')!=-1){if(svalue.length==5){return;}svalue=svalue.substring(5,svalue.length);socket.emit('Search_CourseNumber',svalue);}
    else if(svalue.indexOf('시간 ')!=-1){if(svalue.length==3){return;}svalue=svalue.substring(3,svalue.length);socket.emit('Search_Time',svalue);}
    else if(svalue.indexOf('요일 ')!=-1){if(svalue.length==3){return;}svalue=svalue.substring(3,svalue.length);socket.emit('Search_Day',svalue);}
    else if(svalue.indexOf('이수 ')!=-1){if(svalue.length==3){return;}svalue=svalue.substring(3,svalue.length);socket.emit('Search_Division',svalue);}
    else if(svalue.indexOf('학과 ')!=-1){if(svalue.length==3){return;}svalue=svalue.substring(3,svalue.length);socket.emit('Search_Department',svalue);}
    else if(svalue.indexOf('학년 ')!=-1){if(svalue.length==3){return;}svalue=svalue.substring(3,svalue.length);socket.emit('Search_Grade',svalue);}
    else if(svalue.indexOf('학점 ')!=-1){if(svalue.length==3){return;}svalue=svalue.substring(3,svalue.length);socket.emit('Search_Credit',svalue);}
    else if(svalue=='인터넷 강의'){socket.emit('Search_Internet');}
    else if(svalue=='모든 강의'){socket.emit('Search_All');}
    else{
        
        if($.isNumeric(svalue)){
        if(svalue.length==1){socket.emit('Search_Grade_Credit',svalue);return;}//학년,학점
        else if(svalue.length==3){socket.emit('Search_Classroom',svalue);return;}//강의실
        else if(svalue.length==4){socket.emit('Search_CourseNumber',svalue);return;}//수강번호,강의실
        }
        {//글자 포함.
        
        socket.emit('Search_Somthing',svalue);
        //if(svalue.length==1){}//인터넷 강의 , 분반
        
        
        }
    }
}

var timetable_data_list={};
var timetable_mydata_list={};

function delete_search_item(){
    timetable_data_list={};
    $(document.getElementsByClassName('item')).remove();
    var $item=$('<tr></tr>',{'class':'item'});
    var $CourseNumber=$('<th style="text-align:center;width:60px;">수강번호</th>').appendTo($item);
    var $CourseName=$('<th style="text-align:center;width:">과목</th>').appendTo($item);
    var $Professor=$('<th style="text-align:center;width:50px;">교수</th>').appendTo($item);
    //var $Department=$('<th style="text-align:center;">학과</th>').appendTo($item);
    //var $Grade=$('<th style="text-align:center;min-width:30px;">학년</th>').appendTo($item);
    //var $Credit=$('<th style="text-align:center;min-width:30px;">학점</th>').appendTo($item);
    var $Time=$('<th style="text-align:center;width:110px;">강의시간</th>',{'style':'width:110px'}).appendTo($item);
    var $Classroom=$('<th style="text-align:center;width:110px;">강의실</th>').appendTo($item);
    //var $Comment=$('<th style="text-align:center;">비고</th>').appendTo($item);
    //var $Division=$('<th style="text-align:center;min-width:60px;">이수구분</th>').appendTo($item);
    //var $Class=$('<th style="text-align:center;">분반</th>').appendTo($item);
    $item.appendTo(document.getElementById('timedatacontainor'));
}

socket.on('delete_search_item',function(){
    delete_search_item();
});

socket.on('result_search_item',function(item){
    var TimeCount=item.TimeCount;
    timetable_data_list[item.CourseNumber+item.Department]=item;
    var $item=$('<tr></tr>',{style:'cursor:Pointer','id':item.CourseNumber+item.Department,'class':'item','draggable':'true','ondragstart':'drag(this,event)','dragdata':item.CourseNumber+item.Department,'onclick':'move_list_to_table(\'onclick\',\''+item.CourseNumber+item.Department+'\')','onmouseover':'move_list_to_table(\'mouseover\',\''+item.CourseNumber+item.Department+'\')','onmouseout':'remove_at_table(\'onmouseout\',\''+item.CourseNumber+item.Department+'\')'});
    //var $item=$('<tr></tr>',{style:'cursor:Pointer','id':item.CourseNumber+item.Department,'class':'item','draggable':'true','ondragstart':'drag(this,event)','dragdata':item.CourseNumber+item.Department,'onclick':'move_list_to_table(\'onclick\',\''+item.CourseNumber+item.Department+'\')','onmouseover':'test(\'autoconfig\',\''+item.CourseNumber+item.Department+'\')','onmouseout':'remove_at_table(\'onmouseout\',\''+item.CourseNumber+item.Department+'\')'});
    var $CourseNumber=$('<td style="text-align:center;font-size:12px;">'+item.CourseNumber+'</td>').appendTo($item);
    var $CourseName=$('<td style="text-align:center;width:160px;font-size:12px;">'+item.CourseName+'</td>').appendTo($item);
    var $Professor=$('<td style="text-align:center;font-size:12px;">'+item.Professor+'</td>').appendTo($item);
    //var $Department=$('<td>'+item.Department+'</td>').appendTo($item);
    //var $Grade=$('<td style="text-align:center;">'+item.Grade+'</td>').appendTo($item);
    //var $Credit=$('<td style="text-align:center;">'+item.Credit+'</td>').appendTo($item);
    var $Time=$('<td style="text-align:center;width:10px;font-size:12px;">'+item.Time+'</td>').appendTo($item);
    var $Classroom=$('<td style="text-align:center;font-size:12px;">'+item.Classroom+'</td>').appendTo($item);
    //var $Comment=$('<td>'+item.Comment+'</td>').appendTo($item);
    //var $Division=$('<td style="text-align:center;">'+item.Division+'</td>').appendTo($item);
    //var $Class=$('<td style="text-align:center;">'+item.Class+'</td>').appendTo($item);
    
    $item.appendTo(document.getElementById('timedatacontainor'));
    
});

var rewq;
function leadingZeros(n, digits) {
var zero = '';
n = n.toString();
if (n.length < digits) {for (var i = 0; i < digits - n.length; i++){zero += '0';  }}
return zero + n;}

socket.on('result_mytimetable_data',function(item){
    timetable_mydata_list[item.CourseNumber+item.Department]=item;
    move_list_to_table('initialize',item.CourseNumber+item.Department);
})

socket.on('recommand_search_item',function(item){
    
    if(timetable_mydata_list[item.CourseNumber+item.Department]==undefined){
    timetable_mydata_list[item.CourseNumber+item.Department]=item;
    move_list_to_table('autoconfig',item.CourseNumber+item.Department);
    } else {
        //있는과목
    }
})



function move_list_to_table(mouseevent,data){

    if(mouseevent=='mouseover'){
    req_course_detail_data(data);
    }
    
    if(mouseevent=='mouseover'){
        document.getElementById(data).style.backgroundColor='rgb(240,250,255)';
    }
    

    if(mouseevent=='onclick'||mouseevent=='mouseover'){
        data=timetable_data_list[data];
    } else if(mouseevent=='initialize'||mouseevent=='remove'||mouseevent=='autoconfig'){
        data=timetable_mydata_list[data];
    }
    
    var nightclass=0;
    
    var cl=data.Classroom;
    var tm=data.Time;

    var isduplicated=false;
    var t=new Array();
    var c=new Array();
    var tmcnt=0;
    
    var h = (Math.round(Math.random()* 359));
    var bkcolor =  'hsl('+h+',100%,90%)';
    var color =  'hsl('+h+',100%,20%)';
    
    if(tm.length>0){
        tmcnt=parseInt(tm.length/19);
        for(var i=0;i<tmcnt;++i){
            t[i]=tm.substr(i*19,19);
            //console.log(t[i]);
        }
    }
    var pos=0;
    if(cl.length>0){
        for(var i=0;i<tmcnt;++i){
        c[i]=cl.substring(pos,cl.indexOf('<br/>',pos));
        pos=cl.indexOf('<br/>',pos)+5;
        }
    }
    
    
    var target;
    var hr,min;
    var halfcnt;
    var crsnm=data.CourseName;
    var prof=data.Professor;
    var st,et;

        for(var i=0;i<tmcnt;++i){
            st=t[i].substr(3,5);
            et=t[i].substr(9,5);
            
            if(st=='18:50'){st='18:30';}
            else if(st=='19:40'){st='19:00';}
            else if(st=='20:30'){st='19:30';}
            else if(st=='21:20'){st='20:00';}
            else if(st=='22:10'){st='20:30';}
            
            if(et=='18:45'){et='18:29';}
            else if(et=='19:35'){et='18:59';}
            else if(et=='20:25'){et='19:29';}
            else if(et=='21:15'){et='19:59';}
            else if(et=='22:05'){et='20:29';}
            else if(et=='22:55'){et='20:59';}
            t[i]=t[i].substr(0,3)+st+':'+et;
            
    hr=Number(t[i].substr(9,2))-Number(t[i].substr(3,2));
    if(Number(t[i].substr(12,2))>30){min=60-Number(t[i].substr(6,2));}
    else{min=30-Number(t[i].substr(6,2));}
    if(min<0){min+=60;hr--;}
    halfcnt=min+hr*60;
    halfcnt/=30;
        hr=Number(t[i].substr(3,2));
        min=Number(t[i].substr(6,2));
            var tg;
    var tempmin=min,temphr=hr;
    for(var j=0;j<halfcnt;++j){
        if(tempmin>=60){temphr++;tempmin-=60;}
        tg=document.getElementById(t[i].substr(1,1)+leadingZeros(temphr,2)+':'+leadingZeros(tempmin,2));
        if($(tg).hasClass(data.CourseNumber+data.Department)){
            $(document.getElementsByClassName($(tg).attr('class'))).addClass('myclass');
            break;
            }
        else if(tg.getAttribute('rowspan')!=1||tg.style.display=='none'){
            if(mouseevent=='autoconfig'){} else{
                $(document.getElementsByClassName($(tg).attr('class'))).addClass('duplicated');
            }
                if(mouseevent=='onclick'){
                alert('시간 중복입니다.');}
                if(mouseevent=='autoconfig'){
                    console.log('중복///');
                    delete (timetable_mydata_list[data.CourseNumber+data.Department]);
                }
                return;
        }
        tempmin+=30;
    }
        }
        
        

    for(var i=0;i<tmcnt;++i){
                    st=t[i].substr(3,5);
            et=t[i].substr(9,5);
            
            if(st=='18:50'){st='18:30';}
            else if(st=='19:40'){st='19:00';}
            else if(st=='20:30'){st='19:30';}
            else if(st=='21:20'){st='20:00';}
            else if(st=='22:10'){st='20:30';}
            
            if(et=='18:45'){et='18:29';}
            else if(et=='19:35'){et='18:59';}
            else if(et=='20:25'){et='19:29';}
            else if(et=='21:15'){et='19:59';}
            else if(et=='22:05'){et='20:29';}
            else if(et=='22:55'){et='20:59';}
            t[i]=t[i].substr(0,3)+st+':'+et;
    target=document.getElementById(t[i].substr(1,1)+t[i].substr(3,5));

    hr=Number(t[i].substr(9,2))-Number(t[i].substr(3,2));
    if(Number(t[i].substr(12,2))>30){min=60-Number(t[i].substr(6,2));}
    else{min=30-Number(t[i].substr(6,2));}
    if(min<0){min+=60;hr--;}
    halfcnt=min+hr*60;
    halfcnt/=30;
        hr=Number(t[i].substr(3,2));
        min=Number(t[i].substr(6,2));
        
    
        var emit_data={'EMail':sessionEmail,'CourseNumber':data.CourseNumber,'Department':data.Department};
       
        if(mouseevent=='onclick'||mouseevent=='initialize'||mouseevent=='remove'||mouseevent=='autoconfig'){
            if($(target).hasClass('choose')){//remove
                if(mouseevent=='onclick'||mouseevent=='remove'){
                    if(sessionEmail!='손님'&&i==tmcnt-1){
                    socket.emit('remove_mytimetable_data',emit_data);}
                    if(mouseevent!='remove'){
                    delete (timetable_mydata_list[data.CourseNumber+data.Department]);
                    }
                }
                $(target).removeClass('choose');
                target.style.backgroundColor='';
                target.style.color='';
                $(target).removeClass('myclass');
                $(target).children('div').remove();
                }
            else{//add
                if(mouseevent=='onclick'||mouseevent=='autoconfig'){
                    if(sessionEmail!='손님'&&i==tmcnt-1){
                    socket.emit('add_mytimetable_data',emit_data);}
                    if(mouseevent=='onclick'){
                    timetable_mydata_list[data.CourseNumber+data.Department]=timetable_data_list[data.CourseNumber+data.Department];
                    }
                }
                $(target).addClass('choose');
                target.style.backgroundColor=bkcolor;
                target.style.color=color;
                }
        }
        $(target).attr('rowspan',halfcnt);
        
        if(mouseevent=='initialize'||mouseevent=='autoconfig'||(mouseevent=='mouseover'&&!$(target).hasClass('choose'))){
        var $containordiv=$('<div style="position:relative;height:'+$(target).innerHeight()+'px;"></div>');
        $containordiv.appendTo(target);
        
        if(document.title=='시간표 만들기'||document.title=='시간표 추천'){
        $('<div class="containordiv"  onclick="move_list_to_table(\'remove\',\''+data.CourseNumber+data.Department+'\')">×</div>').appendTo($containordiv);
        //$('<div class="containorcolor"><input class="containorcolor" type="range" min=0 max=359 value='+h+'></div>').appendTo($containordiv);
        }
        
        $('<div><strong>'+crsnm+'</strong><font size="1">('+data.CourseNumber+')</font></div>').appendTo($containordiv);
        $('<div style="font-size:10px">'+prof+'</div>').appendTo($containordiv);
        if(cl.length>0)
        $('<div style="font-size:11px;">'+c[i]+'</div>').appendTo($containordiv);
        //target.textContent+=c[i];
        }
        $(target).addClass(data.CourseNumber+data.Department);
       
    for(var j=1;j<halfcnt;++j){
        min+=30;
        if(min>=60){hr++;min-=60;}
        document.getElementById(t[i].substr(1,1)+leadingZeros(hr,2)+':'+leadingZeros(min,2)).style.display="none";
        $(document.getElementById(t[i].substr(1,1)+leadingZeros(hr,2)+':'+leadingZeros(min,2))).addClass(data.CourseNumber+data.Department);
        if(mouseevent=='onclick'||mouseevent=='initialize'||mouseevent=='remove'||mouseevent=='autoconfig'){
            tg=document.getElementById(t[i].substr(1,1)+leadingZeros(hr,2)+':'+leadingZeros(min,2));
            if($(tg).hasClass('choose')){$(tg).removeClass('choose');}
            else{$(tg).addClass('choose');}
        }
    }
    }
    if(mouseevent=='remove'){
    remove_at_table('remove',data.CourseNumber+data.Department);
    delete (timetable_mydata_list[data.CourseNumber+data.Department]);
    }
}



function remove_at_table(mouseevent,data){    

    if(mouseevent=='onmouseout'){
        document.getElementById(data).style.backgroundColor='';
    }
    
    if(mouseevent=='remove'){
        data=timetable_mydata_list[data];
    }
    else{
        data=timetable_data_list[data];
    }
    
    var tm=data.Time;
    var t=new Array();
    
    if(tm.length>0){
        tmcnt=parseInt(tm.length/19);
        for(var i=0;i<tmcnt;++i){
        t[i]=tm.substr(i*19,19);
        //console.log(t[i]);
        }
    }
    
    for(var i=0;i<tmcnt;++i){
                    st=t[i].substr(3,5);
            et=t[i].substr(9,5);
            
            if(st=='18:50'){st='18:30';}
            else if(st=='19:40'){st='19:00';}
            else if(st=='20:30'){st='19:30';}
            else if(st=='21:20'){st='20:00';}
            else if(st=='22:10'){st='20:30';}
            
            if(et=='18:45'){et='18:29';}
            else if(et=='19:35'){et='18:59';}
            else if(et=='20:25'){et='19:29';}
            else if(et=='21:15'){et='19:59';}
            else if(et=='22:05'){et='20:29';}
            else if(et=='22:55'){et='20:59';}
            t[i]=t[i].substr(0,3)+st+':'+et;
    var hr=Number(t[i].substr(9,2))-Number(t[i].substr(3,2));
    if(Number(t[i].substr(12,2))>30){min=60-Number(t[i].substr(6,2));}
    else{min=30-Number(t[i].substr(6,2));}
    if(min<0){min+=60;hr--;}
    var halfcnt=min+hr*60;
    halfcnt/=30;
    
    hr=Number(t[i].substr(3,2));
    min=Number(t[i].substr(6,2));
    
    var tg;
    var tempmin=min,temphr=hr;
    for(var j=0;j<halfcnt;++j){
        if(tempmin==60){temphr++;tempmin-=60;}
        tg=document.getElementById(t[i].substr(1,1)+leadingZeros(temphr,2)+':'+leadingZeros(tempmin,2));
        if($(tg).hasClass('choose')){
                $(document.getElementsByClassName($(tg).attr('class'))).removeClass('duplicated');
                $(document.getElementsByClassName($(tg).attr('class'))).removeClass('myclass');
            return;
            }
        tempmin+=30;
    }
    
    $(document.getElementById(t[i].substr(1,1)+leadingZeros(hr,2)+':'+leadingZeros(min,2))).removeClass(data.CourseNumber+data.Department);
    //$(document.getElementById(t[i].substr(1,1)+leadingZeros(hr,2)+':'+leadingZeros(min,2))).removeClass('myclass');
    $(document.getElementById(t[i].substr(1,1)+leadingZeros(hr,2)+':'+leadingZeros(min,2))).attr('rowspan',1);
    $(document.getElementById(t[i].substr(1,1)+leadingZeros(hr,2)+':'+leadingZeros(min,2))).children('div').remove();
    document.getElementById(t[i].substr(1,1)+leadingZeros(hr,2)+':'+leadingZeros(min,2)).textContent='';

    for(var j=1;j<halfcnt;++j){
    min+=30;
    if(min==60){hr++;min-=60;}
    $(document.getElementById(t[i].substr(1,1)+leadingZeros(hr,2)+':'+leadingZeros(min,2))).removeClass('myclass');
    $(document.getElementById(t[i].substr(1,1)+leadingZeros(hr,2)+':'+leadingZeros(min,2))).removeClass(data.CourseNumber+data.Department);
    document.getElementById(t[i].substr(1,1)+leadingZeros(hr,2)+':'+leadingZeros(min,2)).style.display="";
    }
    }
    
}

function req_course_detail_data(data){
    var item=timetable_data_list[data];
    
    $(document.getElementsByClassName('det_time_datas')).remove();
    document.getElementById('CourseDetail').style.display='';
    
    document.getElementById('det_year').textContent=item.Year+'년도 '+item.Semester+'학기';
    document.getElementById('det_name').textContent=item.CourseName;
    document.getElementById('det_number').textContent='['+item.CourseNumber+']';
    document.getElementById('det_professor').textContent=item.Professor;
    document.getElementById('det_dept').textContent=item.Department;
    document.getElementById('det_grade').textContent=item.Grade+'학년';
    document.getElementById('det_credit').textContent=item.Credit+'학점';
    document.getElementById('det_division').textContent=item.Division;
    
    var det_ispass=document.getElementById('det_ispass');
    var det_inet=document.getElementById('det_inet');
    var det_self=document.getElementById('det_self');
    var det_other=document.getElementById('det_other');
    var det_double=document.getElementById('det_double');
    var det_minor=document.getElementById('det_minor');
    
    if(item.IsPass=='0'){det_ispass.style.color='rgb(200,200,200)';det_ispass.textContent='';}
    else{det_ispass.style.color='black';det_ispass.textContent='패스/패일 과목';}
    if(item.InternetGroup==''){det_inet.textContent='인터넷 강의 아님';det_inet.style.color='rgb(200,200,200)';}
    else{det_inet.textContent='인터넷 그룹 '+item.InternetGroup;det_inet.style.color='black';}
    if(item.Class==''){document.getElementById('det_class').textContent='분반 없음';} 
    else{document.getElementById('det_class').textContent='분반 '+item.Class;}
    if(item.SelfDeptAllow=='0'){det_self.style.color='rgb(200,200,200)';det_self.textContent='자과 수강 불가능';}
    else{det_self.style.color='black';det_self.textContent='자과 수강 가능';}
    if(item.OtherDeptAllow=='0'){det_other.style.color='rgb(200,200,200)';det_other.textContent='타과수강 불가능';}
    else{det_other.style.color='black';det_other.textContent='타과 수강 가능';}
    if(item.DoubleMajorAllow=='0'){det_double.style.color='rgb(200,200,200)';det_double.textContent='복수전공 수강 불가능';}
    else{det_double.style.color='black';det_double.textContent='복수전공 수강 가능';}
    if(item.MinorAllow=='0'){det_minor.style.color='rgb(200,200,200)';det_minor.textContent='부전공 수강 불가능';}
    else{det_minor.style.color='black';det_minor.textContent='부전공 수강 가능';}
    
    document.getElementById('det_comment').textContent=item.Comment;
    
    var t=new Array();
    var c=new Array();
    var tmcnt=0;
    
    if(item.Time.length>0){
        tmcnt=parseInt(item.Time.length/19);
        for(var i=0;i<tmcnt;++i){
            t[i]=item.Time.substr(i*19,19);
        }
    }
    var pos=0;
    if(item.Classroom.length>0){
        for(var i=0;i<tmcnt;++i){
        c[i]=item.Classroom.substring(pos,item.Classroom.indexOf('<br/>',pos));
        pos=item.Classroom.indexOf('<br/>',pos)+5;
        }
    }
    
    if(tmcnt==0){document.getElementById('det_time_class').textContent='강의시간이 따로 없는 과목입니다.';}
    else{document.getElementById('det_time_class').textContent='';}
        
    
    for(var i=0;i<tmcnt;++i)
    {
        $('<div class="det_time_datas">시간 - '+t[i]+'</div>').appendTo(document.getElementById('det_time_class'));
         if(item.Classroom.length>0){
             $('<div class="det_time_datas">강의실 - '+c[i]+'</div>').appendTo(document.getElementById('det_time_class'));
         }
    }
    
    
}


//function allowDrop(target,ev){
//    ev.preventDefault();
//}
//function drag(target,ev){
//    ev.dataTransfer.setData('dragdata',target.getAttribute('dragdata'));
//    //target.style.backgroundColor="rgb(255,238,188)";
//}
//function drop(target,ev){
//    //ev.preventDefault();
//    var data=ev.dataTransfer.getData('dragdata');
//        id=document.getElementById(data);
//    id.style.backgroundColor="rgb(249, 204, 157)";
//   move_list_to_table(target,data);
//   
//    if(sessionEmail!='손님'){
//        socket.emit();//회원일때 데이터 저장
//    }
//}

function toggle_evaluation_detail(id){
    var element=document.getElementById(id);
    
    if(element.style.opacity==0){//나타냄
        element.style.height="200px";
        element.style.visibility="visible";
        element.style.opacity=1;
        element.style.borderBottom="solid 1px";
        element.style.padding="10px";
        document.getElementById('tri'+id).style.transform="rotate(180deg)";
        document.getElementById('tri'+id).style.color="purple";
        document.getElementById('cont'+id).style.backgroundColor="rgba(133, 200, 155, 0.8)";
        document.getElementById('cont'+id).style.fontWeight="bold";
    }
    else{//없앰
        element.style.height="0px";
        element.style.opacity=0;
        element.style.visibility="hidden";
        element.style.borderBottom="0px";
        element.style.padding="0px";
        document.getElementById('tri'+id).style.transform="rotate(0deg)";
        document.getElementById('tri'+id).style.color="black";
        document.getElementById('cont'+id).style.backgroundColor="";
        document.getElementById('cont'+id).style.fontWeight="";
    }
}

function click_star(target) {
     var score=3;
     $(target).parent().children("a").removeClass("on");
     $(target).addClass("on").prevAll("a").addClass("on");
     score=$(target).prevAll('a').length+1;
     $(target).parent().attr('score',score);
     return false;
};

function calc_text_length(ta,id){
    if(ta.value.length>5000){
        ta.value=ta.value.substring(0,5000);
    }
    document.getElementById(id).textContent=ta.value.length+'/5000';
}

function calc_credit(id){
    var cd=document.getElementById('creditup'+id).textContent;
    
    var new_credit=Number(document.getElementById('credit'+id).value);
    var cp;
    var cmp;
    cp=Number(cd.substring(0,cd.indexOf('/')));
    var dv=document.getElementById('div'+id).textContent;
    
    var rat_all=Number(document.getElementById('rat_all').getAttribute('M'));
    var rat_alld=Number(document.getElementById('rat_all').getAttribute('D'));
    var rat_maj=Number(document.getElementById('rat_maj').getAttribute('M'));
    var rat_majd=Number(document.getElementById('rat_maj').getAttribute('D'));
    var rat_lib=Number(document.getElementById('rat_lib').getAttribute('M'));
    var rat_libd=Number(document.getElementById('rat_lib').getAttribute('D'));
    var rat_tec=Number(document.getElementById('rat_tec').getAttribute('M'));
    var rat_tecd=Number(document.getElementById('rat_tec').getAttribute('D'));
    var rat_nor=Number(document.getElementById('rat_nor').getAttribute('M'));
    var rat_nord=Number(document.getElementById('rat_nor').getAttribute('D'));
    
    if(cd.indexOf('/')+1!=cd.length){
        cmp=Number(cd.substring(cd.indexOf('/')+1,cd.length));
        rat_all-=cp*cmp;
        rat_alld-=cp;
        
        if(dv=='전공교양'){rat_maj-=cp*cmp;rat_majd-=cp;}
        else if(dv=='교직'){rat_tec-=cp*cmp;rat_tecd-=cp;}
        else if(dv=='일반선택'){rat_nor-=cp*cmp;rat_nord-=cp;}
        else if(dv.indexOf('교양')!=-1){rat_lib-=cp*cmp;rat_libd-=cp;}
        else if(dv.indexOf('전공')!=-1){rat_maj-=cp*cmp;rat_majd-=cp;}
        else{console.log('다른과목')}
        
    }
        rat_all+=cp*new_credit;
        rat_alld+=cp;
        document.getElementById('rat_all').setAttribute('M',rat_all);document.getElementById('rat_all').setAttribute('D',rat_alld);
        document.getElementById('rat_all').textContent='총 평점 평균 '+(rat_all/rat_alld).toFixed(2)+'/4.5';
        if(dv=='전공교양'){
            rat_maj+=cp*new_credit;rat_majd+=cp;document.getElementById('rat_maj').textContent='전공 평점 평균 '+(rat_maj/rat_majd).toFixed(2)+'/4.5';
             document.getElementById('rat_maj').setAttribute('M',rat_maj);document.getElementById('rat_maj').setAttribute('D',rat_majd);}
        else if(dv=='교직'){
            rat_tec+=cp*new_credit;rat_tecd+=cp;document.getElementById('rat_tec').textContent='교직 평점 평균 '+(rat_tec/rat_tecd).toFixed(2)+'/4.5';
            document.getElementById('rat_tec').setAttribute('M',rat_tec);document.getElementById('rat_tec').setAttribute('D',rat_tecd);}
        else if(dv=='일반선택'){
            rat_nor+=cp*new_credit;rat_nord+=cp;document.getElementById('rat_nor').textContent='일반선택 평점 평균 '+(rat_nor/rat_nord).toFixed(2)+'/4.5';
            document.getElementById('rat_nor').setAttribute('M',rat_nor);document.getElementById('rat_nor').setAttribute('D',rat_nord);}
        else if(dv.indexOf('교양')!=-1){
            rat_lib+=cp*new_credit;rat_libd+=cp;document.getElementById('rat_lib').textContent='교양 평점 평균 '+(rat_lib/rat_libd).toFixed(2)+'/4.5';
            document.getElementById('rat_lib').setAttribute('M',rat_lib);document.getElementById('rat_lib').setAttribute('D',rat_libd);}
        else if(dv.indexOf('전공')!=-1){
            rat_maj+=cp*new_credit;rat_majd+=cp;document.getElementById('rat_maj').textContent='전공 평점 평균 '+(rat_maj/rat_majd).toFixed(2)+'/4.5';
            document.getElementById('rat_maj').setAttribute('M',rat_maj);document.getElementById('rat_maj').setAttribute('D',rat_majd);}
        else{console.log('다른과목')}

}

//need_debug
function send_evaluation(id){

    calc_credit(id);
    
    var befcred=document.getElementById('creditup'+id);
    
    
    var Ack=document.getElementById('Ack'+id);
    Ack.style.transition="0s";
    Ack.style.color="red";
    var target=document.getElementById(id);
    var CourseNum=id.substr(0,4);
    var Dep=id.substring(4,id.length);
    var credit=document.getElementById('credit'+id).value;
    var ispublic;
    if(document.getElementById('public'+id).checked){ispublic=1;}
    else{ispublic=0;}
    var score=document.getElementById('score'+id).getAttribute('score');
    var text=document.getElementById('text'+id).value;
    var EMail=sessionEmail;

    var containor={
        'CourseNumber':CourseNum,
        'Department':Dep,
        'EMail':EMail,
        'MyCredit':credit,
        'ispublic':ispublic,
        'score':score,
        'text':text
        };
    socket.emit('submit_evaluation',containor);
}

socket.on('submit_evaluation_Ack',function(id){
    console.log(id);
    var Ack=document.getElementById('Ack'+id);
    Ack.style.transition="3s"
    Ack.textContent='저장되었습니다.';
    Ack.style.color="Black";
    
    var credit=document.getElementById('creditup'+id);
    credit.textContent=credit.textContent.substring(0,2)+document.getElementById('credit'+id).value;
    
});


function Search_Community_Info(){
    if(searchTimer!=null){
        clearTimeout(searchTimer);
        searchTimer=null;
    }
    searchTimer=setTimeout("Search_Community()",500);
}

function Search_Community(){
    var svalue=document.getElementById('community_search').value;
    Search_Community_Index=0;
    if(svalue==''){socket.emit('Search_Community',Search_Community_Index);Search_Community_Index;}//
    else if(svalue.indexOf('과목 ')!=-1){if(svalue.length==3){return;}svalue=svalue.substring(3,svalue.length);socket.emit('Search_Community_CourseName',svalue,Search_Community_Index);}
    else if(svalue.indexOf('교수 ')!=-1){if(svalue.length==3){return;}svalue=svalue.substring(3,svalue.length);socket.emit('Search_Community_Professor',svalue,Search_Community_Index);}
    else if(svalue.indexOf('수강번호 ')!=-1){if(svalue.length==5){return;}svalue=svalue.substring(5,svalue.length);socket.emit('Search_Community_CourseNumber',svalue,Search_Community_Index);}
    else{return;}
        $(document.getElementsByClassName('item')).remove();
    Search_Community_Index+=10;
        
}

socket.on('Search_Community_Result',function(item){
    
    var $item=$('<div></div>',{'class':'item',style:'border:solid 1px;margin-bottom:5px; padding:1%; border-radius:5px;'});
    var $info=$('<div style="border-bottom:solid 1px rgba(50,50,50,0.2);margin-bottom:5px;padding-bottom:5px;">['+item.Division+']'+item.CourseName+'('+item.CourseNumber+') - '+item.Professor+' ['+item.Grade+'학년,'+item.Department+'학과에 개설됨.]</div>').appendTo($item);
    var credit;
    if(item.IsPublic==1){
        if(item.MyCredit==4.5){credit='A+';}
        else if(item.MyCredit==4){credit='A';}
        else if(item.MyCredit==3.5){credit='B+';}
        else if(item.MyCredit==3){credit='B';}
        else if(item.MyCredit==2.5){credit='C+';}
        else if(item.MyCredit==2){credit='C';}
        else if(item.MyCredit==1.5){credit='D+';}
        else if(item.MyCredit==1){credit='D';}
        else if(item.MyCredit==0){credit='F';}
    } else {
        credit='비공개';
    }
    var score='';
    for(var i=0;i<item.Score;++i){
        score+='★';}
    var $persinfo=$('<div>'+item.Name+' 학점['+credit+'] '+score+'</div>').appendTo($item);
    var $hr=$('<hr style="border-color:rgba(150,55,33,0.4);">').appendTo($item);
    var $eval=$('<div style="word-break:break-all;">'+item.Evaluation+'</div>').appendTo($item);
    
    $item.appendTo(document.getElementById('communitycontainor'));
});

$(window).scroll(function(){
    if(document.title=='평가 보기'){
if (jQuery(window).scrollTop() == jQuery(document).height() - jQuery(window).height()) {
    
    var svalue=document.getElementById('community_search').value;
    if(svalue==''){socket.emit('Search_Community',Search_Community_Index);}//
    else if(svalue.indexOf('과목 ')!=-1){if(svalue.length==3){return;}svalue=svalue.substring(3,svalue.length);socket.emit('Search_Community_CourseName',svalue,Search_Community_Index);}
    else if(svalue.indexOf('교수 ')!=-1){if(svalue.length==3){return;}svalue=svalue.substring(3,svalue.length);socket.emit('Search_Community_Professor',svalue,Search_Community_Index);}
    else if(svalue.indexOf('수강번호 ')!=-1){if(svalue.length==5){return;}svalue=svalue.substring(5,svalue.length);socket.emit('Search_Community_CourseNumber',svalue,Search_Community_Index);}
          Search_Community_Index+=10;
      }
    }
});

var topind=0;

$(window).on('mousewheel',function(e){

		var wheelDelta = e.originalEvent.wheelDelta;
        var target=document.getElementById('timetablecontainor');
        
if(document.title=='시간표 만들기'){
		if(wheelDelta > 0){

			console.log("up");
            topind+=10;
            target.style.marginTop=topind;
            
		}else{

		console.log("down");
        topind-=10;
            target.style.marginTop=topind;
        
}}

});



function preference_submit(){
    if(document.getElementById('npw').value!=document.getElementById('npwc').value){alert('비밀번호가 같지 않습니다.');return;}
    if(document.getElementById('NickName').value==''){alert('이름[닉네임] 은 필수 항목 입니다.');return;}
    if(document.getElementById('Major').value==''){alert('전공 은 필수 항목 입니다.');return;}
    if(document.getElementById('pw').value==''){alert('개인 정보 변경시 패스워드를 입력해야 합니다.'); return;}
    
    document.preference.submit();
}


function insert_badkeyword(){
    var input=document.getElementById('badkeywordsinput');
    if(input.value==''){return;}
    else{
        var bk=document.getElementById('badkeywords');
        if(bk.textContent.indexOf(input.value)!=-1){input.value=''; alert('이미 있는 키워드 입니다.');return;}
        bk.textContent+=','+input.value;
        socket.emit('insert_badkeyword',input.value);
        input.value=''
    }

}

function update_user_rank(em,val){
    socket.emit('update_user_rank',em,val);
}
function fix_evaluation(tg,e,cn,dp){
    console.log($(tg).parent().text())
    $(tg).parent().text('바르고 고운말을 씁시다.');
    socket.emit('update_evaluation',e,cn,dp);
}
function broadcast_to_online(){
    var bc=document.getElementById('broadcast_text');
    socket.emit('broadcast_to_online',bc.value);
    bc.value='';
    bc.focus();
}


var noticetimer;
socket.on('broadcast_recieve',function(data){
    Close_Notice();
    var notice=document.getElementById('Notice');
    notice.textContent=data;
    noticetimer=setTimeout('Close_Notice()',10000);
    notice.style.top="1%";
});

function Close_Notice(){
    clearTimeout(noticetimer);
    var notice=document.getElementById('Notice');
    notice.style.top="-10%";
    notice.textContent='';
}


//

function recommand_major_table(btndivision){
    var dayList = new Array();
    var gradeList = new Array();
    var day = document.getElementsByName("day");
    var grade = document.getElementsByName("grade");
    
    var daylength = day.length;
    var gradelength = grade.length;
    var sendQuery = "s";
    if(day[0].checked){ dayList[0] = day[0].value;}
    if(day[1].checked){ dayList[1] = day[1].value;}
    if(day[2].checked){ dayList[2] = day[2].value;}
    if(day[3].checked){ dayList[3] = day[3].value;}
    if(day[4].checked){ dayList[4] = day[4].value;}
    
    if(grade[0].checked){ gradeList[0] = grade[0].value;}
    if(grade[1].checked){ gradeList[1] = grade[1].value;}
    if(grade[2].checked){ gradeList[2] = grade[2].value;}
    if(grade[3].checked){ gradeList[3] = grade[3].value;}
    
    var deptSelect = $("#deptSelect option:selected").text();
    var minorSelect = $("#minorSelect option:selected").text();
    var doublemajorSelect = $("#doublemajorSelect option:selected").text();
    
    for(var i=0; i<daylength; i++){
        if(dayList[i]){ //만약 배열에 값이 있다면
            sendQuery += dayList[i];
        }else{
            sendQuery += "0";
        }
    }
    sendQuery+="#";
    for(var i=0; i<gradelength; i++){
        if(gradeList[i]){
            sendQuery += gradeList[i].substring(0,1);
        }else{
            sendQuery += "0";
        }
    }
    sendQuery+="#";
    sendQuery+=deptSelect+"#";
    sendQuery+=minorSelect+"#";
    sendQuery+=doublemajorSelect;
    if(btndivision.name=='major'){
        sendQuery+="#"+"전공";
    }
    else if(btndivision.name=='other'){
        sendQuery+="#"+"교양";
    }
    else if(btndivision.name=='dobuemajor'){
        sendQuery+="#"+"복전";
    }
    else if(btndivision.name=='minor'){
        sendQuery+="#"+"부전";
    }
    socket.emit('req_autoconfig',sendQuery);
}

function toggle_autoconfig(){
    var btn=document.getElementById('autoconfigbtn');
    var pannel=document.getElementById('autoconfig');
    var det=document.getElementById('CourseDetail');
    if(pannel.style.right='-1px'){
    pannel.style.right='-20%';
    if(window.innerWidth<1024){
        pannel.style.right='-50%';
    }
    //btn.style.display='';
    btn.style.right='-1px'
    det.style.marginTop='0px';
    //$(target).children('div').css('display','');
   // $(target).children('button').css('display','');
    }
}
function autoconfigbtn(){
    var btn=document.getElementById('autoconfigbtn');
    var pannel=document.getElementById('autoconfig');
    var det=document.getElementById('CourseDetail');
    pannel.style.right='-1px';
    //btn.style.display='none';
    btn.style.right='-150px'
    det.style.marginTop='550px';
}



//
