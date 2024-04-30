Page({
  data: {
    input: '',
    log: {},
    todos: [],
    leftCount: 0,
    allCompleted: false,
    logs: [],
    toastHidden: true,
  },
  onShow: function () {
    wx.setNavigationBarTitle({
      title: '待办清单'
    })

  },

  save: function () {
    wx.setStorageSync('todo_list', this.data.todos)
    wx.setStorageSync('todo_logs', this.data.logs)
  },

  load: function () {
    var todos = wx.getStorageSync('todo_list')
    if (todos) {
      var leftCount = todos.filter(function (item) {
        return !item.completed
      }).length
      this.setData({ todos: todos, leftCount: leftCount })
    }
    var logs = wx.getStorageSync('todo_logs')
    if (logs) {
      this.setData({ logs: logs })
    }
  },

  onLoad: function () {
    this.load()
  },

  inputChangeHandle: function (e) {
    this.setData({ input: e.detail.value })
  },

  addTodoHandle: function (e) {
    if (!this.data.input || !this.data.input.trim()) return
    var todos = this.data.todos
    todos.push({ name: this.data.input, completed: false })
    var logs = this.data.logs
    logs.push({ timestamp: new Date(), action: 'Add', name: this.data.input })
    this.setData({
      input: '',
      todos: todos,
      leftCount: this.data.leftCount + 1,
      logs: logs
    })
    this.save()
  },


  handleAddToDo: function () {
    let that = this; // Capture 'this' context
    wx.showModal({
      title: 'Add Task',
      content: '',
      editable: true, // Enable input field
      placeholderText: 'Task name', // Placeholder in input field
      showCancel: true, // Show cancel button
      confirmText: 'Confirm', // Text for confirm button
      cancelText: 'Cancel', // Text for cancel button
      success: function (res) {
        if (res.confirm) {
          // User clicked the confirm button
          const taskName = res.content; // Assuming 'res.content' contains the input value
          if (taskName && taskName.trim()) {
            // Task name is not empty
            var todos = that.data.todos;
            todos.push({ name: taskName.trim(), completed: false });
            var logs = that.data.logs;
            logs.push({ timestamp: new Date(), action: 'Add', name: taskName.trim() });
            that.setData({
              input: '',
              todos: todos,
              leftCount: that.data.leftCount + 1,
              logs: logs
            });
            that.save();
          } else {
            // Task name is empty
            wx.showToast({
              title: 'Task name cannot be empty',
              icon: 'none'
            });
          }
        } else if (res.cancel) {
          // User clicked the cancel button
          console.log('User canceled the action');
        }
      }
    });
  },

  toggleTodoHandle: function (e) {
    var index = e.currentTarget.dataset.index
    var todos = this.data.todos
    todos[index].completed = !todos[index].completed
    var logs = this.data.logs
    logs.push({
      timestamp: new Date(),
      action: todos[index].completed ? 'Finish' : 'Restart',
      name: todos[index].name
    })
    this.setData({
      todos: todos,
      leftCount: this.data.leftCount + (todos[index].completed ? -1 : 1),
      logs: logs
    })
    this.save()

  },

  removeTodoHandle: function (e) {
    var index = e.currentTarget.dataset.index
    var todos = this.data.todos
    var remove = todos.splice(index, 1)[0]
    var logs = this.data.logs
    logs.push({ timestamp: new Date(), action: 'Remove', name: remove.name })
    this.setData({
      todos: todos,
      leftCount: this.data.leftCount - (remove.completed ? 0 : 1),
      logs: logs
    })
    this.save()
  },

  toggleAllHandle: function (e) {
    this.data.allCompleted = !this.data.allCompleted
    var todos = this.data.todos
    for (var i = todos.length - 1; i >= 0; i--) {
      todos[i].completed = this.data.allCompleted
    }
    var logs = this.data.logs
    logs.push({
      timestamp: new Date(),
      action: this.data.allCompleted ? 'Finish' : 'Restart',
      name: 'All todos'
    })
    this.setData({
      todos: todos,
      leftCount: this.data.allCompleted ? 0 : todos.length,
      logs: logs
    })
    this.save()
    wx.vibrateShort()
  },

  clearCompletedHandle: function (e) {
    var todos = this.data.todos
    var remains = []
    for (var i = 0; i < todos.length; i++) {
      todos[i].completed || remains.push(todos[i])
    }
    var logs = this.data.logs
    logs.push({
      timestamp: new Date(),
      action: 'Clear',
      name: 'Completed todo'
    })
    this.setData({ todos: remains, logs: logs })
    this.save()
    this.setData({
      toastHidden: false
    })
    wx.vibrateShort()
  },
  hideToast: function () {
    this.setData({
      toastHidden: true
    })
  },
  onShareAppMessage: function (res) {

    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
      return {
        title: '管理时间，保持专注！让自律成为习惯！',
        path: '/pages/index/index',
        imageUrl: '/image/share.jpg' //不设置则默认为当前页面的截图
      }
    }
  },
  onShareTimeline: function (res) {
    return {
      title: '管理时间，保持专注，让自律成为习惯！',
      query: {
        // key: 'value' //要携带的参数 
      },
      imageUrl: '/image/about.png'
    }
  },

  saveLog: function (log) {
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(log)
    wx.setStorageSync('logs', logs)
  },

  handleGetup: function() {
    const logName = "Getup";
    const startTimeShow = new Date().toLocaleTimeString();
    this.data.log = {
      name: logName,
      startTime: Date.now(),
      startTimeShow: startTimeShow,
      action: "起床打卡",
    };
    this.saveLog(this.data.log);
    console.log("getup");
    wx.navigateTo({
      url: '/pages/morning/index', // todos页面的路径
    });
  },
  handleSleep: function() {
    const logName = "Sleep";
    const startTimeShow = new Date().toLocaleTimeString();
    this.data.log = {
      name: logName,
      startTime: Date.now(),
      startTimeShow: startTimeShow,
      action: "睡觉打卡",
    };
    this.saveLog(this.data.log);
    console.log("sleep");
    wx.navigateTo({
      url: '/pages/night/index', // todos页面的路径
    });
  }  

})