function t(t) {
    return (t = t.toString())[1] ? t : "0" + t;
}

module.exports = {
  formatTime: function(e) {
      var n = e.getFullYear(), o = e.getMonth() + 1, r = e.getDate(), u = e.getHours(), i = e.getMinutes(), g = e.getSeconds();
      return [ n, o, r ].map(t).join("/") + " " + [ u, i, g ].map(t).join(":");
  },
  hasNull: function(params) {
    var keys = Object.keys(params);
    for (var i = 0; i < keys.length; i++) {
      console.log(params[keys[i]], "params[keys[i]]")
      var obj = params[keys[i]];
      if (obj === 0) {
        return false;
      }
      if (!obj || obj == '') {
        return true;
      }
    }
    return false;
  }
};