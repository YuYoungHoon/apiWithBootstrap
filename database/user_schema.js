//DB 스키마 정의한 모듈

var crypto = require('crypto');

var Schema = {};

Schema.createSchema = function(mongoose) {
  // 스키마 정의
  // password를 hashed_password로 변경
  // 각 칼럼에 default 속성 모두 추가, salt 속성 추가
  UserSchema = mongoose.Schema({
    id: {
      type: String,
      required: true,
      unique: true,
      'default': ''
    },
    hashed_password: {
      type: String,
      required: true,
      'default': ''
    },
    salt: {
      type: String,
      required: true
    }, //암호화에 사용되는 키값
    name: {
      type: String,
      index: 'hashed',
      'default': ''
    }
  });
  // password를 virtual 메소드로(가상저장공간 속성) 정의
  // 특정 속성을 지정하고 set, get 메소드를 정의함
  UserSchema.virtual('password').set(function(password) {
      this._password = password;
      this.salt = this.makeSalt();
      this.hashed_password = this.encryptPassword(password);
      console.log('virtual password의 set 호출됨 : ' + this.hashed_password);
    }).get(function() {
      console.log('virtual password의 get 호출됨');
      return this._password;
    });
  // 스키마에 모델 인스턴스에서 사용할 수 있는 메소드 추가
  // 비밀번호 암호화 메소드
  UserSchema.method('encryptPassword', function(plainText, inSalt) {
    if (inSalt) {
      return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
    } else {
      return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
    }
  });

  // salt 값 만드는 메소드
  UserSchema.method('makeSalt', function() {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  });
  // 인증 메소드 -> 입력된 비밀번호와 비교 (true/false 리턴) 중요
  UserSchema.method('authenticate', function(plainText, inSalt, hashed_password) {
    if (inSalt) {
      console.log('authenticate 호출됨 : %s -> %s : %s', plainText, this.encryptPassword(plainText, inSalt), hashed_password);
      return this.encryptPassword(plainText, inSalt) === hashed_password;
    } else {
      console.log('authenticate 호출됨 : %s -> %s : %s', plainText, this.encryptPassword(plainText), this.hashed_password);
      return this.encryptPassword(plainText) === this.hashed_password;
    }
  });
  // 유효값 확인 함수 정의
  var validatePresenceOf = function(value) {
    return value && value.length;
  };

  // 저장 함수 정의 (password 필드가 유효하지 않으면 에러 발생)
  UserSchema.pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.password)) {
      next(new Error('유효하지 않은 password 입니다'));
    } else {
      next();
    }
  })
  // 필수 속성에 대한 유효성 확인 (길이값 체크)
  UserSchema.path('id').validate(function(id) {
    return id.length;
  }, 'id 칼럼 값이 없음');
  UserSchema.path('name').validate(function(name) {
    return name.length;
  }, 'name 칼럼 값이 없음');
  UserSchema.path('hashed_password').validate(function(hashed_password) {
    return hashed_password.length;
  }, 'hashed_password 칼럼 값이 없음');
  // 스키마에 static으로 findById 메소드 추가
  UserSchema.static('findById', function(id, callback) {
    return this.find({
      id: id
    }, callback);
  });
  // 스키마에 static으로 findAll 메소드 추가
  UserSchema.static('findAll', function(callback) {
    return this.find({}, callback);
  });
  console.log('UserSchema 정의함');
  return UserSchema;
};

// module.exports에 UserSchema 객체 직접 할당함
module.exports = Schema;
