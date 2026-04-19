var SoundManager = (function() {
  var DEFAULT_SOUND_POOL_SIZE = 2;
  var SOUND_POOL_SIZE_BY_KEY = {
    bullet_shot: 6,
  };
  var sounds = {
    stage_start: null,
    game_over: null,
    bullet_shot: null,
    bullet_hit_1: null,
    bullet_hit_2: null,
    explosion_1: null,
    explosion_2: null,
    pause: null,
    powerup_appear: null,
    powerup_pick: null,
    statistics_1: null,
  };
  var soundPools = {};
  
  for (var i in sounds) {
    var snd = new Audio("sound/" + i + ".ogg");
    snd.preload = "auto";
    sounds[i] = snd;

    soundPools[i] = [];
    var poolSize = SOUND_POOL_SIZE_BY_KEY[i] || DEFAULT_SOUND_POOL_SIZE;
    for (var j = 0; j < poolSize; j++) {
      var pooledSound = new Audio("sound/" + i + ".ogg");
      pooledSound.preload = "auto";
      soundPools[i].push(pooledSound);
    }
  }
  
  return {
    play: function (sound) {
      var pool = soundPools[sound];
      var playableSound = sounds[sound];

      for (var i = 0; i < pool.length; i++) {
        if (pool[i].paused || pool[i].ended) {
          playableSound = pool[i];
          break;
        }
      }

      playableSound.currentTime = 0;
      playableSound.play();
    },
  };
})();
