var serviceId = "0000ffe0-0000-1000-8000-00805f9b34fb";
var characteristicId = "0000ffe1-0000-1000-8000-00805f9b34fb";
const app = getApp();
Page({
  data: {
    isbluetoothready: false,
    searchingstatus: false,
    list: [],
    i:0
  },


  open_BLE: function () {
    var that = this;
    that.setData({
      isbluetoothready: !that.data.isbluetoothready,
    })

    if (that.data.isbluetoothready) {
      //开启蓝牙模块并初始化
      wx.openBluetoothAdapter({
        success: function (res) {
          wx.showModal({
            title: '提示',
            content: '蓝牙开启成功',
          })
        },
        fail: function (res) {
          wx.showModal({
            title: '提示',
            content: '请检查手机蓝牙是否打开',
          })
        }
      })
      //开启蓝牙模块并初始化

      //检查蓝牙模块是否初始化成功
      wx.getBluetoothAdapterState({
        success: function (res) {
        }
      })
      //检查蓝牙模块是否初始化成功
    } else {
      wx.closeBLEConnection({
        deviceId: that.data.connectedDeviceId,
        complete: function (res) {
          that.setData({
            deviceconnected: false,
            connectedDeviceId: '',
          })
        }
      })
      setTimeout(function () {
        that.setData({
          list: []
        })
        //释放蓝牙适配器
        wx.closeBluetoothAdapter({
          success: function (res) {
            that.setData({
              isbluetoothready: false,
              deviceconnected: false,
              devices: [],
              searchingstatus: false,
              receivedata: ''
            })
          },
        })
        //释放蓝牙适配器
      }, 1000)
    }
  },

  search_BLE: function () {
    var that = this;
    if (!that.data.searchingstatus) {
      var that = this;
      //开始搜索附近蓝牙设备
      wx.startBluetoothDevicesDiscovery({
        success: function (res) {
          that.setData({
            searchingstatus: !that.data.searchingstatus
          })
        }
      })
      //开始搜索附近蓝牙设备
    } else {
      //停止搜索附近蓝牙设备
      wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
          that.setData({
            searchingstatus: !that.data.searchingstatus
          })
        }
      })
      //停止搜索附近蓝牙设备
      setTimeout(function () {
        //获取发现的蓝牙设备
        wx.getBluetoothDevices({
          success: function (res) {
            that.setData({
              list: res.devices
            })
          }
        })
        //获取发现的蓝牙设备
      }, 1000)
    }
  },

  connectTO: function (e) {
    var that = this
    wx.createBLEConnection({
      deviceId: e.currentTarget.id,
      success: function (res) {
        wx.hideLoading()
        that.setData({
          deviceconnected: true,
          connectedDeviceId: e.currentTarget.id
        })
        // 启用 notify 功能
        wx.notifyBLECharacteristicValueChanged({
          state: true,
          deviceId: that.data.connectedDeviceId,
          serviceId: serviceId,
          characteristicId: characteristicId,
          success: function (res) {

          }
        })
        // 启用 notify 功能
        // ArrayBuffer转为16进制数
        function ab2hex(buffer) {
          var hexArr = Array.prototype.map.call(
            new Uint8Array(buffer),
            function (bit) {
              return ('00' + bit.toString(16)).slice(-2)
            }
          )
          return hexArr.join('');
        }
        // 16进制数转ASCLL码
        function hexCharCodeToStr(hexCharCodeStr) {
          var trimedStr = hexCharCodeStr.trim();
          var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
          var len = rawStr.length;
          var curCharCode;
          var resultStr = [];
          for (var i = 0; i < len; i = i + 2) {
            curCharCode = parseInt(rawStr.substr(i, 2), 16);
            resultStr.push(String.fromCharCode(curCharCode));
          }
          return resultStr.join("");
        }
        //监听回调，接收数据
        wx.onBLECharacteristicValueChange(function (characteristic) {
          var hex = ab2hex(characteristic.value);
          that.setData({
            receive_data: hexCharCodeToStr(hex),
          })
        })
      },
      fail: function (res) {
        wx.hideLoading()
        that.setData({
          connected: false
        })
      }
    })
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
      }
    })
  },

  sendtheroad:function(){
    var that=this
      setInterval(function () {
        if (that.data.i < app.data.roadmath.length){
          that.send(app.data.roadmath[that.data.i]);
        that.data.i++;
        }
        else if (that.data.i > app.data.roadmath.length){
          that.data.i=0;
          clearInterval
          }
    }, 1000)
  },
  send: function (e) {
    var that = this;
    let buffer = new ArrayBuffer(1);
    let dataView = new DataView(buffer);
    dataView.setUint8(0, Number(e));
    wx.writeBLECharacteristicValue({
      deviceId: that.data.connectedDeviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      value: buffer,
      success: function (res) {
      }
    })
  },
})