function MobileControls(keyboard) {
  this._keyboard = keyboard;
  this._activeKeys = {};
  this._supportsPointer = !!window.PointerEvent;
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
  if (!element.length) {
    return;
  }

  function onDown(event, id) {
    if (pointerId !== null) {
      return;
    }
    pointerId = id;
    self._activeKeys[elementId] = key;
    element.addClass('active');
    self._keyboard.pressKey(key);
    event.preventDefault();
  }

  function onUp(event, id) {
    if (pointerId !== null && id !== null && id !== pointerId) {
      return;
    }
    pointerId = null;
    element.removeClass('active');
    self._keyboard.releaseKey(key);
    delete self._activeKeys[elementId];
    event.preventDefault();
  }

  if (this._supportsPointer) {
    element.on('pointerdown', function (event) {
      onDown(event, event.pointerId);
    });
    element.on('pointerup pointercancel pointerleave', function (event) {
      onUp(event, event.pointerId);
    });
    return;
  }

  element.on('touchstart', function (event) {
    var touch = event.originalEvent.changedTouches[0];
    onDown(event, touch.identifier);
  });
  element.on('touchend touchcancel', function (event) {
    var touch = event.originalEvent.changedTouches[0];
    onUp(event, touch ? touch.identifier : null);
  });
  element.on('mousedown', function (event) {
    onDown(event, 'mouse');
  });
  element.on('mouseup mouseleave', function (event) {
    onUp(event, 'mouse');
  });
};

MobileControls.prototype._bindTapControl = function (elementId, key) {
  var self = this;
  var element = $('#' + elementId);
  if (!element.length) {
    return;
  }

  function press(event) {
    element.addClass('active');
    self._keyboard.pressKey(key);
    event.preventDefault();
  }

  function release(event) {
    element.removeClass('active');
    self._keyboard.releaseKey(key);
    event.preventDefault();
  }

  if (this._supportsPointer) {
    element.on('pointerdown', press);
    element.on('pointerup pointercancel pointerleave', release);
    return;
  }

  element.on('touchstart mousedown', press);
  element.on('touchend touchcancel mouseup mouseleave', release);
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
