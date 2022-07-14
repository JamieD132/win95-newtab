import './lib/js/jquery.min.js'
import './lib/js/bootstrap.min.js'
import { initializeTopSites } from './topsites.js'
import * as wallpaperSettings from './wallpaper-settings.js'
import { initializeWallpapers } from './wallpapers.js'

let currentDialog = ''
let searchEngines
let selelectedSearchEngine

function onSearchButtonClick (e) {
  $('#searchbutton').trigger('blur')
  const searchQuery = $('.searchbar').val()
  const searchEngine = JSON.parse(localStorage.getItem('selectedsearchengine'))
  if (searchQuery !== '') {
    window.location.href = searchEngine.url + searchQuery
  }
}

function onBackgroundClick (e) {
  $('#startButton').removeClass('startClick')
  $('.startMenu').hide()
}

function onStartButtonClick (e) {
  $('#startButton').trigger('blur')
  $('.startMenu').toggle()
  $('#startButton').toggleClass('startClick')
}

function onMenuItemClick (e) {
  $('#startButton').removeClass('startClick')
  $('.startMenu').hide()
  currentDialog = '#' + e.target.id + '-modal'
  let content
  let title
  switch (e.target.id) {
    case 'background-settings':
      title = 'Background settings'
      content = './modals/background-settings.html'
      break
    case 'search-settings':
      title = 'Search settings'
      content = './modals/search-settings.html'
      break
    case 'clock-settings':
      title = 'Clock settings'
      content = './modals/clock-settings.html'
      break
    case 'misc-settings':
      title = 'Miscellaneous settings'
      content = './modals/misc-settings.html'
      break
    case 'credits':
      title = 'Credits'
      content = './modals/credits.html'
      break
    default:
      return
  }
  $('#modal-title').text(title)
  showModal(content, e.target.id)
}

function showModal (content, type) {
  $('#modal-body').load(content, function () {
    if (type === 'background-settings') {
      wallpaperSettings.initializeBackgroundSettings()
      return
    } else if (type === 'search-settings') {
      initializeSearchSettings()
      return
    } else if (type === 'credits') {
      $('#modal-button-cancel').hide()
      $('#modal-button-save').text('Close')
      $('#settings-modal').show()
      return
    }
    $(currentDialog + ' input').each(function () {
      const value = JSON.parse(localStorage.getItem(this.name))
      switch (this.type) {
        case 'checkbox':
          this.checked = value
          break
        default:
          this.value = localStorage.getItem(this.name)
          break
      }
    })
    $('#settings-modal').show()
  })
}

function initializeSearchSettings () {
  searchEngines = JSON.parse(localStorage.getItem('searchengines'))
  selelectedSearchEngine = JSON.parse(
    localStorage.getItem('selectedsearchengine')
  )
  const element = buildSearchEngineOptionElement(selelectedSearchEngine)
  $('#search-engine-dropdown').append(element)
  searchEngines
    .filter((x) => x.id !== selelectedSearchEngine.id)
    .forEach((searchEngine) => {
      const element = buildSearchEngineOptionElement(searchEngine)
      $('#search-engine-dropdown').append(element)
    })
  const customEngines = searchEngines.filter((x) => x.isCustom === true)
  if (customEngines.length > 0) {
    customEngines.forEach((customEngine) => {
      const element = buildSearchEngineOptionElement(customEngine)
      $('#search-engine-delete-dropdown').append(element)
    })
  }
  $('#add-search-engine-button').on('click', addSearchEngine)
  $('#search-engine-delete-button').on('click', deleteSearchEngine)
  $('#custom-engine-name').on('change paste keyup', updateSearchEngineDOM)
  $('#custom-engine-url').on('change paste keyup', updateSearchEngineDOM)
  updateSearchEngineDOM()
  $('#settings-modal').show()
}

function buildSearchEngineOptionElement (searchEngine) {
  const element =
    "<option value='" + searchEngine.id + "'>" + searchEngine.name + '</option>'
  return element
}
function deleteSearchEngine (e) {
  const engineToDelete = $('#search-engine-delete-dropdown').val()
  const index = searchEngines.findIndex((x) => x.id === Number(engineToDelete))
  searchEngines.splice(index, 1)
  $("option[value='" + engineToDelete + "']").remove()
  updateSearchEngineDOM()
}

function addSearchEngine (e) {
  if (
    $.trim($('#custom-engine-name').val()) === '' ||
    $.trim($('#custom-engine-url').val()) === ''
  ) {
    return
  }

  const newSearchEngine = {
    id: searchEngines.length + 1,
    name: $('#custom-engine-name').val(),
    url: $('#custome-engine-url').val(),
    isCustom: true
  }
  const element = buildSearchEngineOptionElement(newSearchEngine)
  searchEngines.push(newSearchEngine)
  $('#search-engine-dropdown').append(element)
  $('#search-engine-delete-dropdown').append(element)

  updateSearchEngineDOM()
}

function updateSearchEngineDOM () {
  const customEngines = searchEngines.filter((x) => x.isCustom === true)
  if (customEngines.length === 0) {
    $('#search-engine-delete-dropdown').hide()
    $('#search-engine-delete-button').hide()
    $('#delete-search-engine-span').hide()
  } else {
    $('#search-engine-delete-dropdown').show()
    $('#search-engine-delete-button').show()
    $('#delete-search-engine-span').show()
  }
  if (
    $('#custom-engine-name').val().trim() === '' ||
    $('#custom-engine-url').val().trim() === ''
  ) {
    $('#add-search-engine-button').prop('disabled', true)
  } else {
    $('#add-search-engine-button').prop('disabled', false)
  }
}

function onModalXClick (e) {
  closeModal()
}

function onModalCancelClick (e) {
  $('#modal-button-cancel').blur()
  closeModal()
}

function closeModal () {
  $('#settings-modal').hide()
}

function onModalSaveClick (e) {
  if (currentDialog === '#background-settings-modal') {
    wallpaperSettings.save()
    showSpeechBubble()
    closeModal()
    return
  } else if (currentDialog === '#search-settings-modal') {
    localStorage.setItem('searchengines', JSON.stringify(searchEngines))
    const selectedSearchEngine = searchEngines.find(
      (x) => x.id === Number($('#search-engine-dropdown').val())
    )
    localStorage.setItem(
      'selectedsearchengine',
      JSON.stringify(selectedSearchEngine)
    )
    $('#search-dialog-title').text(selectedSearchEngine.name + ' search...')
    closeModal()
    return
  } else if (currentDialog === '#credits-modal') {
    closeModal()
    $('#modal-button-cancel').show()
    $('#modal-button-save').text('Save')
    return
  }
  $(currentDialog + ' input').each(function () {
    switch (this.type) {
      case 'checkbox':
        localStorage.setItem(this.name, this.checked)
        break
      default:
        localStorage.setItem(this.name, this.value)
        break
    }
  })
  if (currentDialog === '#misc-settings-modal') {
    initializeTopSites()
  }
  showSpeechBubble()
  closeModal()
}

function updateClock () {
  const currentTime = new Date()
  const HourFormat24 = $.parseJSON(localStorage.getItem('24hourformat'))
  const showSeconds = $.parseJSON(localStorage.getItem('showseconds'))
  let currentHours = currentTime.getHours()
  let currentMinutes = currentTime.getMinutes()

  currentMinutes = (currentMinutes < 10 ? '0' : '') + currentMinutes
  let dayTime = ''

  if (!HourFormat24) {
    dayTime = currentHours < 12 ? ' AM' : ' PM'
    currentHours = currentHours > 12 ? currentHours - 12 : currentHours
    currentHours = currentHours === 0 ? 12 : currentHours
  }
  let clockString = currentHours + ':' + currentMinutes
  if (showSeconds) {
    let currentSeconds = currentTime.getSeconds()
    if (currentSeconds < 10) {
      currentSeconds = '0' + currentSeconds
    }
    clockString = clockString + ':' + currentSeconds
  }
  if (!HourFormat24) {
    clockString = clockString + dayTime
  }

  $('.clockText').text(clockString)
}

function initializeSearchEngines () {
  let searchEngines = JSON.parse(localStorage.getItem('searchengines'))
  if (!searchEngines) {
    searchEngines = [
      {
        id: 1,
        name: 'Google',
        url: 'http://www.google.com/search?q=',
        isCustom: false
      },
      {
        id: 2,
        name: 'Yahoo',
        url: 'https://search.yahoo.com/search?p=',
        isCustom: false
      },
      {
        id: 3,
        name: 'Bing',
        url: 'https://www.bing.com/search?q=',
        isCustom: false
      },
      {
        id: 4,
        name: 'DuckDuckGo',
        url: 'https://duckduckgo.com/?q=',
        isCustom: false
      },
      {
        id: 5,
        name: 'Yandex',
        url: 'https://yandex.com/search/?text=',
        isCustom: false
      },
      {
        id: 6,
        name: 'Ecosia',
        url: 'https://www.ecosia.org/search?q=',
        isCustom: false
      }
    ]
    localStorage.setItem('searchengines', JSON.stringify(searchEngines))
  }
  let selectedSearchEngine = JSON.parse(
    localStorage.getItem('selectedsearchengine')
  )
  if (!selectedSearchEngine) {
    // GOOGLE
    selectedSearchEngine = searchEngines.find((x) => x.id === 1)
    localStorage.setItem(
      'selectedsearchengine',
      JSON.stringify(selectedSearchEngine)
    )
  }

  $('#search-dialog-title').text(selectedSearchEngine.name + ' search...')
}

function showSpeechBubble () {
  $('.speech-bubble').fadeIn().delay(3000).fadeOut()
}

$(function () {
  initializeTopSites()
  initializeSearchEngines()
  initializeWallpapers()
  updateClock()
  $(document).on('keydown', function (e) {
    console.log(e.code)
    switch (e.code) {
      case 'Escape': // escape
        closeModal()
        break
    }
  })
  $('.startMenu').hide()
  $('.speech-bubble').hide()
  $('.background').on('click', onBackgroundClick)
  $('#searchbutton').on('click', onSearchButtonClick)
  $('.searchbar').on('keydown', (e) => {
    if (e.code === 'Enter') {
      onSearchButtonClick()
    }
  })
  $('#startButton').on('click', onStartButtonClick)

  $('.menuItem').on('click', onMenuItemClick)
  $('#modal-x-button').on('click', onModalXClick)
  $('#modal-button-cancel').on('click', onModalCancelClick)
  $('#modal-button-save').on('click', onModalSaveClick)
  setInterval(updateClock, 1000)
})
