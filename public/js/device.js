const url = "https://ls1.neoidm.com/api/v1.0";
const method = "2";
const token = localStorage.getItem('token');
const instance = localStorage.getItem('instance');
// / 60s 는 60000ms 4분이 지날 때마다 tokenRedirect실행 함수를 실행합니다
$(document).ready(function() {
  // console.log(secret);?
  $.ajax({
    type: "GET",
    url: "./xmls/setting.xml",
    dataType: "xml",
    success: function(xml) {
      $(xml).find("tokentime").each(function() {
        var interval = $(this).text();
        setInterval('tokenRedirect();', interval);
      });
    }
  });
});
//get url queryString
var getParameter = function(param) {
  var returnValue;
  var url = location.href;
  var parameters = (url.slice(url.indexOf('?') + 1, url.length)).split('&');
  for (var i = 0; i < parameters.length; i++) {
    var varName = parameters[i].split('=')[0];
    if (varName.toUpperCase() == param.toUpperCase()) {
      returnValue = parameters[i].split('=')[1];
      return decodeURIComponent(returnValue);
    }
  }
};
//검색
// $(document).ready(function() {
//   $("#searchBtn").click(function() {
//     var checkedVal;
//     var value;
//     var k = $("#keyword").val();
//     $("#my-table > tbody > tr").hide();
//     //:nth-child() 는 자식 요소 집합에서 선택한 색인에 위치한 자식을 찾는 요소
//     var temp = $("#my-table > tbody > tr > td:nth-child(n+2):contains('" + k + "')");
//     // var temp = $("#my-table > tbody > tr > td:nth-child("+value+"):contains('" + k + "')");
//     $(temp).parent().show();
//     if (!k) {
//       $("#my-table > tbody > tr ").show();
//     }
//   })
// });
//neoIDM 접속
function getToken() {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://ls1.neoidm.com/api/v1.0/login');
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(JSON.stringify({
    loginId: 'atecap',
    password: 'atecap'
  }));
  xhr.onreadystatechange = function(e) {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        localStorage.setItem('token', data.rData);
      } else {
        alert(xhr.responseText);
      }
    }
  }
}
//token 재생성
function tokenRedirect() {
  $.ajax({
    url: "https://ls1.neoidm.com/api/v1.0/login/token",
    type: 'POST',
    headers: {
      "Authorization": "Bearer " + token
    },
    success: function(res) {
      localStorage.removeItem('token');
      var data = JSON.parse(res);
      var token = JSON.stringify(data.rData);
      localStorage.setItem('token', data.rData);
    }
  });
}
//productList 생성
function getGroupList() {
  var bodyId = document.getElementById("my-tbody");
  var pageNo = 1;
  var numOfRows = 10;
  $.ajax({
    url: "https://ls1.neoidm.com/api/v1.0/product/list",
    type: 'GET',
    headers: {
      "Authorization": "Bearer " + token
    },
    data: {
      pageNo: pageNo,
      numOfRows: numOfRows
    },
    success: function(res) {
      var data = JSON.parse(res);
      var jsonData = data.list

      var num = 0;
      for (var i in jsonData) {
        num++;
        var row = bodyId.insertRow(bodyId.rows.length);
        //표 상단 컬럼 생성
        var cell0 = row.insertCell(0); //Number
        var cell1 = row.insertCell(1); //Product Manager
        var cell2 = row.insertCell(2); //Current Firmware Version
        var cell3 = row.insertCell(3); //Description
        var cell4 = row.insertCell(4); //HW Version

        cell0.innerHTML = num;
        cell1.innerHTML = "<a href='/groupDetail' style='cursor:pointer'>" +
          jsonData[i].productName +
          "</a>";
        cell2.innerHTML = jsonData[i].currentFirmwareVersion;
        cell3.innerHTML = jsonData[i].description;
        cell4.innerHTML = jsonData[i].hwVersion;
      }
    },
    error: function(res) {
      if (!res.resresponseText) {
        alert("Empty Group!");
        window.location.href = "/main";
      }
    }
  });
}
//productList 상세,
function getgroupDetail() {
  var bodyId = document.getElementById("my-tbody");
  var pageNo = 1;
  var numOfRows = 10;
  $.ajax({
    url: "https://ls1.neoidm.com/api/v1.0/device/list",
    type: 'GET',
    headers: {
      "Authorization": "Bearer " + token
    },
    data: {
      pageNo: pageNo,
      numOfRows: numOfRows
    },
    success: function(res) {
      var data = JSON.parse(res);
      var jsonData = data.list;
      //productId 처리
      var hiddenInput = document.getElementById('hiddenInput');
      hiddenInput.value = jsonData[0].product.productID;
      var owner;
      var regdate;
      var num = 0;
      //console.log(jsonData);
      for (var i in jsonData) {
        num++;
        var row = bodyId.insertRow(bodyId.rows.length);
        var cell0 = row.insertCell(0); //no
        var cell1 = row.insertCell(1); //Device ID
        var cell2 = row.insertCell(2); //Name
        var cell3 = row.insertCell(3); //Device Owner
        var cell4 = row.insertCell(4); //Reg Status
        var cell5 = row.insertCell(5); //Action
        // var cell6 = row.insertCell(6);
        if (jsonData[i].deviceOwner.length == 0) {
          owner = "";
        } else {
          owner = jsonData[i].deviceOwner[0].userName;
        }
        if (!jsonData[i].registrationDate) {
          regdate = "";
        } else {
          regdate = jsonData[i].registrationDate;
        }
        // cell0.innerHTML = "<input type='checkbox' value=chk" + num + ">";
        cell0.innerHTML = "<span>" + num + "</span>";
        cell1.innerHTML = "<span id='deviceId'>" + jsonData[i].deviceID + "</span>";
        cell2.innerHTML = "<span id='deviceName'>" + jsonData[i].deviceName + "</span>";
        cell3.innerHTML = "<span id='deviceOwner'>" + owner + "</span>";
        cell4.innerHTML = "<span>" + regdate + "</span>";
        cell5.innerHTML = "<div>" +
          "<button class='mini ui button' onclick=modifyDevicePopup(" +
          "'" + jsonData[i].deviceID + "'" +
          ",'" + jsonData[i].deviceName + "'" +
          ");>수정</button>" +
          "<button class='mini ui button' onclick=deleteDevice(" +
          "'" + jsonData[i].deviceID + "'" +
          ");>삭제</button>"
          //  + "<button class='mini ui button'>옵션</button>"
          +
          "</div>";
      }
    }
  });
}
//myDeviceList 생성
function getDeviceList() {
  //getToken();
  var bodyId = document.getElementById("my-tbody");
  var pageNo = 1;
  var numOfRows = 15;
  $.ajax({
    url: "https://ls1.neoidm.com/api/v1.0/mydevice/list",
    type: 'GET',
    headers: {
      "Authorization": "Bearer " + token
    },
    data: {
      pageNo: pageNo,
      numOfRows: numOfRows
    },
    success: function(res) {
      var data = JSON.parse(res);
      var jsonData = data.list;
      var num = 0;
      var owner;
      for (var i in jsonData) {
        num++;
        var row = bodyId.insertRow(bodyId.rows.length);
        //표 상단 컬럼 생성
        var cell0 = row.insertCell(0); //넘버
        var cell1 = row.insertCell(1); //제품 이름
        var cell2 = row.insertCell(2); //제품 ID
        var cell3 = row.insertCell(3); //관리자
        var cell4 = row.insertCell(4); //상태
        var cell5 = row.insertCell(5); //사용여부
        //row 추가
        if (jsonData[i].deviceOwner.length == 0) {
          owner = "";
        } else {
          owner = jsonData[i].deviceOwner[0].userName;
        }
        cell0.innerHTML = num;
        cell1.innerHTML = "<a id='pName" + i + "' style='cursor:pointer' onclick=tossDevice(" +
          "'" + jsonData[i].deviceID + "'" +
          ",'" + jsonData[i].status + "'" +
          ");>" +
          jsonData[i].product.productName +
          "(" + jsonData[i].product.productID + ")" +
          "</a>";
        cell2.innerHTML = "<a id='dName" + i + "' style='cursor:pointer' onclick=tossDevice(" +
          "'" + jsonData[i].deviceID + "'" +
          ",'" + jsonData[i].status + "'" +
          ");>" + jsonData[i].deviceID + "</a>";
        cell3.innerHTML = owner; //jsonData[i].deviceOwner[0].userName; //owner;
        cell4.innerHTML = jsonData[i].status; //status;
        cell5.innerHTML = jsonData[i].enable //enable;
      }
    },
    error: function(res) {
      if (res.status === 401) {
        getDeviceList();
      }
    }
  });
}
//dashBoard List 생성
function byDevice() {
  //getToken();
  var bodyId = document.getElementById("my-tbody");
  var pageNo = 1;
  var numOfRows = 15;
  $.ajax({
    url: "https://ls1.neoidm.com/api/v1.0/mydevice/list",
    type: 'GET',
    headers: {
      "Authorization": "Bearer " + token
    },
    data: {
      pageNo: pageNo,
      numOfRows: numOfRows
    },
    success: function(res) {
      var data = JSON.parse(res);
      var jsonData = data.list;
      var num = 0;
      var owner;
      var statusIcon;
      for (var i in jsonData) {
        num++;
        var row = bodyId.insertRow(bodyId.rows.length);
        //표 상단 컬럼 생성
        var cell0 = row.insertCell(0); //넘버
        var cell1 = row.insertCell(1); //제품 이름
        var cell2 = row.insertCell(2); //제품 ID
        var cell3 = row.insertCell(3); //관리자
        var cell4 = row.insertCell(4); //상태
        var cell5 = row.insertCell(5); //사용여부
        //row 추가
        if (jsonData[i].deviceOwner.length == 0) {
          owner = "";
        } else {
          owner = jsonData[i].deviceOwner[0].userName;
        }
        var status = jsonData[i].status;
        if(status==="정상"){
          status="Online"
        }
        cell0.innerHTML = num;
        cell1.innerHTML = jsonData[i].deviceID;
        cell2.innerHTML = jsonData[i].product.productName;
        cell3.innerHTML = jsonData[i].product.organization.organizationName;
        cell4.innerHTML = owner;
        cell5.innerHTML = status;//jsonData[i].status
      }
    },
    error: function(res) {
      if (res.status === 401) {
        getDeviceList();
      }
    }
  });
}
//deviceID 전달
function tossDevice(deviceId, status) {
  if (status === "정상") {
    localStorage.setItem("deviceId", deviceId);
    window.location.href = "/alldeviceDetail?key=" + deviceId;
  } else {
    alert("Device Offline");
  }
}
//device 상세 페이지(R/W)
function getDeviceDetail() {
  var bodyId = document.getElementById('my-tbody');
  var deviceId = location.href.substr(location.href.lastIndexOf('=') + 1); //"atecap_device1";
  var row = bodyId.insertRow(bodyId.rows.length);
  var icResult = localStorage.getItem('icResult');
  $.ajax({
    url: "https://ls1.neoidm.com/api/v1.0/clients/" + deviceId + "/40001",
    type: 'GET',
    headers: {
      "Authorization": "Bearer " + token
    },
    success: function(res) {
      var jsonData = res.content;
      var atrInfo;
      var productId = jsonData.id;
      var insertYn;
      var buttonYn;
      for (var i = 0; i < Object.keys(jsonData).length; i++) {
        var row = bodyId.insertRow(bodyId.rows.length);
        //표 상단 컬럼 생성
        var cell0 = row.insertCell(0); //NO
        var cell1 = row.insertCell(1); //Device ID
        var cell2 = row.insertCell(2); //equipment name
        var cell3 = row.insertCell(3); //ATR Info
        var cell4 = row.insertCell(4); //IC Result
        var cell5 = row.insertCell(5); //Button
        //card inserted check
        atrInfo = jsonData.instances[i].resources[1].value;
        //productID가 ATR 정보에 있으면 오류()
        //productID가 ATR에 존재(찾으면)(카드없음)(0)
        //productID가 ATR에 존재(찾지못하면)(카드있음)(-1)
        insertYn = atrInfo.indexOf(productId);

        if (insertYn == -1) {
          atrInfo = jsonData.instances[i].resources[1].value;
          buttonYn = "<div><button id='btn' class='mini ui button'  value='" + i + "' onclick='rwButton(" + i + ");'>R/W Button</button></div>";
        } else if (insertYn == 0) {
          atrInfo = "카드가 없습니다.";
          buttonYn = "<div><button id='btn' class='mini ui button' value='' onclick='rwButton();'>R/W Button</button></div>";
        }
        //row 추가
        cell0.innerHTML = (i + 1);
        cell1.innerHTML = "<div>" + "instance_" + jsonData.instances[i].id + "</div>";
        cell2.innerHTML = "<div>" + jsonData.instances[i].resources[0].value + "</div>";
        cell3.innerHTML = "<div id='atr" + i + "'>" + atrInfo + "</div>"; //jsonData.instances[i].resources[1].value;
        cell4.innerHTML = "<div id='icr" + i + "'" +
          "style='overflow:hidden;white-space:nowrap;text-overflow:ellipsis;'" +
          ">" +
          "</div>";
        cell5.innerHTML = buttonYn;
      }
    },
    error: function(res) {
      if (res.readyState === 0) {
        alert("Card Reader Server Error");
        window.location.href = "/alldevice";
      } else if (res.status === 401) {
        getToken();
        getDeviceDetail();
      }
    }
  })
}
//cmd 입력 popup
function rwButton(param) {
  if (param == undefined) {
    alert("카드정보가 없습니다.");
  } else {
    //선택된 button의 instance 값을 받아 localStorage애 저장
    var atrInfo = document.getElementById("atr" + param).innerHTML;
    var check = localStorage.getItem("atrInfo");
    if (!check || atrInfo != "카드가 없습니다.") {
      check = localStorage.setItem("atrInfo", atrInfo);
    }
    localStorage.setItem("instance", param);
    window.open('/commandPopUp', 'cmdPopup', 'width=500, height=350, toolbar=no, location=no, directories=no, status=no, menubar=no,scrollbars=no, resizable=no, copyhistory=no');
  }
}
//onclick popup
function sendCmd() {
  //선택된 명렁어 값
  // var cmdValue =  document.getElementById("selectCmd").value;
  var cmdValue = document.getElementById("inputedCmd").value;
  if (!cmdValue) {
    alert("값을 입력하세요.");
  } else {
    //put method 실행
    send_put(cmdValue);
  }
}
//commandPup
function send_put(cmdValue) {
  var deviceId = localStorage.getItem("deviceId");
  var icrValue;
  var icResult;
  var atrValue;
  var method = "2";
  var token = localStorage.getItem('token');
  var url = "https://ls1.neoidm.com/api/v1.0/clients/" + deviceId + "/40001/" + instance + "/" + method;
  var data = {};
  data.id = instance;
  data.value = cmdValue;
  var json = JSON.stringify(data);
  var xhr = new XMLHttpRequest();
  xhr.open("PUT", url, false); //(method, url, sync)
  //CROS(Cross-Origin Resource Sharing)오류로 HEADER에 정확한 정보를  기술
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + token);
  xhr.send(json);
  //var data = JSON.parse(xhr.responseText);
  if (xhr.readyState === 4 && xhr.status === 200) {
    console.log(xhr.responseText);
  } else {
    alert(xhr.responseText);
  }
  // //ICRinfo 변경
  changeICR();
  icResult = localStorage.getItem('icResult');
  atrValue = localStorage.getItem('atrInfo');
  if (!icResult || icResult === "40001_0_2" || icResult === "40001_1_2") {
    atrValue = "카드가 없습니다.";
    icrValue = "";
    //div의 getElementById는 innerhtml로 value 갖어옴
    opener.document.getElementById('atr' + instance).innerHTML = atrValue;
  } else if (icResult.length > 33) {
    icrValue = "<span>" +
      icResult +
      "</span>" +
      "<p class='arrow_box'>" +
      icResult +
      "</p></div>";
  } else {
    // atrValue = localStorage.getItem('atrInfo');
    icrValue = icResult;
  }
  opener.document.getElementById('atr' + instance).innerHTML = atrValue;
  opener.document.getElementById('icr' + instance).innerHTML = icrValue;
  window.close();
  localStorage.removeItem('icResult');
  localStorage.removeItem('instance');
}
// write 값 localStorage 저장
function changeICR() {
  var deviceId = localStorage.getItem("deviceId");
  var url = "https://ls1.neoidm.com/api/v1.0/clients/" + deviceId + "/40001/" + instance + "/" + method;

  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, false);
  //CROS(Cross-Origin Resource Sharing)오류로 HEADER에 정확한 정보를  기술
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + token);
  xhr.send();

  var jsonData = JSON.parse(xhr.responseText);
  //console.log(jsonData);
  var icResult = jsonData.content.value;
  //alert(jsonData.content.value);
  if (jsonData.status == "INTERNAL_SERVER_ERROR") {
    alert("유효하지 않은 값 입니다.");
  } else {
    localStorage.setItem('icResult', jsonData.content.value);
  }
}
//Device추가 팝업
function addDevicePopup() {
  window.open('/addDevice', 'addDevice', 'width=500, height=600, toolbar=no, location=no, directories=no, status=no, menubar=no,scrollbars=no, resizable=no, copyhistory=no');
}
//Device수정 팝업
function modifyDevicePopup(deviceid, name) {
  window.open('/modifyDevice?id=' + deviceid + '&name=' + name, 'modifyDevice', 'width=500, height=600, toolbar=no, location=no, directories=no, status=no, menubar=no,scrollbars=no, resizable=no, copyhistory=no');
}

function callbackFunction(xhr) { 
}
//Device 등록(Xhr)
function addDevice(form) {
  var productid = opener.document.getElementById('hiddenInput').value; //productID  : '151863154';
  var deviceId = form.deviceId.value;
  var devicename = form.deviceName.value;

  var url = "https://ls1.neoidm.com/api/v1.0/device";
  var json = '{ "deviceID" : "' + deviceId + '", "deviceName" : "' + devicename + '", "deviceOwner" : [ ], "product" : { "productID" : "' + productid + '" } }';
  if (deviceId != "" && devicename || deviceId && devicename != "") {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = callbackFunction(xhr);
    xhr.open("PUT", url, false); //(method, url, sync)
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.send(json);
    if (xhr.status === 200) {
      alert("등록 되었습니다.");
      window.close();
      opener.location.reload();
    } else {
      alert("statusCode: " + xhr.status);
    }
  } else {
    alert("값을 입력하세요.");
  }
}
//기기 삭제
function deleteDevice(param) {
  var message = confirm("정말 삭제 하시겠습니까?");
  if (message === true) {
    var url = "https://ls1.neoidm.com/api/v1.0/device"
    var data = {};
    data.deviceID = param;
    var json = JSON.stringify(data);
    var xhr = new XMLHttpRequest();
    xhr.open("DELETE", url, false); //(method, url, sync)
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.send(json);
    var jsonData = JSON.parse(xhr.responseText);
    if (xhr.status === 200 && jsonData.rData === "SUCCESS") {
      alert("삭제 되었습니다.");
      location.reload();
    } else {
      alert(xhr.responseText);
    }
  } else {
    return false;
  }
}
//기기 수정
function modifyDevice(form) {
  var productid = opener.document.getElementById('hiddenInput').value; //'151863154';
  var oName = document.getElementById('deviceName').value;
  alert(oName);
  var deviceId = form.deviceId.value;
  var devicename = form.deviceName.value;
  var url = "https://ls1.neoidm.com/api/v1.0/device"
  var json = '{ "deviceID" : "' + deviceId + '", "deviceName" : "' + devicename + '", "deviceOwner" : [ ], "product" : { "productID" : "' + productid + '" } }';
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = callbackFunction(xhr);
  xhr.open("POST", url, false); //(method, url, sync)
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + token);
  xhr.send(json);
  if (xhr.status === 200) {
    alert("변경 되었습니다.");
    window.close();
    opener.location.reload();
  } else {
    alert(xhr.responseText);
  }
}
//importExcel
function importExcelPopup() {
  window.open('/importExcel', 'importExcelPopup', 'width=500, height=350, toolbar=no, location=no, directories=no, status=no, menubar=no,scrollbars=no, resizable=no, copyhistory=no');

}
$(function() {
  $("#test").click(function() {
    $(".test").modal('show');
  });
  $(".test").modal({
    closable: true
  });
});

function importExcel() {
  //폼객체를 불러와서
  var form = $('form')[0];
  //FormData parameter에 담아줌
  var formData = new FormData(form);

  console.log(formData);
  alert('1')
}
