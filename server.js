const port = process.env.PORT || 9999;
var express = require('express'); // 설치한 express module을 불러와서 변수(express)에 담습니다.
var app = express(); //express를 실행하여 app object를 초기화 합니다.
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');
var request = require('request');
//lodding config
const config = require('./config');
// view engine - ejs 사용 set
app.set('view engine', 'ejs');
// app.set('views', './menus');// views 경로 지정
app.set('views', path.join(__dirname, '/views')); // views 경로 지정
// app.set('views', __dirname+'/menus');// views 경로 지정
// set the secret key variable for jwt
app.set('jwt-secret', config.secret);
 //미들웨어 설정
app.use(bodyParser.json());
//app에 바디파서 모듈 연결.
app.use(bodyParser.urlencoded({extended: false}));
//template engine HTML 코드 가독성 높이기
app.locals.pretty = true;
//Express-정적파일을 서비스하는 법 .1
app.use(express.static('public'));
// configure api router
app.use('/api', require('./routes/api'));

app.get('/', function(req, res){
  res.redirect('/login');
});
app.get('/login', function(req, res) {
  res.render('login');
});
app.get('/main', function(req, res) {
  res.render('main');
});
app.get('/groupList', function(req, res) {
  res.render('groupList');
});
app.get('/groupListDetail', function(req, res) {
  res.render('groupListDetail');
});
app.get('/allDeviceList', function(req, res) {
  res.render('allDeviceList');
});
app.get('/alldeviceDetail', function(req, res) {
  res.render('alldeviceDetail');
});
app.get('/table2', function(req, res) {
  res.render('table2');
});
app.get('/buttons', function(req, res) {
  res.render('buttons');
});
app.get('/blank', function(req, res) {
  res.render('blank');
});
app.get('/icons', function(req, res) {
  res.render('icons');
});
app.get('/gatewayInfo', function(req, res) {
  res.render('gatewayInfo');
});
app.get('/userProfile', function(req, res) {
  res.render('users/userProfile');
});

// open the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
//CONNECT TO MONGODB SERVER
mongoose.connect(config.mongodbUri);
const db = mongoose.connection
db.on('error', console.error)
db.once('open', () => {
  console.log('connected to mongodb server')
});
