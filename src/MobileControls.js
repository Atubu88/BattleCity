function MobileControls(keyboard) {
  this._keyboard = keyboard;
  this._activeKeys = {};
  this._setup();
}

MobileControls.prototype._setup = function () {
  this._bindHoldControl('control-up', Keyboard.Key.UP);
  this._bindHoldControl('control-right', Keyboard.Key.RIGHT);
  this._bindHoldControl('control-down', Keyboard.Key.DOWN);
  this._bindHoldControl('control-left', Keyboard.Key.LEFT);
  this._bindHoldControl('control-fire', Keyboard.Key.SPACE);

  this._bindTapControl('control-start', Keyboard.Key.START);
  this._bindTapControl('control-select', Keyboard.Key.SELECT);

  var self = this;
  $(window).on('blur', function () {
    self._releaseAll();
  });
  $(document).on('visibilitychange', function () {
    if (document.hidden) {
      self._releaseAll();
    }
  });
};

MobileControls.prototype._bindHoldControl = function (elementId, key) {
  var self = this;
  var pointerId = null;
  var element = $('#' + elementId);

  function onDown(event) {
    if (pointerId !== null) {
      return;
    }
    pointerId = event.pointerId;
    self._activeKeys[elementId] = key;
    element.addClass('active');
    self._keyboard.pressKey(key);
    event.preventDefault();
  }

  function onUp(event) {
    if (pointerId !== null && event.pointerId !== pointerId) {
      return;
    }
    pointerId = null;
    element.removeClass('active');
    self._keyboard.releaseKey(key);
    delete self._activeKeys[elementId];
    event.preventDefault();
  }

  element.on('pointerdown', onDown);
  element.on('pointerup pointercancel pointerleave', onUp);
};

MobileControls.prototype._bindTapControl = function (elementId, key) {
  var self = this;
  var element = $('#' + elementId);

  element.on('pointerdown', function (event) {
    element.addClass('active');
    self._keyboard.pressKey(key);
    event.preventDefault();
  });

  element.on('pointerup pointercancel pointerleave', function (event) {
    element.removeClass('active');
    self._keyboard.releaseKey(key);
    event.preventDefault();
  });
};

MobileControls.prototype._releaseAll = function () {
  for (var elementId in this._activeKeys) {
    if (this._activeKeys.hasOwnProperty(elementId)) {
      this._keyboard.releaseKey(this._activeKeys[elementId]);
      $('#' + elementId).removeClass('active');
    }
  }
  this._activeKeys = {};
};
