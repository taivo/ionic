/**
 * @private
 */
IonicModule

.controller('$ionicScroll', [
  '$scope',
  'scrollViewOptions',
  '$timeout',
  '$window',
  '$location',
  '$rootScope',
  '$document',
  '$ionicScrollDelegate',
function($scope, scrollViewOptions, $timeout, $window, $location, $rootScope, $document, $ionicScrollDelegate) {

  var self = this;
  // for testing
  this.__timeout = $timeout;

  this._scrollViewOptions = scrollViewOptions; //for testing

  var element = this.element = scrollViewOptions.el;
  var $element = this.$element = jqLite(element);
  var scrollView = this.scrollView = new ionic.views.Scroll(scrollViewOptions);

  //Attach self to element as a controller so other directives can require this controller
  //through `require: '$ionicScroll'
  //Also attach to parent so that sibling elements can require this
  ($element.parent().length ? $element.parent() : $element)
    .data('$$ionicScrollController', this);

  var deregisterInstance = $ionicScrollDelegate._registerInstance(
    this, scrollViewOptions.delegateHandle
  );

  if (!angular.isDefined(scrollViewOptions.bouncing)) {
    ionic.Platform.ready(function() {
      scrollView.options.bouncing = true;

      if(ionic.Platform.isAndroid()) {
        // No bouncing by default on Android
        scrollView.options.bouncing = false;
        // Faster scroll decel
        scrollView.options.deceleration = 0.95;
      }
    });
  }

  var resize = angular.bind(scrollView, scrollView.resize);
  ionic.on('resize', resize, $window);


  var scrollFunc = function(e) {
    var detail = (e.originalEvent || e).detail || {};
    $scope.$onScroll && $scope.$onScroll({
      event: e,
      scrollTop: detail.scrollTop || 0,
      scrollLeft: detail.scrollLeft || 0
    });
  };

  $element.on('scroll', scrollFunc );

  $scope.$on('$destroy', function() {
    deregisterInstance();
    scrollView.__cleanup();
    ionic.off('resize', resize, $window);
    $window.removeEventListener('resize', resize);
    scrollViewOptions = null;
    self._scrollViewOptions.el = null;
    self._scrollViewOptions = null;
    $element.off('scroll', scrollFunc);
    $element = null;
    self.$element = null;
    element = null;
    self.element = null;
    self.scrollView = null;
    scrollView = null;
  });

  $timeout(function() {
    scrollView && scrollView.run && scrollView.run();
  });

  this.getScrollView = function() {
    return this.scrollView;
  };

  this.getScrollPosition = function() {
    return this.scrollView.getValues();
  };

  this.resize = function() {
    return $timeout(resize).then(function() {
      $element && $element.triggerHandler('scroll.resize');
    });
  };

  this.scrollTop = function(shouldAnimate) {
    ionic.DomUtil.blurAll();
    this.resize().then(function() {
      scrollView.scrollTo(0, 0, !!shouldAnimate);
    });
  };

  this.scrollBottom = function(shouldAnimate) {
    ionic.DomUtil.blurAll();
    this.resize().then(function() {
      var max = scrollView.getScrollMax();
      scrollView.scrollTo(max.left, max.top, !!shouldAnimate);
    });
  };

  this.scrollTo = function(left, top, shouldAnimate) {
    ionic.DomUtil.blurAll();
    this.resize().then(function() {
      scrollView.scrollTo(left, top, !!shouldAnimate);
    });
  };

  this.zoomTo = function(zoom, shouldAnimate, originLeft, originTop) {
    ionic.DomUtil.blurAll();
    this.resize().then(function() {
      scrollView.zoomTo(zoom, !!shouldAnimate, originLeft, originTop);
    });
  };

  this.zoomBy = function(zoom, shouldAnimate, originLeft, originTop) {
    ionic.DomUtil.blurAll();
    this.resize().then(function() {
      scrollView.zoomBy(zoom, !!shouldAnimate, originLeft, originTop);
    });
  };

  this.scrollBy = function(left, top, shouldAnimate) {
    ionic.DomUtil.blurAll();
    this.resize().then(function() {
      scrollView.scrollBy(left, top, !!shouldAnimate);
    });
  };

  this.anchorScroll = function(shouldAnimate) {
    ionic.DomUtil.blurAll();
    this.resize().then(function() {
      var hash = $location.hash();
      var elm = hash && $document[0].getElementById(hash);
      if (!(hash && elm)) {
        scrollView.scrollTo(0,0, !!shouldAnimate);
        return;
      }
      var curElm = elm;
      var scrollLeft = 0, scrollTop = 0, levelsClimbed = 0;
      do {
        if(curElm !== null)scrollLeft += curElm.offsetLeft;
        if(curElm !== null)scrollTop += curElm.offsetTop;
        curElm = curElm.offsetParent;
        levelsClimbed++;
      } while (curElm.attributes != self.element.attributes && curElm.offsetParent);
      scrollView.scrollTo(scrollLeft, scrollTop, !!shouldAnimate);
    });
  };


  /**
   * @private
   */
  this._setRefresher = function(refresherScope, refresherElement) {
    var refresher = this.refresher = refresherElement;
    var refresherHeight = self.refresher.clientHeight || 60;
    scrollView.activatePullToRefresh(refresherHeight, function() {
      // activateCallback
      refresher.classList.add('active');
      refresherScope.$onPulling();
    }, function() {
      // deactivateCallback
        refresher.classList.remove('active', 'refreshing', 'refreshing-tail');
    }, function() {
      // startCallback
      refresher.classList.add('refreshing');
      refresherScope.$onRefresh();
    },function(){
      // showCallback
      refresher.classList.remove('invisible');
    },function(){
      // hideCallback
      refresher.classList.add('invisible');
    },function(){
      // tailCallback
      refresher.classList.add('refreshing-tail');
    });
  };
}]);

