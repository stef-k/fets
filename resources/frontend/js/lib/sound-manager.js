class SoundManager {
  constructor () {
    this.sound = $('#speaker')
  }
  play () {
    $(this.sound).trigger('play')
  }
  stop () {
    $(this.sound).trigger('pause')
  }
}
export {SoundManager}
