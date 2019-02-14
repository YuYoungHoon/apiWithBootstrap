//뒤로가기 막기
window.history.forward();

function noBack() {
  window.history.forward();
}
//user 확인후 토큰 발행
// function loginCheck(form) {
//   var loginId = form.loginId.value;
//   var password = form.password.value;
//   var data = {
//     "loginId": loginId,
//     "password": password
//   };
//
//   $.ajax({
//     type:"POST",
//     url:"/api/auth/token",
//     dataType:"JSON",
//     data:data,
//     headers:{
//       "Accept": "application/json",
//       "Content-type": "application/json"
//     },
//     success:function(res) {
//       console.log(res);
//       // localStorage.setItem('aToken', res.token);
//       // localStorage.setItem('userId', loginId);
//       window.location.href = "/main";
//     },
//     error:function(res){
//       console.log(res);
//       alert("로그인 정보 확인");
//     }
//   })
// }

//user 확인후 토큰 발행
function loginCheck(form) {
  var loginId = form.loginId.value;
  var password = form.password.value;
  var data = {
    "loginId": loginId,
    "password": password
  };
  var json = JSON.stringify(data);
  // var url = "http://localhost:5000/api/auth/token";
  var url = "/api/auth/token";
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(e) {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        localStorage.setItem('aToken', data.token);
        localStorage.setItem('userId', loginId);
        window.location.href = "/main";
      } else {
        alert("로그인 정보 확인")
        console.log(xhr.responseText);
      }
    }
  }
  xhr.open("POST", url, false); //(method, url, sync)
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(json);
}
//logOut localStorage all clear
function logOut() {
  localStorage.clear();
  window.location.href = "/login";
}
