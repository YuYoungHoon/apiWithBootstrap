var url = "https://ls1.neoidm.com/api/v1.0";
// const token = localStorage.getItem("token");
// / 60s 는 60000ms 4분이 지날 때마다 tokenRedirect실행 함수를 실행합니다
$(document).ready(function() {
  $.ajax({
    type: "GET",
    url: "./xmls/config.xml",
    dataType: "xml",
    success: function(xml) {
      $(xml).find("tokentime").each(function() {
        var interval = $(this).text();
        setInterval('tokenRedirect();', interval);
      });
    }
  });

});
//IDM 접속 (toke 발급)
function getTokenByIDM() {
  var data = {
    loginId: "ateca",
    password: "ateca"
  }
  $.ajax({
    url: url + "/login",
    type: "post",
    dataType: "JSON",
    data: JSON.stringify(data),
    success: function(res) {
      localStorage.setItem("token", res.rData);
    }
  });
}
//token 재발급
function tokenRedirect() {
  var token = localStorage.getItem("token");
  $.ajax({
    url: url + "/login/token",
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
//group List 생성
function getGroupList() {
  var token = localStorage.getItem("token");
  var pageNo = 1;
  var numOfRows = 10;
  $.ajax({
    url: url + "/product/list",
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
      var t = $("dataTables").DataTable();
      var num = 0;
      for (var i in jsonData) {
        num++;
        var groupName = `<a href='/groupListDetail' style='cursor:pointer'>` +
          jsonData[i].productName +
          `</a>`
        var version = jsonData[i].currentFirmwareVersion;
        var description = jsonData[i].description;
        var hwVersion = jsonData[i].hwVersion;
        var dataSet = [
          [num, groupName, version, description, hwVersion]
        ];
        $('#dataTables').DataTable({
          destroy: true,
          responsive: true,
          data: dataSet,
          columns: [{
              title: "No"
            },
            {
              title: "Group Name"
            },
            {
              title: "Current Firmware Version"
            },
            {
              title: "Description"
            },
            {
              title: "HW Version"
            }
          ]
        });
      }
    },
    error: function(res) {
      // $('#dataTables').DataTable({
      //   responsive: true,
      //   destroy: true
      // });
      // if (!res.resresponseText) {
      //
      //   getGroupList();
      // }
    }
  });
}
//Group List Details
function getgroupDetail() {
  var token = localStorage.getItem("token");
  var pageNo = 1;
  var numOfRows = 10;
  $.ajax({
    url: url + "/device/list",
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
      var dataSet = new Array();
      for (var i in jsonData) {
        num++;
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
        var action =
          `<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#modifyDevice"
            onclick="modifyDeviceSet(` + i + `);">수정</button> &nbsp;` +
          `<button type="button" class="btn btn-warning" data-toggle="modal" data-target="#deleteDevice"
           onclick="deleteDevice(` + i + `);">삭제</button> &nbsp;` +
          `<button type="button" class="btn btn-info" data-toggle="modal" data-target="#optionDevice"
           onclick="optionDevice(` + i + `)">옵션</button>`;

        dataSet.push([num, jsonData[i].deviceID, jsonData[i].deviceName, owner, regdate, action]);
      }
      $('#dataTables').DataTable({
        destroy: true,
        responsive: true,
        data: dataSet,
        columns: [{
            title: "No"
          },
          {
            title: "DeviceID"
          },
          {
            title: "Name"
          },
          {
            title: "Owner"
          },
          {
            title: "Regdate"
          },
          {
            title: "Action"
          }
        ]
      });
    },
    errors: function(res) {
      $('#dataTables').DataTable({
        responsive: true,
        destroy: true
      });
      if (!res.resresponseText) {
        alert("Instence Read Error");
        window.location.href = "/groupList";
      }
    }
  });
}
//allDeviceList
function allDeviceList() {
  var token = localStorage.getItem("token");
  var bodyId = document.getElementById("my-tbody");
  var pageNo = 1;
  var numOfRows = 15;
  $.ajax({
    url: url + "/mydevice/list",
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
      //console.log(jsonData);
      var num = 0;
      var owner;
      var dataSet = new Array();
      var deviceId;
      var groupName;
      for (var i in jsonData) {
        num++;
        //row 추가
        if (jsonData[i].deviceOwner.length == 0) {
          owner = "";
        } else {
          owner = jsonData[i].deviceOwner[0].userName;
        }

        groupName = `<a id='pName` + i + `' style='cursor:pointer' onclick=tossDevice(` +
          `'` + jsonData[i].deviceID + `'` +
          `,'` + jsonData[i].status + `'` +
          `);>` +
          jsonData[i].product.productName +
          `(` + jsonData[i].product.productID + `)` +
          `</a>`;
        deviceId = `<a id='dName` + i + `' style='cursor:pointer' onclick=tossDevice(` +
          `'` + jsonData[i].deviceID + `'` +
          `,'` + jsonData[i].status + `'` +
          `);>` + jsonData[i].deviceID + `</a>`;

        dataSet.push([num, groupName, deviceId, owner, jsonData[i].status, jsonData[i].enable]);
      }

      $('#dataTables').DataTable({
        destroy: true,
        responsive: true,
        data: dataSet,
        columns: [{
            title: "No"
          },
          {
            title: "Group Name(Id)"
          },
          {
            title: "Device ID"
          },
          {
            title: "Device Owner"
          },
          {
            title: "Status"
          },
          {
            title: "Enable/Disable"
          }
        ]
      });
    },
    error: function(res) {
      $('#dataTables').DataTable({
        responsive: true,
        destroy: true
      });
      if (res.status === 401) {
        tokenRedirect();
        allDeviceList();
      }
    }
  });
}
//deviceID 전달
function tossDevice(deviceId, status) {
  if (status === "정상") {
    localStorage.setItem("deviceId", deviceId);
    window.location.href = "/alldeviceDetail";
  } else {
    alert("Device Offline");
  }
}
//device Detail
function deviceDetail() {
  var token = localStorage.getItem("token");
  var deviceId = localStorage.getItem('deviceId');
  localStorage.removeItem('instance');
  localStorage.removeItem('atrInfo');
  // localStorage.removeItem('icResult');
  $.ajax({
    url: url + "/clients/" + deviceId + "/40001",
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
      var num;
      var icr;
      var atr;
      var instance;
      var eName;
      var dataSet = new Array();
      for (var i = 0; i < Object.keys(jsonData).length; i++) {
        //card inserted check
        atrInfo = jsonData.instances[i].resources[1].value;
        //productID가 ATR 정보에 있으면 오류()
        //productID가 ATR에 존재(찾으면)(카드없음)(0)
        //productID가 ATR에 존재(찾지못하면)(카드있음)(-1)
        insertYn = atrInfo.indexOf(productId);
        if (insertYn == -1) {
          atrInfo = jsonData.instances[i].resources[1].value;
          // buttonYn = `<div><button id='btn' class='btn btn-primary btn-sm'  value='` + i + `' onclick='rwButton(` + i + `);'>R/W Button</button></div>`;
          buttonYn = `<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModalCenter" onclick='saveInstace(` + i + `)'>
            R/W Button
          </button>`;
        } else if (insertYn == 0) {
          atrInfo = "카드가 없습니다.";
          buttonYn = `<button type="button" class="btn btn-primary disabled">R/W Button</button>`;
        }
        num = (i + 1);
        instance = "instance_" + jsonData.instances[i].id;
        eName = jsonData.instances[i].resources[0].value;
        atr = atrInfo;
        icr = '';
        dataSet.push([num, "instance_" + instance, eName, atr, icr, buttonYn]);
      }
      $('#dataTables').DataTable({
        destroy: true,
        responsive: true,
        data: dataSet,
        columns: [{
            title: "No"
          },
          {
            title: "Instance Id"
          },
          {
            title: "Equipment name"
          },
          {
            title: "ATR Info"
          },
          {
            title: "IC Result"
          },
          {
            title: "Read&Write"
          }
        ]
      });
    },
    error: function(res) {
      if (res.readyState === 0) {
        alert("Card Reader Server Error");
        window.location.href = "/allDeviceList";
      } else if (res.status === 401) {
        alert("status: " + res.status);
        tokenRedirect();
        window.location.href = "/allDeviceList";
      }
    }
  })
}
//
function saveInstace(param) {
  localStorage.setItem('instance', param);
  var atrInfo = $("#atr" + param).val();
  localStorage.setItem("atrInfo", atrInfo);
}
//sendCmd
function sendCmd() {
  var token = localStorage.getItem("token");
  var cmdValue = document.getElementById("inputedCmd").value;
  var deviceId = localStorage.getItem("deviceId");
  var instance = localStorage.getItem("instance");
  var method = "2";
  var data = {};
  if (!cmdValue) {
    alert("값을 입력하세요.");
  } else {
    $('#exampleModalCenter').modal('hide');
    data.id = instance;
    data.value = cmdValue;
    $.ajax({
      url: url + '/clients' + '/' + deviceId + '/40001/' + instance + '/' + method,
      type: 'PUT',
      headers: {
        "Authorization": "Bearer " + token,
        "Accept": "application/json",
        "Content-type": "application/json"
      },
      dataType: "JSON",
      data: JSON.stringify(data),
      success: function(res) {
        changeICR();
      },
      errors: function() {
        console.log("error");
      }
    });
  }
}
// write 값 DataTable Row Data 변경
function changeICR() {
  var token = localStorage.getItem("token");
  var deviceId = localStorage.getItem("deviceId");
  var instance = localStorage.getItem("instance");
  var atrValue = localStorage.getItem('atrInfo');
  var table = $('#dataTables').DataTable();
  var rowData;
  var icResult;
  var method = "2";
  $.ajax({
    url: url + "/clients/" + deviceId + "/40001/" + instance + "/" + method,
    type: 'GET',
    headers: {
      "Authorization": "Bearer " + token,
      "Accept": "application/json",
      "Content-type": "application/json"
    },
    success: function(res) {
      icResult = res.content.value;
      if (res.status == "INTERNAL_SERVER_ERROR") {
        alert("유효하지 않은 값 입니다.");
      } else {
        //Write 한 값 조회 후 HTML value 변경
        if (icResult === "40001_0_2" || icResult === "40001_1_2") {
          atrValue = "카드가 없습니다.";
          icrValue = "";
          rowData = table.row(instance).data();
          rowData[3] = atrValue;
          rowData[4] = null;
          console.log(rowData);
        } else if (icResult.length > 33) {
          // $("body").tooltip({ selector: '[data-toggle=tooltip]' });
          // icResult = `<div class='atecHover' style='cursor:pointer' data-toggle='tooltip' data-placement='top' title ='` +
          $("body").popover({
            selector: '[data-toggle=popover]'
          });
          icResult = `<div class='atecHover' style='cursor:pointer' data-toggle='popover' data-placement='top' title ='` +
            icResult + `'>` +
            icResult +
            `</div>`;
          rowData = table.row(instance).data();
          rowData[4] = icResult;
          //row 변경
          table.row(instance).data(rowData).draw();
        } else {
          // icrValue = icResult;
          //버튼 클릭된 로우의 데이터 조회
          rowData = table.row(instance).data();
          rowData[4] = icResult;
          //row 변경
          table.row(instance).data(rowData).draw();
        }
      }
    },
    errors: function() {
      console.log("error");
    }
  });
}
//Device 수정 정보 Set
function modifyDeviceSet(param) {
  var table = $('#dataTables').DataTable();
  var rowData = table.row(param).data();
  $('#mDeviceId').val(rowData[1]);
  $('#mDeviceName').val(rowData[2]);
  $('#mOwner').val(rowData[3]);
}
//Device 수정
function modifyDevice() {
  var token = localStorage.getItem("token");
  var productId;
  var deviceId;
  var deviceName;
  deviceId = $('#mDeviceId').val();
  deviceName = $('#mDeviceName').val();
  productId = $('#hiddenInput').val(); // Group List Detail page에 히든값으로 productID받음
  var data = '{ "deviceID" : "' + deviceId + '", "deviceName" : "' + deviceName + '", "deviceOwner" : [ ], "product" : { "productID" : "' + productId + '" } }';
  $.ajax({
    url: url + '/device',
    type: 'POST',
    headers: {
      "Authorization": "Bearer " + token
    },
    dataType: 'JSON',
    data: data,
    success: function(res) {
      $('#modifyDevice').modal('hide');
      alert("변경 되었습니다.");
      window.location.reload();
    }
  });
}
//추가
function addDevice(form) {
  var token = localStorage.getItem("token");
  var productId;
  var deviceId;
  var deviceName;
  deviceId = $('#aDeviceId').val();
  deviceName = $('#aDeviceName').val();
  productId = $('#hiddenInput').val();
  var data = '{ "deviceID" : "' + deviceId + '", "deviceName" : "' + deviceName + '", "deviceOwner" : [ ], "product" : { "productID" : "' + productId + '" } }';
  $.ajax({
    url: url + '/device',
    type: 'PUT',
    headers: {
      "Authorization": "Bearer " + token
    },
    dataType: 'JSON',
    data: data,
    success: function(res) {
      console.log(res);
      if (res.message === 'DUPLICATE') {
        $('#addDevice').modal('hide');
        alert('중복된 아이디 입니다.')
      } else {
        $('#addDevice').modal('hide');
        deviceId = $('#aDeviceId').val('');
        deviceName = $('#aDeviceName').val('');
        productId = $('#hiddenInput').val('');
        alert("추가 되었습니다.");
        window.location.reload();
      }
    }
  });
}
//Device 삭제
function deleteDevice(param) {
  var token = localStorage.getItem("token");
  var deviceId;
  var message = confirm("정말 삭제 하시겠습니까?");
  if (message === true) {
    var table = $('#dataTables').DataTable();
    var rowData = table.row(param).data();
    deviceId = rowData[1];
    var data = '{ "deviceID" : "' + deviceId + '"}';
    $.ajax({
      url: url + '/device',
      type: 'DELETE',
      headers: {
        "Authorization": "Bearer " + token
      },
      dataType: 'JSON',
      data: data,
      success: function(res) {
        $('#deleteDevice').modal('hide');
        alert("삭제 되었습니다.");
        window.location.reload();
      }
    });
  }
}
//Device 옵션변경
function optionDevice(param) {
  // alert('옵션변경');
}
function gatewayList() {
  $('#gatewayTables').DataTable({
    destroy: true,
    responsive: true
  });

  var dataSet = new Array();
  var name = `<a onclick="show();" style="cursor:pointer">Temp_Gateway</a>`;
  dataSet.push([1,name,"gw_temp01","정상","127.0.0.1",1,2,"v1.0","","2018/00/00"]);

  $('#gatewayTables').DataTable({
    destroy: true,
    responsive: true,
    data:dataSet,
    columns: [
      {
        title: "No"
      },
      {
        title: "Name"
      },
      {
        title: "Device ID"
      },
      {
        title: "Status"
      },
      {
        title: "IP Address"
      },
      {
        title: "Common Channel"
      },
      {
        title:"Data Channel"
      },
      {
        title:"Version"
      },
      {
        title:"Alive Interval"
      },
      {
        title:"F/W Update History"
      }
    ]
  });
}
function gatewaySetting() {
  alert("2");
}
