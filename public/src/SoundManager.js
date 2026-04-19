var SoundManager = (function () {
  var sounds = {
    stage_start: true,
    game_over: true,
    bullet_shot: true,
    bullet_hit_1: true,
    bullet_hit_2: true,
    explosion_1: true,
    explosion_2: true,
    pause: true,
    powerup_appear: true,
    powerup_pick: true,
    statistics_1: true,
  };
  var AudioContextClass = window.AudioContext || window.webkitAudioContext;
  var hasWebAudio = !!AudioContextClass;
  var context = hasWebAudio ? new AudioContextClass() : null;
  var buffers = {};
  var fallbackSounds = {};
  var loadingPromises = {};

  function createFallbackSound(key) {
    if (!fallbackSounds[key]) {
      var audio = new Audio("sound/" + key + ".ogg");
      audio.preload = "auto";
      fallbackSounds[key] = audio;
    }
    return fallbackSounds[key];
  }

  function fallbackPlay(key) {
    var sound = createFallbackSound(key);
    sound.currentTime = 0;
    var playResult = sound.play();
    if (playResult && playResult.catch) {
      playResult.catch(function () {});
    }
  }

  function decodeWithContext(arrayBuffer) {
    return new Promise(function (resolve, reject) {
      context.decodeAudioData(arrayBuffer, resolve, reject);
    });
  }

  function loadBuffer(key) {
    if (!hasWebAudio) {
      return Promise.resolve(null);
    }
    if (buffers[key]) {
      return Promise.resolve(buffers[key]);
    }
    if (loadingPromises[key]) {
      return loadingPromises[key];
    }
    loadingPromises[key] = fetch("sound/" + key + ".ogg")
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load sound: " + key);
        }
        return response.arrayBuffer();
      })
      .then(decodeWithContext)
      .then(function (buffer) {
        buffers[key] = buffer;
        delete loadingPromises[key];
        return buffer;
      })
      .catch(function () {
        delete loadingPromises[key];
        return null;
      });
    return loadingPromises[key];
  }

  function resumeContextIfNeeded() {
    if (!hasWebAudio || !context || context.state !== "suspended") {
      return Promise.resolve();
    }
    return context.resume().catch(function () {});
  }

  function playWithWebAudio(key, buffer) {
    if (!buffer) {
      fallbackPlay(key);
      return;
    }
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
  }

  for (var sound in sounds) {
    if (sounds.hasOwnProperty(sound)) {
      loadBuffer(sound);
    }
  }

  return {
    play: function (key) {
      if (!sounds[key]) {
        return;
      }
      if (!hasWebAudio) {
        fallbackPlay(key);
        return;
      }

      resumeContextIfNeeded().then(function () {
        loadBuffer(key).then(function (buffer) {
          playWithWebAudio(key, buffer);
        });
      });
    },
  };
})();
