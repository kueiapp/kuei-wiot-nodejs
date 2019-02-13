require('webduino-js');
require('webduino-blockly');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080; //process.env.PORT || 3000;

// setup ports
var server_port = port;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

/** main **/
// server listens in on port
app.listen(server_port, server_ip_address, function () {
	 console.log( "Listening on " + server_ip_address + ", server_port " + server_port );
});

/** doGet **/
app.get('/', function(request, response) {
  response.send('Hello World WIoT!');
});

var myBoard, myBoard2,myBoard3, led, pir, dht, relay, ultrasonic, photocell, matrix, buzzer;
var g_humidity = 0, g_temperature = 0, g_pm25 = 0, g_pm10 = 0, g_sonic = 0;
var light1_state = "0", light2_state = "0";
var myBoardState = 1, myBoard2State = 1, myBoard3State = 1;

/** Functions **/
function doText(text){
  
   if(text == '開燈' || text == 'turnon'){
      led.on();
      relay.on();
      light1_state = "1";
      light2_state = "1";
      return '燈已經開了';
   }
   else if(text == '開一號燈' || text == '開1號燈'){
      led.on();
      light1_state = "1";
      return '燈開了';
   }
   else if(text == '1號燈狀態'){
      // console.log(light1_state)
      return light1_state;
   }
   else if(text == '開二號燈' || text == '開2號燈'){
      relay.on();
      light2_state = "1";
      return '燈開了';
   }
   else if(text == '2號燈狀態'){
      return light2_state;
   }
   else if(text == '關燈' || text == 'turnoff'){
      led.off();
      relay.off();
      light1_state = "0";
      light2_state = "0";
      return '燈全關了';
   }
   else if(text == '關一號燈' || text == '關1號燈'){
      led.off();
      light1_state = "0";
      return '燈關了';
   }
   else if(text == '關二號燈' || text == '關2號燈'){
      relay.off();
      light2_state = "0";
      return '燈關了';
   }
   else if(text == '溫溼度' || text == '溫濕度'){
      return '溫度：' + g_temperature + '度, 溼度：' + g_humidity + '%';
   }
   else if(text == 'dht'){
   	  var obj = {}
   	  obj.temperature = g_temperature
   	  obj.humidity = g_humidity
      return obj;
   }
   else if(text == '溫度'){
      return g_temperature + '度';
   }
   else if(text == '溼度'){
      return g_humidity + '%';
   }
   else if(text == '空氣品質' || text == 'AIQ' || text == '空氣'){
      return 'PM25： ' + g_pm25 + ', PM10： ' + g_pm10;
   }
   else if(text == 'pm25'){
      return g_pm25;
   }
   else if(text == 'pm10'){
      return g_pm10;
   }
   else if(text == 'socic' || text == '聲納'){
      return 'Sonic: '+g_sonic;
   }
   else if(text == '一號開發版狀態'){
      return {state: myBoardState, error: myBoard.error};
   }
   else if(text == '二號開發版狀態'){
      return {state: myBoard2State, error: myBoard2.error};
   }
   else{
      return text;
   }
  
}
//
function deviceIsConnected(){
   if (myBoard === undefined){
      return false;
   }
   else if (myBoard.isConnected === undefined){
      return false;
   }
   else{
      console.log('status:' + myBoard.isConnected)
      return myBoard.isConnected;
   }
}

function deviceIsConnected2(){
   if (myBoard2 === undefined){
      return false;
   }
   else if (myBoard2.isConnected === undefined){
      return false;
   }
   else{
      console.log('status:' + myBoard2.isConnected)
      return myBoard2.isConnected;
   }
}

function buzzer_music(m) {
  var musicNotes = {};
  musicNotes.notes = [];
  musicNotes.tempos = [];
  if (m[0].notes.length > 1) {
    for (var i = 0; i < m.length; i++) {
      if (Array.isArray(m[i].notes)) {
        var cn = musicNotes.notes.concat(m[i].notes);
        musicNotes.notes = cn;
      } else {
        musicNotes.notes.push(m[i].notes);
      }
      if (Array.isArray(m[i].tempos)) {
        var ct = musicNotes.tempos.concat(m[i].tempos);
        musicNotes.tempos = ct;
      } else {
        musicNotes.tempos.push(m[i].tempos);
      }
    }
  } else {
    musicNotes.notes = [m[0].notes];
    musicNotes.tempos = [m[0].tempos];
  }
  return musicNotes;
}

/** main **/
boardReady({
 board: '{DEVICE_TYPE}', 
 device: '{DEVICE_ID}', 
 transport: 'mqtt',
 multi: true
 }, 
 function (board) {
    myBoard = board;
    board.systemReset();
    board.samplingInterval = 100;

    var tmp_humidity, tmp_temperature
    buzzer = getBuzzer(board, 5);
    buzzer.play(buzzer_music([  { notes : ["C6","D6","E6","F6","G6","A6","B6"] , tempos : ["8","8","8","8","8","8","8"] }]).notes ,buzzer_music([  { notes : ["C6","D6","E6","F6","G6","A6","B6"] , tempos : ["8","8","8","8","8","8","8"] }]).tempos );

    led = new webduino.module.Relay(board, board.getDigitalPin(14));
    led.off();

    // Lumin detect
    photocell = getPhotocell(board, 0);
    var lowLight = false
    photocell.measure(function (val) {
      photocell.detectedVal = val;
      var light = ((photocell.detectedVal - (0)) * (1/((1)-(0)))) * ((100)-(0)) + (0);
      console.log(light);
      if (light < 22) {
        lowLight = true;
      } 
      else {
        lowLight = false;
      }
 });//end function   
});

