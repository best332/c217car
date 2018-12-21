// pages/game/game.js
var serviceId = "0000ffe0-0000-1000-8000-00805f9b34fb";
var characteristicId = "0000ffe1-0000-1000-8000-00805f9b34fb";
const app = getApp();
Page({
  data:{
    config: null,
    cards: [],
    grids: [],
    start: false,
    touchStart:0,
    touchEnd:0,
    height: 0,
    startsetting:[1,1],
    endsetting:[1,1],
    closesetting:[],
    mapp: [],
    siz:[],
    sets:[],
    endsets:[],
    connectedDeviceId: "",
    isbluetoothready: false,
    searchingstatus: false,
    list: [],
  },
  
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.newGame();
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },

  

  openCard:function(i){
    if(cards[i].open) cards[i].open = false;
    if(!cards[i].open) { cards[i].open = true; return }
  },
  newGame(){
    const config = app.globalData.config;
    const x = config.x; this.data.siz[0] = x;
    const y = config.y; this.data.siz[1] = y;
    const n = config.n;
    const cards = [];
    const grids = [];
    this.data.startsetting=[1,1];
    this.data.endsetting= [1,1];
    this.data.closesetting=[];
    for(let i=0; i<y; i++){
      grids.push([]);
      for(let j=0; j<x; j++){
        const index = i*x+j;
        cards.push({
          index:index,
          boom:false,
          num:0,
          open:false,
          flag:false
        });
        grids[i].push(index);
      }
    };
    for (let i = 0; i < x; i++) {
      this.data.mapp[i]=new Array;
    for(let j=0;j<y;j++){this.data.mapp[i][j]=0}
    }

    this.setData({
      cards: cards,
      grids: grids,
      start: false,
      height: 750/x,
      config: config

    });
  },
  handleClick(e) {
    const that = this;
    const cards = this.data.cards;
    const n = this.data.config.n;
    const i = parseInt(e.currentTarget.id);
    const touchTime = this.data.touchEnd-this.data.touchStart;
    const x = this.data.config.x;
    const y = this.data.config.y;
    var sett = [1,0, 0], p,index,sett1=[0,0,0];
    this.data.startsetting = this.data.endsetting;
    this.data.endsets=[]
    app.data.roadmath=0
    p = this.getafloor(i / x);
    sett[2]=y-p;
    sett[1]=i%x+1;
    sett1[2] = y - p;
    sett1[1] = i % x + 1;
    if(cards[i].flag)return;
    if (cards[i].open == true && touchTime < 350)return;
    if (!cards[i].open && touchTime < 350) {
      this.data.endsetting=[sett[1],sett[2]]
      this.data.sets = this.searchroad(this.data.startsetting[0]-1, this.data.startsetting[1]-1, this.data.endsetting[0]-1, this.data.endsetting[1]-1);
      this.todirection()
      this.data.endsets.push(0);
      this.data.endsets.unshift(9);
      app.data.roadmath=this.data.endsets;
      for (let k = 0; k < y; k++) {
        for (let j = 0; j < x; j++) {
           index = k * x + j;
           cards[index].flag=false;
          };
        }
      cards[i].flag = !cards[i].flag;
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      
      
      };
    if (touchTime > 350) {
      cards[i].open = true; this.data.mapp[sett[1] - 1][sett[2] - 1] = 1
    }
    !this.data.start && this.setBoom(i,cards,n,(cards)=>this.setData({cards:cards,start:true}));

    this.setData({cards:cards});
    
    

  },
  handleTouchStart(e){
    this.setData({
      touchStart:e.timeStamp
    });
  },
  handleTouchEnd(e){
    this.setData({
      touchEnd:e.timeStamp
    });
  },
  setBoom:function(j,cards,n,cb){
    const newArr = this.getNeighbor(j).concat(j); //排除的+雷
    const arr = []; //空余池

    for (let index of Array(cards.length).keys()) {
      newArr.indexOf(index)==-1 && arr.push(index);
    }

    for(let i=0; i<n; i++){
      const index = Math.floor(Math.random()*arr.length);
      cards[arr[index]].boom = true;
      newArr.push(arr[index]);
      arr.splice(index,1);
    }

    const newCards = cards.map(function(item,i){
      item.num = this.getNeighbor(i).filter((neighbor)=>cards[neighbor].boom).length;
      return item;
    }.bind(this));

    typeof cb == "function" && cb(newCards);
  },
  getNeighbor:function(i){
    const x = this.data.config.x;
    const y = this.data.config.y;
    const arr = [];

    !(i<x||i%x==0) && arr.push(i-x-1);
    !(i<x) && arr.push(i-x);
    !(i<x||i%x==(x-1)) && arr.push(i-x+1);
    !(i%x==0) && arr.push(i-1);
    // arr.push(i);
    !(i%x==(x-1)) && arr.push(i+1);
    !(i>=x*(y-1)||i%x==0) && arr.push(i+x-1);
    !(i>=x*(y-1)) && arr.push(i+x);
    !(i>=x*(y-1)||i%x==(x-1)) && arr.push(i+x+1);
    return arr
  },






  searchroad:function(start_x, start_y, end_x, end_y) {
    var openList = [],    //开启列表
    closeList =[],   //关闭列表
    result =[],      //结果数组
    result_index;   //结果数组在开启列表中的序号
    openList.push({ x: start_x, y: start_y, G: 0 });//把当前点加入到开启列表中，并且G是0
    do {
      var currentPoint = openList.pop();
      closeList.push(currentPoint);
      var surroundPoint = this.SurroundPoint(currentPoint);
      for(var i in surroundPoint) {
        var item = surroundPoint[i];              //获得周围的八个点
  if (
    item.x >= 0 &&                            //判断是否在地图上
    item.y >= 0 &&
    item.x < this.data.siz[0] &&
    item.y < this.data.siz[1] &&
    this.data.mapp[item.x][item.y] != 1 &&         //判断是否是障碍物
    !this.existList(item, closeList) &&          //判断是否在关闭列表中
    this.data.mapp[item.x][currentPoint.y] != 1 &&   //判断之间是否有障碍物，如果有障碍物是过不去的
    this.data.mapp[currentPoint.x][item.y] != 1) {
    //g 到父节点的位置
    //如果是上下左右位置的则g等于10，斜对角的就是14
    var g = currentPoint.G + ((currentPoint.x - item.x) * (currentPoint.y - item.y) == 0 ? 10 : 14);
    if (!this.existList(item, openList)) {       //如果不在开启列表中
      //计算H，通过水平和垂直距离进行确定
      item['H'] = Math.abs(end_x - item.x) * 10 + Math.abs(end_y - item.y) * 10;
      item['G'] = g;
      item['F'] = item.H + item.G;
      item['parent'] = currentPoint;
      openList.push(item);
    }
    else {                                  //存在在开启列表中，比较目前的g值和之前的g的大小
      var index = this.existList(item, openList);
      //如果当前点的g更小
      if (g < openList[index].G) {
        openList[index].parent = currentPoint;
        openList[index].G = g;
        openList[index].F = g + openList[index].H;
      }

    }
  }
}
//如果开启列表空了，没有通路，结果为空
if (openList.length == 0) {
  break;
}
openList.sort(this.sortF);//这一步是为了循环回去的时候，找出 F 值最小的, 将它从 "开启列表" 中移掉
    } while (!(result_index = this.existList({ x: end_x, y: end_y }, openList)));

//判断结果列表是否为空
if (!result_index) {
  result = [];
}
else {
  var currentObj = openList[result_index];
  do {
    //把路劲节点添加到result当中
    result.unshift({
      0: currentObj.x,
      1: currentObj.y
    });
    currentObj = currentObj.parent;
  } while (currentObj.x != start_x || currentObj.y != start_y);

}
return result;

},
//用F值对数组排序
sortF(a, b) {
  return b.F - a.F;
},
//获取周围八个点的值
SurroundPoint(curPoint) {
  var x = curPoint.x, y = curPoint.y;
  return [
    { x: x - 1, y: y - 1 },
    { x: x, y: y - 1 },
    { x: x + 1, y: y - 1 },
    { x: x + 1, y: y },
    { x: x + 1, y: y + 1 },
    { x: x, y: y + 1 },
    { x: x - 1, y: y + 1 },
    { x: x - 1, y: y }
  ]
},
//判断点是否存在在列表中，是的话返回的是序列号
  existList(point, list) {
  for (var i in list) {
    if (point.x == list[i].x && point.y == list[i].y) {
      return i;
    }
  }
  return false;
},
getafloor: function (a) {
    return Math.floor(a);
  },
  todirection: function () {
    this.data.sets.unshift(this.data.startsetting)
    this.data.sets[0][0] = this.data.sets[0][0]-1
    this.data.sets[0][1] = this.data.sets[0][1] - 1
    if(this.data.sets.length<2)return
    for (let i = 0; i < this.data.sets.length-1;i++)
      if (this.data.sets[i+1][0] - this.data.sets[i][0] == 1 && this.data.sets[i+1][1] - this.data.sets[i][1] == 0)this.data.endsets.push(1)
      else if (this.data.sets[i + 1][0] - this.data.sets[i][0] == 1 && this.data.sets[i + 1][1] - this.data.sets[i][1] == 1) this.data.endsets.push(8)
      else if (this.data.sets[i + 1][0] - this.data.sets[i][0] == 1 && this.data.sets[i + 1][1] - this.data.sets[i][1] == -1) this.data.endsets.push(2)
      else if (this.data.sets[i + 1][0] - this.data.sets[i][0] == 0 && this.data.sets[i + 1][1] - this.data.sets[i][1] == 1) this.data.endsets.push(7)
      else if (this.data.sets[i + 1][0] - this.data.sets[i][0] == 0 && this.data.sets[i + 1][1] - this.data.sets[i][1] == -1) this.data.endsets.push(3)
      else if (this.data.sets[i + 1][0] - this.data.sets[i][0] == -1 && this.data.sets[i + 1][1] - this.data.sets[i][1] == -1) this.data.endsets.push(4)
      else if (this.data.sets[i + 1][0] - this.data.sets[i][0] == -1 && this.data.sets[i + 1][1] - this.data.sets[i][1] == 0) this.data.endsets.push(5)
      else if (this.data.sets[i + 1][0] - this.data.sets[i][0] == -1 && this.data.sets[i + 1][1] - this.data.sets[i][1] == 1) this.data.endsets.push(6)
    for (let i = 0; i < this.data.endsets.length;i++)
      app.data.roadmath += this.data.endsets[i] * (Math.pow(10, i) );
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

  send: function (e) {
    var that = this;
    let buffer = new ArrayBuffer(1);
    let dataView = new DataView(buffer);
    dataView.setUint8(0, Number('1'));

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







