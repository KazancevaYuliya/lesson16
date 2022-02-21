function fetchDataPromise(url, method = 'GET') {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
  
      xhr.open(method, url)
  
      xhr.onload = () => {
        if (xhr.status == '200') {
          resolve(xhr.response)
        } else {
          reject(xhr.status + ' ' + xhr.statusText)
        }
      }
  
      xhr.onerror = () => {
        reject(xhr.status + ' ' + xhr.statusText)
      }
  
      xhr.send()
    })
  }
  const key = 'a94d0a5ac08570add4b47b8da933f247'
  const urlWetherCurrent = `https://api.openweathermap.org/data/2.5/weather?q=Orsha&appid=${key}`
  const urlWetherByDays = `https://api.openweathermap.org/data/2.5/forecast?q=Orsha&appid=${key}`
  
  const widgetContainerElement = document.querySelector('#widget')
  
  
  class Widget {
    constructor(containerElement, data) {
      this.containerElement = containerElement
      this.data = data
  
      this.render()
    }
  
    get template() { }
  
    render() {
      this.containerElement.insertAdjacentHTML('beforeend', this.template)
    }
  }
  
  class Header extends Widget {
    get template() {
      const resultTemp = Math.round(this.data.temp) > 0 ? '+' + Math.round(this.data.temp) : Math.round(this.data.temp)
      return `
      <div class="header">
      <div class="d-flex flex-column">
      <div class="mb-auto">
        ${this.data.city}, ${this.data.countryCode}
        <br>
        ${this.data.date.getHours()}:${this.data.date.getMinutes()}
      </div>
      <div class="py-5 text-center">
        <img src="${this.data.iconSrc}" alt="">
        <br>
        <strong class="description">${this.data.description}</strong>
        <h2 class="mt-2">${resultTemp} C</h2>
      </div>
      <div class="d-flex">
        <span class="me-auto">${this.data.windDeg}</span>
        <span class="">${this.data.windSpeed} m/s</span>
          </div>
        </div>
      </div>
    `
    }
  }
  function renderHeader(data) {
    widgetContainerElement.innerHTML = headerTemplate(data)
  }
  
  
  
  fetchDataPromise(urlWetherCurrent, 'GET')
    .then((response) => {
      const data = JSON.parse(response)
      const city = data.name
      const windDeg = data.wind.deg
      const windSpeed = data.wind.speed
      const date = new Date(data.dt * 1000)
      const temp = data.main.temp - 273.15
      const countryCode = data.sys.country
      const description = data.weather[0].description
      const iconSrc = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
  
      new Header(
        widgetContainerElement,
        { city, countryCode, date, temp, windDeg, windSpeed, description, iconSrc }
      )
    })
  
  
  class Body extends Widget {
    get template() {
      const items = this.data.map((item) => {
        const [date, iconId, temp] = [new Date(), item.weather[0].icon, item.main.temp]
        const iconSrc = `http://openweathermap.org/img/wn/${iconId}@2x.png`
  
        return this.itemTemplate({ date, iconSrc, temp })
      })
  
      return `
        <div class="widget-body">
          ${items.join(' ')}
        </div>
      `
    }
  
    itemTemplate({ date, iconSrc, temp }) {
  
      return `
      <div class="body">
        <span> ${date}</span>
        <img src="${iconSrc}" alt="">
        <span>${temp}</span>
      </div>
    `
    }
  }
  
  function renderBody(data) {
    widgetContainerElement.innerHTML += widgetBodyTemplate(data)
  }
  
  
  fetchDataPromise(urlWetherByDays, 'GET')
    .then((response) => {
      const data = JSON.parse(response).list
  
      const resultData = data.filter((item, index) => index % 9 == 0)
  
      new Body(widgetContainerElement, resultData)
    })
  
  