/*创建style标签存放初始样式*/
var styleTag = document.createElement('style'),
  headTag = document.getElementsByTagName('head')[0];
styleTag.type = 'text/css';
styleTag.id = 'shape-init-class';
if (headTag.getElementsByTagName('link')[0]) {
  headTag.insertBefore(styleTag, headTag.getElementsByTagName('link')[0]);
} else if (headTag.getElementsByTagName('style')[0]) {
  headTag.insertBefore(styleTag, headTag.getElementsByTagName('style')[0]);
} else {
  headTag.appendChild(styleTag);
}

var shape = {
  /**
   * 事件绑定
   * @obj {Object} 绑定事件的对象
   * @eName {String} 绑定的事件，如click
   * @eFn {Function} 事件函数
   * */
  addEvent: function (obj, eName, eFn) {
    document.addEventListener ? obj.addEventListener(eName, eFn, false) : obj.attachEvent('on' + eName, eFn);
  },

  /**
   * 事件解绑
   * @obj {Object} 绑定事件的对象
   * @eName {String} 要解绑的事件
   * @eFn {Function} 事件函数
   * @bool {Boolean} 是否捕获(默认false)
   * */
  removeEvent: function (obj, eName, eFn, bool) {
    bool = bool || false;
    document.removeEventListener ? obj.removeEventListener(eName, eFn, !!bool) : obj.detachEvent('on' + eName, eFn);
  },

  /** 类名事件：添加、移除、切换、包含 */
  classNameList: {
    /**
     * 添加类名
     * @obj {Object} 操作的dom对象
     * @cName {String} 要添加的类名，允许同时添加多个类名，用空格隔开
     * */
    addClassName: function (obj, cName) {
      var oldArr = obj.className.split(' '), //原有类名数组
        addArr = cName.split(' '), //新增类名数组
        newArr = oldArr.concat(addArr), //拼接成新数组
        json = {},
        arr = [];

      //过滤掉重复添加的类名
      for (var i = 0, length = newArr.length; i < length; i++) {
        if (!json[newArr[i]]) { //若json对象没有该值
          arr.push(newArr[i]); //把该值push进数组
          json[newArr[i]] = 1; //然后设为固定值
        }
      }
      !arr[0] && arr.shift();//删除第一条空数据
      obj.className = arr.join(' '); //用空格拼接成字符添加到类名去
    },
    /**
     * 移除类名
     * @obj {Object} 操作的dom对象
     * @cName {String} 要移除的类名，允许同时移除多个类名，用空格隔开
     * */
    removeClassName: function (obj, cName) {
      var oldArr = obj.className.split(' '), //原有类名数组
        addArr = cName.split(' '); //需要删除的类名数组

      //删除类名
      for (var i = 0, length = oldArr.length; i < length; i++) {
        for (var j = 0, len = addArr.length; j < len; j++) {
          oldArr[i] === addArr[j] && oldArr.splice(i, 1);
        }
      }

      obj.className = oldArr.join(' '); //用空格拼接成字符添加到类名去
    },
    /**
     * 类名切换
     * @obj {Object} 操作的dom对象
     * @cName {String} 要切换的类名
     * @return {Boolean} 添加返回true，移除返回false
     * */
    toggleClassName: function (obj, cName) {
      var oldArr = obj.className.split(' '); //原有类名数组
      for (var i = 0, length = oldArr.length; i < length; i++) {
        if (oldArr[i] === cName) {
          shape.classNameList.removeClassName(obj, cName);
          return false;
        }
      }
      shape.classNameList.addClassName(obj, cName);
      return true;
    },
    /**
     * 判断元素是否包含该类名
     * @obj {Object} 操作的dom对象
     * @cName {String} 要判断的类名
     * @return {Boolean} true为包含，false为不包含
     * */
    hasClassName: function (obj, cName) {
      var oldArr = obj.className.split(' '); //原有类名数组
      for (var i = 0, length = oldArr.length; i < length; i++) if (oldArr[i] === cName) return true;
      return false;
    }
  },

  /**
   * 运动方法
   * @obj {Object} 运动对象
   * @attr {String} 运动属性
   * @target {Number/String} 目标值
   * @time {Number} 淡入淡出过渡时间，单位ms
   * */
  running: function (obj, attr, target, time) {
    //兼容
    window.requestAnimationFrame = window.requestAnimationFrame || function (fn) {
      return setTimeout(fn, 1000 / 60);
    };
    window.cancelAnimationFrame = window.cancelAnimationFrame || clearTimeout;

    target = parseFloat(target); //如果目标值带单位则去掉单位
    var cssJson = obj.currentStyle || getComputedStyle(obj), //获取该对象样式集合
      start = parseFloat(cssJson[attr]) || cssJson['filter'].replace(/[^0-9]/ig, ''), //运动属性的初始值，后面取的filter是因为ie8不兼容opacity
      allRun = target - start, //总路程
      startTime = new Date; //动画开始时间

    start > 1 && (start = start / 100); //ie8的话取的是filter，值是100，所以要除100
    (function run() {
      var currentTime = new Date - startTime, //当前时间
        prop = currentTime / time, //当前路程的时间比
        current = prop * allRun + start; //当前位置。公式为：当前时间/总时间*总路程+初始值
      prop >= 1 ? current = target : requestAnimationFrame(run); //若达到目标值

      //透明度变化和其它属性变化做区别
      if (attr === 'opacity') {
        obj.style[attr] = current;
        obj.style.filter = 'alpha(opacity=' + current * 100 + ')';
      } else {
        obj.style[attr] = current + 'px';
      }
    })();
  },

  /**
   * 判断浏览器是否支持css3属性
   * @style {String} 属性名称
   * @return {Boolean} true/false
   * **/
  supportCss3: function (style) {
    var prefix = ['webkit', 'Moz', 'ms', 'o'],
      humpString = [],
      htmlStyle = document.documentElement.style,
      _toHumb = function (string) {
        return string.replace(/-(\w)/g, function ($0, $1) {
          return $1.toUpperCase();
        });
      },
      i;
    for (i in prefix) humpString.push(_toHumb(prefix[i] + '-' + style));
    humpString.push(_toHumb(style));
    for (i in humpString)
      if (humpString[i] in htmlStyle) return true;
    return false;
  },

  /**
   * 轮播方法。默认为hover触发
   * @container {String} 轮播图容器的id/class，溢出隐藏那个。若给的class则需要保证该class的唯一性
   *
   * @options {Json} 配置选项，有类名、轮播间隔、轮播触发事件等。【都可缺省，也可只配置需要的选项】
   *  @options.mode {Number} 切换方式。0为插卡式轮播，1为淡入淡出轮播，2为无缝轮播。默认0
   *  @options.multi {Boolean} 是否开启多图模式，默认false（可视区展示多张轮播图，即容器宽度大于单张轮播图宽度时需要开启。容器宽度最好是倍数方式大于slide的宽度）
   *  @options.autoPlay {Boolean} 轮播间隔时长。值为0则不自动轮播，默认5s间隔
   *  @options.prev {Object} 上一张按钮对象。默认空
   *  @options.next {Object} 下一张按钮对象。默认空
   *  @options.pagination {Json} 分页按钮
   *   @options.pagination.el {String} 分页元素的类名/id名，默认没有分页
   *   @options.pagination.className {String} 类名。默认on
   *   @options.pagination.fnName {String} 触发轮播的事件。默认mouseenter
   *   @options.pagination.useSelf {Boolean} 分页按钮的dom元素是否使用自己创建的。默认false表示自动创建分页按钮
   **/
  bannerChange: function (container, options) {
    /* init config */
    !options && (options = {}); //所有都缺省时，保证options是实例化对象，避免报错
    options = {
      mode: options.mode || 0, //切换方式
      multi: options.multi || false,
      autoPlay: (options.autoPlay === undefined || options.autoPlay) && (options.autoPlay || 3000) || false, //轮播间隔时长。值为0则不自动轮播，默认3s间隔
      prev: options.prev || '', //上一张按钮对象
      next: options.next || '', //下一张按钮对象
      //分页
      pagination: options.pagination && {
        el: options.pagination.el || '', //元素
        className: options.pagination.className || 'on', //类名
        fnName: options.pagination.fnName || 'mouseenter', //触发轮播的事件
        useSelf: options.pagination.useSelf || false //false为自动创建分页按钮，true则使用html里开发者写好的dom
      }
    };

    options.prev && (options.prev = document.querySelector(options.prev)); //上一张按钮
    options.next && (options.next = document.querySelector(options.next)); //下一张按钮

    container = document.querySelector(container);//容器
    var parent = container.querySelector('.shape-banner-wrapper'),//轮播图父级
      banner = parent.children,//轮播图
      page = container.querySelector('.shape-banner-pagination'),//分页按钮父级
      containerWidth = container.clientWidth, //容器的宽度
      bannerWidth, num,//每张轮播图占宽（需要含margin），展示的轮播图的个数
      length = banner.length, //轮播图个数
      index = 0, //下标
      clickTime = 0, //点击时间
      timer, i, //定时器，计数器
      /*样式初始化*/
      cssStr = 'img{border: none;}.shape-banner-container{overflow: hidden;position: relative;}.shape-banner-wrapper{position: relative;left: 0;height:100%;}.shape-banner-slide{float: left;}.shape-banner-pagination {position: absolute;left: 0;right: 0;bottom: 10px;z-index: 1;text-align: center;}.shape-banner-pagination > .default{display: inline-block;margin:0 3px;width: 8px;height: 8px;background-color: #b7b5b5;cursor: pointer;border-radius: 50%;}' +
        '.shape-banner-pagination > span.on,.shape-banner-pagination > span:hover{background-color: #4980e2;}.shape-banner-prev,.shape-banner-next{position: absolute;top: 50%;z-index: 1;color: #000;cursor: pointer;user-select: none;}.shape-banner-prev{left: 0;}.shape-banner-next{right: 0;}';

    if ('styleSheet' in styleTag) {
      //兼容ie8
      styleTag.setAttribute('type', 'text/css');
      styleTag.styleSheet.cssText += cssStr;
    } else {
      styleTag.innerHTML += cssStr;
    }

    try {
      bannerWidth = parseFloat(getComputedStyle(banner[0]).width) + parseFloat(getComputedStyle(banner[0]).marginLeft) + parseFloat(getComputedStyle(banner[0]).marginRight);//获取含margin的真实宽度
    } catch (e) {
      //兼容ie8
      var ml = parseFloat(banner[0].currentStyle.marginLeft) || 0,
        mr = parseFloat(banner[0].currentStyle.marginRight) || 0;
      bannerWidth = ((parseFloat(banner[0].currentStyle.width) + ml) || (banner[0].clientWidth + ml)) + mr;
    }
    num = Math.ceil(containerWidth / bannerWidth);
    options.mode === undefined || options.mode === 0 && options.multi && (length = Math.ceil(length / num)); //总共切换的次数。默认轮播的多图模式下才会用

    /* 添加分页按钮 */
    if (options.pagination && options.pagination.el) { //需要分页且需要自动创建按钮
      var pagination; //分页按钮

      if (options.pagination.useSelf) { //若用自己创建的按钮
        container.querySelector(options.pagination.el).children;
      } else {
        page.innerHTML = '';
        for (i = 0; i < length; i++) {
          page.appendChild(document.createElement('span')); //添加分页按钮
          shape.classNameList.addClassName(page.children[i], 'default');
        }
        pagination = page.children; //分页按钮
        shape.classNameList.addClassName(pagination[0], options.pagination.className);

        /* 分页按钮事件 */
        for (i = 0; i < length; i++) {
          (function (i) {
            options.mode === 1 && (banner[i].style.cssText = 'position:absolute;opacity:0;filter:alpha(opacity=0)');//淡入淡出轮播的样式设置
            shape.addEvent(pagination[i], options.pagination.fnName, function () {
              changePic(i);//按钮背景色改变
            });
          })(i);
        }
      }
    }

    /* 轮播图的初始化 */
    switch (options.mode) {
      //默认轮播
      case 0:
        parent.style.cssText = 'width:' + length + '00%;transition:left .5s';
        break;
      //淡入淡出轮播
      case 1:
        banner[0].style.cssText = 'opacity:1;filter:alpha(opacity=100)';
        break;
      //无缝轮播
      case 2:
        if (options.multi) { //多图无缝单个轮播
          var tempArr = []; //临时存放要克隆的dom节点
          //首图放末尾
          for (i = 0; i < num; i++) {
            parent.appendChild(banner[i].cloneNode(true));
            tempArr.push(banner[num - i].cloneNode(true)); //保存所有需要克隆的节点
          }
          //末图放前面
          for (i = 0; i < num; i++) parent.insertBefore(tempArr[i], banner[0]); //倒序取出需要克隆的节点
          parent.style.cssText = 'width:' + (length + 2) + '00%;left:-' + containerWidth + 'px;transition:left 0s;';//此时过渡为0以保证初始化效果不让用户看到
          setTimeout(function () {
            parent.style.transition = 'left .5s';
          });
        } else { //普通无缝轮播
          parent.appendChild(banner[0].cloneNode(true)); //首图放末尾
          parent.insertBefore(banner[length - 1].cloneNode(true), banner[0]); //末图放到第一张
          parent.style.cssText = 'width:' + (length + 2) + '00%;left:-' + containerWidth + 'px;transition:left 0s;';//此时过渡为0以保证初始化效果不让用户看到
          setTimeout(function () {
            parent.style.transition = 'left .5s';
          });
        }
        break;
    }

    /** 上/下一张按钮点击事件
     * @obj {Object} 按钮对象
     * @bool {Boolean} 上一张为false，下一张为true
     * */
    function btnClick(obj, bool) {
      shape.addEvent(obj, 'click', over);

      function over() {
        if (new Date() - clickTime > 520) { //防止点击过快出现bug
          bool ? changePic(index + 1) : changePic(index - 1);
          clickTime = new Date();
        }
      }
    }

    options.prev && btnClick(options.prev, false);
    options.next && btnClick(options.next, true);

    /** 自动轮播*/
    function auto() {
      timer = setInterval(function () {
        changePic(index + 1);
      }, options.autoPlay);
      return auto;
    }

    /*清除/恢复定时器*/
    shape.addEvent(container, 'mouseenter', function () {
      clearInterval(timer);
    });
    options.autoPlay && (container.onmouseleave = auto());//鼠标移开时继续执行定时器

    /** 轮播图的切换
     * @key {Number} 将要显示的图片的下标
     * */
    function changePic(key) {
      options.pagination && shape.classNameList.removeClassName(pagination[index < 0 && length - 1 || index], options.pagination.className);
      options.mode === 1 && shape.running(banner[index], 'opacity', 0, 400); //淡入淡出

      index = key;
      if (options.multi && options.mode === 2) {//若是多图的无缝轮播
        if (index <= 0 - num) {//复位到最后一张
          index = length - num;
          delay(length);
        } else if (index >= length) {//复位到第一张
          index = 0;
          delay(num);
        }
      } else {
        if (index < 0) {
          index = length - 1;
          options.mode === 2 && delay(length); //无缝轮播才用。最后一张后面还有一张，所以图片应该是下标+1也就是length
        } else if (index >= length) {
          index = 0;
          options.mode === 2 && delay(1); //无缝轮播才用。下标0的图片是最后一张，下标1才是第一张
        }
      }

      options.pagination && shape.classNameList.addClassName(pagination[index < 0 && length - 1 || index], options.pagination.className);

      //图片的切换
      switch (options.mode) {
        //默认轮播
        case 0:
          //浏览器支持transition则用transition轮播，否则用运动方法轮播
          var l = -index * containerWidth;
          shape.supportCss3('transition') && (parent.style.left = l + 'px') || shape.running(parent, 'left', l, '500');
          break;
        //淡入淡出轮播
        case 1:
          shape.running(banner[index], 'opacity', 1, 400);
          break;
        //无缝轮播
        case 2:
          //浏览器支持transition则用transition轮播，否则用运动方法轮播
          var normal = (key + 1) * containerWidth,
            multi = key * bannerWidth + containerWidth;
          if (shape.supportCss3('transition')) {//浏览器支持transition
            parent.style.left = (options.multi ? -multi : -normal) + 'px';
          } else {//不支持transition
            shape.running(parent, 'left', options.multi ? -multi : -normal, '500');
            if (key >= length) {//最后一张到第一张
              setTimeout(function () {
                parent.style.left = '-' + containerWidth + 'px';
              }, 520);
            } else if (key < -1) {//第一张到最后一张
              console.log(key);
              setTimeout(function () {
                parent.style.left = '-' + multi + 'px';
              }, 520);
            }
          }
          break;
      }
    }

    /** 无缝轮播对临界图片的处理（图片复位）
     * @x {Number} 将要显示的图片的下标(首尾两张图)
     * **/
    function delay(x) {
      var left = x * (options.multi && bannerWidth || containerWidth);
      //等动画完成之后再复位
      setTimeout(function () {
        parent.style.transition = 'left 0s';//去掉transition，以便瞬间复位
        parent.style.left = '-' + left + 'px';//复位到看起来的第一张，实际的第二张。因为第一张和最后一张一样
        setTimeout(function () {
          parent.style.transition = 'left .5s';//同时执行无法达到瞬间复位效果，所以添加transition时要延迟下
        }, 20);
      }, 520);
    }
  },

  /**
   * 自定义滚动条
   * @container {String} 盛放内容盒子的id/class，若给的class则需要保证该class的唯一性。需要css设置固定高或最大高度
   **/
  scrollBar: function (container) {
    container = document.querySelector(container); //容器
    var content = container.querySelector('.shape-scroll-wrapper'), //内容
      scroll = container.querySelector('.shape-scroll-area'), //滚动条父级
      bar = scroll.querySelector('.shape-scroll-bar'), //滚动条
      /*样式初始化*/
      cssStr = '.shape-scroll-container{overflow-y: hidden; position: relative; border: 1px solid #ddd; border-radius: 5px;}.shape-scroll-wrapper{position: absolute; top: 0; left: 0; width: inherit;}.shape-scroll-area,.shape-scroll-bar{position: absolute; top: 0; right: 0; width: 12px;height: 100%; background-color: #ecf5ff;}.shape-scroll-bar{width: 100%; background-color: #409eff; border-radius: 5px;}';
    if ('styleSheet' in styleTag) {
      //兼容ie8
      styleTag.setAttribute('type', 'text/css');
      styleTag.styleSheet.cssText += cssStr;
    } else {
      styleTag.innerHTML += cssStr;
    }

    if (content.clientHeight > container.clientHeight) {//如果内容高度大于盒子高度
      scroll.style.display = 'block';
      bar.style.height = Math.pow(container.clientHeight, 2) / content.clientHeight + 'px';

      var barMaxTop = scroll.clientHeight - bar.clientHeight,//滚动条最大top
        conMaxTop = content.clientHeight - container.clientHeight,//内容最大top
        prop = barMaxTop / conMaxTop;//比例

      /*滚轮事件*/
      addWheelEvent(container, function (e, d) {
        d *= 30;//滚动速度
        changeTop(d * prop);
        try {
          e.preventDefault();
        } catch (err) {
          e.cancelBubble = true;//兼容IE8，避免报错阻断代码运行
        }
        return false;
      });

      shape.addEvent(bar, 'mousedown', function (e) {
        barRoll(e);
      });

      shape.addEvent(scroll, 'click', function (e) {
        barClick(e);
      });

      /*按住拖动滚动条*/
      function barRoll(e) {
        e = e || window.event;
        var sY = e.clientY;//鼠标到文档top距离
        document.onmousemove = function (e) {
          content.style.userSelect = 'none';
          e = e || window.event;
          var nY = e.clientY;
          changeTop(nY - sY);
          sY = e.clientY;//给初始clientY重新赋值
        };
      }

      document.onmouseup = function () {
        content.style.userSelect = 'auto';
        this.onmousemove = null;
      };

      /*点击*/
      function barClick(e) {
        e = e || window.event;
        var cY = e.clientY,//鼠标到文档top距离
          barTop = getTop(bar) - document.documentElement.scrollTop || document.body.scrollTop;//获取滚动条top值

        changeTop(cY - barTop - bar.clientHeight / 2);
        bar.onclick = function (e) {//点击滚动条时阻止事件传递
          e.cancelBubble = true;
        };
      }
    } else {
      scroll.style.display = 'none';
    }

    /** top的改变
     * @x {Number} 滚动条top与下次滚动间的距离
     * */
    function changeTop(x) {
      //滚动条相关
      var barTop = bar.offsetTop + x;
      barTop = Math.max(barTop, 0);//滚动条到达顶部
      barTop = Math.min(barTop, barMaxTop);//到达底部
      bar.style.top = barTop + 'px';

      //内容相关
      var conTop = content.offsetTop - x / prop;//传参的时候已经预先d*prop了，所以这里要除去
      conTop = Math.max(-conTop, 0);//内容到达顶部
      conTop = -Math.min(conTop, conMaxTop);//到达底部
      content.style.top = conTop + 'px';
    }

    /** 获取元素top到document的top的距离，需遍历该元素及其所有父级(body为止，不含body)到document的top的距离
     * @obj {Object} 滚动条
     * @return {Number} 返回的是滚动条点击前top距document的距离
     * */
    function getTop(obj) {
      var t = 0;
      while (obj !== document.body) {
        t += obj.offsetTop;
        obj = obj.parentNode;
      }
      return t;
    }

    /** 滚轮事件的绑定
     * @obj {Object} 盛放内容的盒子
     * @fn {Function} 事件方法
     * */
    function addWheelEvent(obj, fn) {
      function eFn(e) {
        //真正的事件其实是在这执行
        //向上滚为负向下滚为正，如果函数返回false也就是想要阻止冒泡
        if (fn.call(obj, e = e || window.event, -e.wheelDelta / 120 || e.detail / 3) === false) {
          try {
            e.preventDefault();
          } catch (err) {
            e.cancelBubble = true;//兼容IE8，避免报错阻断代码运行
          }
          return false;
        }
      }

      var eName = document.createElement('div').onmousewheel === null ? 'mousewheel' : 'DOMMouseScroll';//判断是否是火狐或IE
      shape.addEvent(obj, eName, eFn);
    }
  },

  /**
   * 树形控件
   * @container {String} 盛放内容盒子的id/class，若给的class则需要保证该class的唯一性
   *
   * @nodes {Array} 树菜单/树节点数组
   *  @label {String} 节点名
   *  @icon {String} 无需图标切换的单个icon的图片路径（图片路径是从html页开始去找的）
   *  @iconOpen {String} 展开的icon的图片路径
   *  @iconClose {String} 闭合的icon的图片路径
   *  @open {Boolean} 是否默认展开节点。若展开的节点有父节点，则需要把它相应的所有父节点都设为展开。在手风琴模式下不允许展开多个同级节点
   *  @checked {Boolean} 是否默认选中此节点复选框
   *  @disabled {Boolean} 是否禁选此节点复选框
   *  @extend {String} 自定义扩展项。需要扩展的内容/标签
   *
   * @options {Json} 配置选项
   *  @fold {Boolean} 是否开启手风琴模式，默认false
   *  @checkbox {Boolean} 是否显示复选框，默认false
   **/
  tree: function (container, nodes, options) {
    /** init */
    !options && (options = {}); //所有都缺省时，保证options是实例化对象，避免报错
    options = {
      fold: options.fold || false, //手风琴模式
      checkbox: options.checkbox || false, //是否需要复选框
    };

    container = document.querySelector(container); //容器
    /*样式初始化*/
    var cssStr = '.shape-tree-container {overflow-y: auto;padding: 20px;height: auto;border: 1px solid #ddd;color: #606266;cursor: pointer;}.shape-tree-group {overflow: hidden;height: 0;}.shape-tree-group.open, .shape-tree-level-0 {height: auto;}.shape-tree-node-content {position: relative;height: 26px;line-height: 26px;}.shape-tree-node-content:hover, .shape-tree-node-content.on {background-color: #f5f7fa;}' +
      '.shape-tree-node-switch, .shape-tree-node-switch-hide {display: inline-block;margin: 0 6px;border: 5px solid transparent;border-right: none;border-left-color: #c0c4cc;transition: transform .3s;}.shape-tree-node-switch.open {transform: rotate(90deg);}.shape-tree-node-switch-hide {border-left-color: transparent;}.shape-tree-node-icon {display: none;margin-right: 4px;width: 16px;height: 16px;background: transparent no-repeat center;vertical-align: middle;}' +
      '.shape-tree-node-icon.on {display: inline-block;}.shape-tree-node-text {vertical-align: middle;}.shape-tree-node-extend {position: absolute;right: 0;top: 0;width: 100%;height: 100%;}.checkbox{display: inline-block;position: relative;margin-right: 8px;width: 13px;height: 13px;background-color: #fff;border: 1px solid #dcdfe6;vertical-align: middle;font-size: 14px;font-weight: 500;color: #606266;cursor: pointer;border-radius: 2px;user-select: none;}' +
      '.checkbox:hover{border-color: #409eff;}.checkbox.checked, .checkbox.on {background-color: #409eff;border-color: #409eff;}.checkbox.checked:before {content: "";position: absolute;left: 4px;top: 1px;width: 3px;height: 7px;border: 1px solid #fff;border-left: 0;border-top: 0;transform: rotate(45deg) scaleY(1);transition: transform .15s ease-in .05s;transform-origin: center;}' +
      '.checkbox.on:before {content: "";position: absolute;left: 0;right: 0;top: 5px;height: 2px;background-color: #fff;transform: scale(.5);}.checkbox.disabled {background-color: #edf2fc;border-color: #dcdfe6;cursor: not-allowed;}.checkbox.disabled.checked:before {background-color: #edf2fc;border-color: #c0c4cc;}.checkbox.disabled.on:before {background-color: #c0c4cc;border-color: #c0c4cc;}',
      index = 0;//递归的次数。用来计算缩进量
    if ('styleSheet' in styleTag) {
      //兼容ie8
      styleTag.setAttribute('type', 'text/css');
      styleTag.styleSheet.cssText += cssStr;
    } else {
      styleTag.innerHTML += cssStr;
    }

    /* 创建树菜单
     * @data {Array} 当前创建的树菜单的要遍历的数组
     * @index {Number} 递归的次数
     * @isOpen {Boolean} 是否展开节点
     * */
    function toTree(data, index, isOpen) {
      var html = '';
      html += '<div class="shape-tree-group shape-tree-level-' + index + '' + (isOpen && " open" || '') + '">';
      for (var i = 0, length = data.length; i < length; i++) {
        var bool = data[i].children && data[i].children.length > 0;//该节点是否有子节点
        html += '<div class="shape-tree-node">';
        html += '<div class="shape-tree-node-content" style="padding-left:' + (16 * index) + 'px;">'
          + (bool && '<i class="shape-tree-node-switch' + (data[i].open && " open" || '') + '"></i>' || '<i class="shape-tree-node-switch-hide"></i>')//三角开关
          + (options.checkbox && '<label class="checkbox' + (data[i].disabled && " disabled" || '') + (data[i].checked && " default-checked" || '') + '"></label>' || '')//复选框
          + '<label class="shape-tree-node-label">' + ((data[i].iconClose || data[i].icon) && '<span class="shape-tree-node-icon' + (!data[i].open && " on" || '') + '" style="background-image: url(' + (data[i].iconClose || data[i].icon) + ')"></span>' || '')//图标
          + (data[i].iconOpen && '<span class="shape-tree-node-icon' + (data[i].open && " on" || '') + '" style="background-image: url(' + data[i].iconOpen + ')"></span>' || '')//图标
          + '<span class="shape-tree-node-text">' + data[i].label + '</span></label>'//节点文字
          + (data[i].extend && '<div class="shape-tree-node-extend">' + data[i].extend + '</div>' || '')//扩展项
          + '</div>';
        bool ? html += toTree(data[i].children, index + 1, data[i].open) + '</div>' : html += '</div>';//若该节点有子节点则递归，否则该节点创建完毕
      }
      html += '</div>';
      return html;
    }

    container.innerHTML = toTree(nodes, index);//将生成的树形控件添加到dom树中

    var allNode = container.querySelectorAll('.shape-tree-node'),//获取所有节点
      allCheckbox = container.querySelectorAll('.shape-tree-node .shape-tree-node-content .checkbox'),//复选框
      currentNodeCon;//当前节点的内容
    for (var j = 0, len = allNode.length; j < len; j++) {
      /*节点的展开闭合*/
      allNode[j].onclick = function (e) {
        e = e || window.event;
        e.cancelBubble = true;

        var that = this,
          nodeChild = that.querySelector('.shape-tree-group'),///该节点下的子节点
          nodeCon = that.children[0],//该节点内容
          nodeSwitch = nodeCon.children[0],//该节点箭头开关
          nodeIcon = nodeCon.querySelectorAll('.shape-tree-node-icon');//该节点图标

        //节点背景色的添加移除
        currentNodeCon && shape.classNameList.removeClassName(currentNodeCon, 'on');
        shape.classNameList.addClassName(nodeCon, 'on');
        currentNodeCon = nodeCon;

        //节点内容的展开折叠
        nodeChild && shape.classNameList.toggleClassName(nodeChild, 'open');//子节点
        shape.classNameList.toggleClassName(nodeSwitch, 'open');//箭头
        //两种图标的切换
        if (nodeIcon.length > 1) {
          shape.classNameList.toggleClassName(nodeIcon[0], 'on');
          shape.classNameList.toggleClassName(nodeIcon[1], 'on');
        }

        /*手风琴模式*/
        if (options.fold) {
          var nodeSiblings = that.parentNode.children;//该节点及它所有兄弟节点
          //闭合除自己的所有同级节点
          for (var k = 0, l = nodeSiblings.length; k < l; k++) {
            nodeSiblings[k].index = k;
            if (nodeSiblings[k].index !== that.index) {
              var nodeSiblingsCon = nodeSiblings[k].children[0],//兄弟节点的内容
                nodeSiblingsIcon = nodeSiblingsCon.querySelectorAll('.shape-tree-node-icon'),//兄弟节点的图标
                nodeSiblingsChild = nodeSiblings[k].querySelector('.shape-tree-group');//兄弟节点的子节点

              nodeSiblingsChild && shape.classNameList.removeClassName(nodeSiblingsChild, 'open');//子节点
              shape.classNameList.removeClassName(nodeSiblingsCon.children[0], 'open');//箭头
              nodeSiblingsIcon[1] && shape.classNameList.removeClassName(nodeSiblingsIcon[1], 'on');//图标
              nodeSiblingsIcon[0] && shape.classNameList.addClassName(nodeSiblingsIcon[0], 'on');//图标
            }
          }
        }

        /*console.log(nodeCon.querySelector('.shape-tree-node-text').innerHTML);//text
        console.log(nodeChild && nodeChild.children);//children*/
      };

      /*点击复选框*/
      if (options.checkbox) {
        allCheckbox[j].onclick = function (e) {
          e = e || window.event;
          e.cancelBubble = true;
          !shape.classNameList.hasClassName(this, 'disabled') && checkboxClick(this);//复选框非禁用状态才能点击
        };

        shape.classNameList.hasClassName(allCheckbox[j], 'default-checked') && checkboxClick(allCheckbox[j]);//默认选中
      }

    }

    /* 复选框点击事件
     * @that {Object} 被点击的复选框
     * */
    function checkboxClick(that) {
      var obj = that.parentNode.parentNode.parentNode,//点击的复选框的节点组
        currentNode = that.parentNode.parentNode,//当前节点
        checkboxArr = currentNode.querySelectorAll('.checkbox');//该节点组下的所有复选框

      //自身的选中状态
      if (shape.classNameList.hasClassName(that, 'on')) {//若它子节点被选中
        shape.classNameList.removeClassName(that, 'on');//移除横线状态
        shape.classNameList.addClassName(that, 'checked');//添加选中状态
      } else {
        shape.classNameList.toggleClassName(that, 'checked');
      }

      //该节点下所有子节点的选中状态
      for (var key = 0, leng = checkboxArr.length; key < leng; key++) {
        if (checkboxArr[key] !== that) {
          if (shape.classNameList.hasClassName(that, 'checked')) {
            shape.classNameList.removeClassName(checkboxArr[key], 'on');
            shape.classNameList.addClassName(checkboxArr[key], 'checked');
          } else {
            shape.classNameList.removeClassName(checkboxArr[key], 'checked');
          }
        }
      }

      //父节点&&兄弟节点
      if (shape.classNameList.hasClassName(that, 'checked')) {//自身选中时
        while (!shape.classNameList.hasClassName(obj, 'shape-tree-level-0')) {//若不是根节点
          if (shape.classNameList.hasClassName(obj, 'shape-tree-group')) {
            var mark = true;//假设父兄弟节点为选中
            for (key = 0, leng = obj.children.length; key < leng; key++) {
              var opt = obj.children[key].querySelector('.checkbox'),//所有兄弟节点复选框
                pOpt = obj.previousSibling.querySelector('.checkbox');//父节点复选框
              if (!shape.classNameList.hasClassName(opt, 'checked')) {//有一个兄弟节点未选中
                mark = false;
                break;
              }
            }

            if (mark) {//全选中
              shape.classNameList.removeClassName(pOpt, 'on');
              shape.classNameList.addClassName(pOpt, 'checked');
              obj = obj.parentNode;//因为它父节点是选中状态，可以跳过
            } else {//有一个未选中
              shape.classNameList.removeClassName(pOpt, 'checked');
              shape.classNameList.addClassName(pOpt, 'on');
            }
          }
          obj = obj.parentNode;
        }
      } else {
        while (!shape.classNameList.hasClassName(obj, 'shape-tree-level-0')) {//若不是根节点
          if (shape.classNameList.hasClassName(obj, 'shape-tree-group')) {
            var mark = false;//假设父兄弟节点未选中
            for (key = 0, leng = obj.children.length; key < leng; key++) {
              var opt = obj.children[key].querySelector('.checkbox'),//所有兄弟节点复选框
                pOpt = obj.previousSibling.querySelector('.checkbox');//父节点复选框
              if (shape.classNameList.hasClassName(opt, 'checked') || shape.classNameList.hasClassName(opt, 'on')) {//有一个兄弟节点被选中
                mark = true;
                break;
              }
            }

            if (mark) {//有一个兄弟被选中
              shape.classNameList.removeClassName(pOpt, 'checked');
              shape.classNameList.addClassName(pOpt, 'on');
            } else {//全未选中
              shape.classNameList.removeClassName(pOpt, 'checked on');
            }
          }
          obj = obj.parentNode;
        }
      }

      /*return {
        currentNode: currentNode,//点击的复选框的节点
        children: that.parentNode.nextSibling && that.parentNode.nextSibling.children,//点击的复选框节点的子节点
        currentNodeCheck: that.nextSibling.querySelector('.shape-tree-node-text').innerHTML,//点击的复选框的文本内容
        allChecked: container.querySelectorAll('.checkbox.checked')//所有选中的节点
      }*/
    }
  }
};


