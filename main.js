$(document).ready(function(){

 var cuDate= new Date();

 var hours=12;
 date=new Date();

 date.setHours(date.getHours()+hours);
 var addyear = date.getFullYear();
 var addmonth = date.getMonth();
 var addday = date.getDate();
 var addhours = date.getHours();
 var addhmin = date.getMinutes();
 var addsec= date.getSeconds();

 //var note = $('#note'),

  ts = new Date(addyear, addmonth, addday, addhours, addhmin, addsec),
  newYear = true;

 if((new Date()) > ts){

  ts = (new Date()).getTime() + 10*24*60*60*1000;
  newYear = false;
 }

 $('#countdown').countdown({
  timestamp : ts,
  format: 'hh:mm:ss',
  startTime: "12:32:55",
  callback : function(days, hours, minutes, seconds){

   var message = "";

   message += "Дней: " + days +", ";
   message += "часов: " + hours + ", ";
   message += "минут: " + minutes + " и ";
   message += "секунд: " + seconds + " <br />";

   //note.html(message);
  }
 });

});