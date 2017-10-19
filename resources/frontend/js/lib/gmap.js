class GMap {
  /**
   * Create a Google map using Google JavaScript v3 API
   * @constructor
   * @param {string} elementId - The element to hook the map object
   * @param {number} lat - The longitude for the center of the map
   * @param {number} lon - The latitude for the center of the map
   * @param {number} zoom - The zoom of the map
   */
  constructor (elementId = null, lat = null, lon = null, zoom = 7, soundManager = null, apiKey) {
    // this.api = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBElP70ShEamoaFOgUzmN3u5Oo9eArxoac&language=el&region=GR'
    this.api = 'https://maps.googleapis.com/maps/api/' + apiKey
    this.gmap = null
    this.lat = lat
    this.lon = lon
    this.zoom = zoom
    this.soundManager = soundManager
    this.initialData = window.location.protocol + '//' + window.app.host + '/api/v1/alerts/show/'
    this.deleteUrl = window.location.protocol + '//' + window.app.host + '/api/v1/alerts/delete/'
    this.verifyUrl = window.location.protocol + '//' + window.app.host + '/api/v1/alerts/verify/'
    this.editCommentsUrl = window.location.protocol + '//' + window.app.host + '/api/v1/alerts/edit-comments/'
    this.unverifiedIcon = window.location.protocol + '//' + window.app.host + '/assets/unverified-marker.png'
    this.verifiedIcon = window.location.protocol + '//' + window.app.host + '/assets/verified-marker.png'
    this.safety = $('#deletionSafety')
    this.deleteBtn = $('#deleteMarkerBtn')
    this.safetyLbl = $('#safetyLabel')
    /**
     * Markers array holds native Google Markers objects
     * with an additional Alert object as defined in migration xxx_alert.js, with attributes:
     * ID, phonenumber, lat, lon, verified, created_at, comments, plus other non relevant here
     */
    this.markers = []
    this.element = document.getElementById(elementId)
    if (this.element !== null) {
      this.bootstrap()
    }
  }

  /**
   * Load Maps library from Google and invoke the init method on load
   */
  bootstrap () {
    let script = document.createElement('script')
    let prior = document.getElementsByTagName('script')[0]
    script.type = 'text/javascript'
    script.async = false
    script.onload = () => {
      this.init()
    }
    script.src = this.api
    prior.parentNode.insertBefore(script, prior)
  }

  /**
   * Create the map
   */
  init () {
    this.options = {
      center: {lat: this.lat, lng: this.lon},
      zoom: this.zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullScreenControl: true,
      draggableCursor: 'default',
      draggingCursor: 'default'
    }
    this.gmap = new google.maps.Map(this.element, this.options)
    this.attachListeners()
    this.loadInitialData()
  }

  /**
   * Attach map's event listeners
   */
  attachListeners () {
    this.centerMap()
    this.resetZoom()
    this.onSafety()
  }

  loadInitialData () {
    $.ajax({
      url: this.initialData,
      type: 'GET',
      success: (res) => {
        res.forEach((entry) => {
          this.addMarker(entry)
        })
      },
      err: (err) => {
        console.log('could not load initial data', err)
      }
    })
  }

  onSafety () {
    this.safety.off('click').on('click', (e) => {
      if (e.currentTarget.checked) {
        this.deleteBtn.prop('disabled', false)
        this.safetyLbl.addClass('red-brown').text('⚠ απασφαλισμένο ⚠')
      } else {
        this.deleteBtn.prop('disabled', true)
        this.safetyLbl.removeClass('red-brown').text('ασφαλισμένο')
      }
    })
  }

  /**
   * Get the corresponding alert info for a map marker
   * @param {Alert} alert - An alert event
   */
  getAlertFromMarker (marker) {
    let result = false
    this.markers.forEach((entry) => {
      if ((Math.round(marker.latLng.lat() * 1e6) / 1e6) === entry.alert.lat &&
        (Math.round(marker.latLng.lng() * 1e6) / 1e6) === entry.alert.lon) {
        result = entry
      }
    })
    return result
  }
    /**
   * Get the corresponding alert info for a map marker
   * @param {Alert} alert - An alert event
   */
  deleteAlertFromMarkersArrayByID (marker) {
    let index = -1
    this.markers.forEach((entry, i) => {
      if (entry.alert.id === marker.alert.id) {
        index = i
      }
    })
    if (index !== -1) {
      this.markers.splice(index, 1)
    }
  }
  /**
   * Get a Google Marker with Alert object attatched as stored in markers array.
   * @param {*} id - Alert ID
   */
  getMarkerByAlertId (id) {
    let result = null
    this.markers.forEach((entry) => {
      if (entry.alert.id === id) {
        result = entry
      }
    })
    return result
  }
  modifyAlertByID (marker) {
    this.markers.forEach((entry, index) => {
      if (entry.alert.id === marker.id) {
        this.markers[index].alert = marker
      }
    })
  }
  /**
   * Centers the map
   */
  centerMap () {
    $('#mapCenter').on('click', (e) => {
      e.preventDefault()
      this.gmap.setCenter({lat: this.lat, lng: this.lon})
    })
  }
  resetZoom () {
    $('#mapResetZoom').on('click', (e) => {
      e.preventDefault()
      this.gmap.setZoom(this.zoom)
    })
  }
  /**
   * Handle marker's menu actions
   * @param {Marker} marker - An individual marker on map
   */
  showMenu (marker) {
    let menu = $('#markerMenu')
    let info = $('#markerInfo')
    let edit = $('#markerEdit')
    let alert = this.getAlertFromMarker(marker)
    $(info).html(this.getMarkerInfo(alert))
    $(edit).html(this.getEditInfo(alert))
    $(menu).addClass('is-active')
    this.soundManager.stop()
    $('.closeMarkerMenu').off('click').on('click', () => {
      $(menu).removeClass('is-active')
    })
    $('.deleteMarkerMenu').off('click').on('click', {alert: alert, marker: marker}, (event) => {
      // delete the marker from DB and map
      this.deleteAlert(event.data)
    })
    $('#confirmed').off('click').on('click', {alert: alert, marker: marker}, (event) => {
      this.verifyAlert(event.data)
    })
    $('#comments').off('change keyup paste mouseup').on('change keyup paste mouseup', {alert: alert, marker: marker}, (event) => {
      this.editComments(event)
    })
  }

  editComments (event) {
    let url = this.editCommentsUrl + event.data.alert.alert.id
    $.ajax({
      url: url,
      type: 'POST',
      data: {text: event.target.value},
      error: (err) => {
        console.log('could not edit comments ', err)
      }
    })
  }

    /**
   * Performs alert confirmation request
   * @param {*} data - Event data containing both marker and alert objects.
   */
  verifyAlert (data) {
    let url = this.verifyUrl + data.alert.alert.id
    $.ajax({
      url: url,
      type: 'GET',
      error: (err) => {
        console.log('verification error ', err)
      }
    })
  }
  modifyAlert (action = '', data) {
    let marker = this.getMarkerByAlertId(data.id)
    this.modifyAlertByID(data)
    // handle the visual part
    if (action === 'alert verified') {
      marker.setIcon(this.verifiedIcon)
    } else if (action === 'alert unverified') {
      marker.setIcon(this.unverifiedIcon)
    }
  }
  /**
   * Performs alert deletion request and closes the alert menu
   * @param {*} data - Event data containing both marker and alert objects.
   */
  deleteAlert (data) {
    let url = this.deleteUrl + data.alert.alert.id
    $.ajax({
      url: url,
      type: 'GET',
      success: (res) => {
        $('#markerMenu').removeClass('is-active')
      },
      error: (err) => {
        console.log('deletion error ', err)
      }
    })
  }
  /**
   * Deletes a marker object containing an ID
   * @param {*} data
   */
  deleteMarker (data) {
    let marker = this.getMarkerByAlertId(data.id)
    if (marker !== null) {
      this.deleteAlertFromMarkersArrayByID(marker)
      marker.setMap(null)
    }
  }
  getMarkerInfo (alert) {
    console.log(alert )
    return `<h4>Πληροφορίες</h4><p><b>Ώρα Δήλωσης Συμβάντος:</b> <span class='data'>` + new Date(alert.alert.created_at).toLocaleString('el-GR') + `</span></p>
    <p><b>Τηλέφωνο Πολίτη:</b> <span class='data'>` + alert.alert.phonenumber + `</span></p>
    <p><b>Γεωγραφικό Μήκος (Latitude):</b> <span class='data'>` + alert.alert.lat + `</span></p>
    <p><b>Γεωγραφικό Πλάτος (Longitude):</b> <span class='data'>` + alert.alert.lon + `</span></p>`
  }
  getEditInfo (alert) {
    let verified = alert.alert.verified === 1 ? 'checked="checked"' : ''
    let comments = alert.alert.comments === null ? '' : alert.alert.comments
    return `<h4>Ενέργειες</h4>
    <div class="field">
    <input class="is-checkbox gray" id="confirmed" type="checkbox" name="confirmed" ` + verified + `">
    <label for="confirmed">Επιβεβαιώθηκε;</label>
  </div>
  <div class="field">
  <div class="control">
    <textarea class="textarea gray is-medium" type="text" placeholder="Σημειώσεις χειριστή" id="comments" name="comments">` + comments + `</textarea>
  </div>
</div>`
  }
  /**
   * Repaints current map instance
   */
  repaint () {
    google.maps.event.trigger(this.gmap, 'resize')
  }
  /**
   * Adds a new marker in the map from the incoming alert notification object
   * @param {Object} alert - The incoming alert object
   * @param {string} alert.phonenumber - The phone number of the person reported the incident
   * @param {number} alert.lat - The latitude of the position the person were at the time of the report
   * @param {number} alert.lon - The longitude of the position the person were at the time of the report
   */
  addMarker (alert) {
    let lat = parseFloat(alert.lat)
    let lon = parseFloat(alert.lon)
    alert.lat = lat
    alert.lon = lon
    let dtime = 'Ώρα αναφοράς ' + new Date(alert.created_at).toLocaleString('el-GR')
    let verified = alert.verified === 1
    let iconUrl = ''
    if (!verified) {
      iconUrl = this.unverifiedIcon
    } else {
      iconUrl = this.verifiedIcon
    }
    let labelText = verified
    let marker = new google.maps.Marker({
      position: {lat: lat, lng: lon},
      map: this.gmap,
      icon: iconUrl,
      title: dtime,
      alert: alert
    })
    marker.setMap(this.gmap)
    marker.addListener('click', (marker) => {
      this.showMenu(marker)
    })
    this.markers.push(marker)
  }
}

export { GMap }
