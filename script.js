for (let i = 0; i < 5; i++) {
  const codeblock = document.querySelector('.dayhrs')
  const cloneBlock = codeblock.cloneNode(true)
  const parentContainer = document.querySelector('.today-forcast')
  parentContainer.appendChild(cloneBlock)
}

for (let i = 0; i < 6; i++) {
  const codeblock = document.querySelector('.prev-days div')
  const cloneBlock = codeblock.cloneNode(true)
  const parentContainer = document.querySelector('.prev-days')
  parentContainer.appendChild(cloneBlock)
}

for (let i = 1; i < 7; i++) {
  const codeblock = document.querySelector('.days-date')
  const cloneBlock = codeblock.cloneNode(true)
  const parentContainer = document.querySelector('.weather-forcast')
  parentContainer.appendChild(cloneBlock)
}

const apiKey = 'd90de50482114c8e8ea230654262802' // gitleaks:allow
const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=`
const temp = document.querySelector('#temp-celcius')
const searchBox = document.querySelector('#search')
const searchBtn = document.querySelector('#search-button')

fetch('https://ipapi.co/json/')
  .then(response => response.json())
  .then(data => {
    checkWeather(data.city)
  })
  .catch(error => console.error('Error:', error))

async function checkWeather (city) {
  try {
    const response = await fetch(apiUrl + city)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    console.log(data)
    document.querySelector('.location').innerHTML = data.location.name + ',  ' + data.location.country + ' &#x276F;'
    temp.innerHTML = data.current.temp_c.toFixed(1) + ' <sup>o</sup>C'
    document.querySelector('#description').innerHTML = data.current.condition.text
    document.querySelector('#date').innerHTML = data.current.last_updated
    document.querySelector('#today').innerHTML = new Date().toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
    document.querySelector('#pressure-mb').innerHTML = data.current.pressure_mb + 'mb'
    document.querySelector('#precip-mm').innerHTML = data.current.precip_mm + 'mm'
    document.querySelector('#humidity').innerHTML = data.current.humidity + '%'
    document.querySelector('#wind-mph').innerHTML = (data.current.wind_mph * 1.609).toFixed(1) + 'km/h'
    document.querySelector('#weatherimg').src = `http:${data.current.condition.icon}`

    const days = document.querySelectorAll('.time-date')
    const tempIn = document.querySelectorAll('.temp')
    const dayImg = document.querySelectorAll('.daysimgs')
    const baseUrl = `https://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${city}&dt=`

    function getLast7Dates () {
      const dates = []
      for (let i = 1; i <= 7; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        dates.push(date.toISOString().split('T')[0])
      }
      return dates
    }

    function formatDate (dateStr) {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }

    async function fetchLast7DaysWeather () {
      const dates = getLast7Dates()
      const requests = dates.map(date =>
        fetch(baseUrl + date).then(res => res.json())
      )

      const results = await Promise.all(requests)

      const weatherData = results.map(day => {
        const forecast = day.forecast.forecastday[0]

        return {
          date: formatDate(forecast.date),
          temp: Math.round(forecast.day.avgtemp_c),
          icon: 'https:' + forecast.day.condition.icon,
          condition: forecast.day.condition.text
        }
      })

      for (let i = 0; i < 7; i++) {
        days[i].innerHTML = weatherData[i].date
        tempIn[i].innerHTML = weatherData[i].temp + '°C'
        dayImg[i].src = weatherData[i].icon
      }
      days[0].innerHTML = 'Y\'day'
      console.log(weatherData)
      return weatherData
    }
    fetchLast7DaysWeather()

    const lastHrs = (new Date(data.current.last_updated)).getHours()
    console.log('This is the last update hour:', lastHrs)
    const todayTimes = document.querySelectorAll('.hrs-time')
    const todayTemps = document.querySelectorAll('.hrs-temp')
    const todayImgs = document.querySelectorAll('.todayimgs')
    const forecastBaseUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7&aqi=yes&alerts=no`

    async function todayForecast () {
      const response3 = await fetch(forecastBaseUrl)
      const data3 = await response3.json()
      console.log(data3)
      const todayforecst = data3.forecast.forecastday[0]
      let counter = 0
      let forwardCounter = lastHrs + 1
      for (let i = 0; i < 6; i++) {
        if (forwardCounter >= 23) {
          if (forwardCounter === 23) {
            forwardCounter = 23
          } else {
            forwardCounter = 0
          }
        }
        const newTime = new Date(todayforecst.hour[forwardCounter].time).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
        todayTimes[counter].innerHTML = newTime
        todayImgs[counter].src = 'https:' + todayforecst.hour[forwardCounter].condition.icon
        todayTemps[counter].innerHTML = todayforecst.hour[forwardCounter].temp_c + '°C'
        console.log(todayTemps[counter])
        counter++
        forwardCounter += 2
      }
    }
    todayForecast()

    const nextDays = document.querySelectorAll('.day')
    const nextDaysImgs = document.querySelectorAll('.nextdayimg')
    const nextDaysHdty = document.querySelectorAll('.humidties')
    const nextDaysTemp = document.querySelectorAll('.temp-days')

    async function fetchNext7DaysWeather () {
      const response4 = await fetch(forecastBaseUrl)
      const data4 = await response4.json()
      for (let i = 0; i < 7; i++) {
        const date = (new Date(data4.forecast.forecastday[i].date)).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit'
        })
        nextDays[i].innerHTML = date
        nextDaysImgs[i].src = 'https:' + data4.forecast.forecastday[i].day.condition.icon
        nextDaysHdty[i].innerHTML = data4.forecast.forecastday[i].day.avghumidity + '%'
        nextDaysTemp[i].innerHTML = data4.forecast.forecastday[i].day.avgtemp_c + '°C'
      }
    }
    fetchNext7DaysWeather()

    if (data.current.temp_c > -5 && data.current.temp_c < 2) {
      document.body.style.backgroundImage = 'url("assets/bgimage.png")'
    } else if (data.current.temp_c > 2 && data.current.temp_c < 14) {
      document.body.style.backgroundImage = 'url("assets/bgweather.png")'
    } else if (data.current.temp_c > 28 && data.current.temp_c < 34) {
      document.body.style.backgroundImage = 'url("assets/normalweatherimg.jpg")'
    } else if (data.current.temp_c > 34 && data.current.temp_c < 40) {
      document.body.style.backgroundImage = 'url("assets/bgsun.png")'
    } else {
      document.body.style.backgroundImage = 'url("assets/naturalsun.jpg")'
    }
    const night = (new Date(data.current.last_updated)).getHours()
    if ((night > 18 && night <= 23) || (night >= 0 && night < 6)) {
      const r = Math.floor(Math.random() * 6) + 1
      document.body.style.backgroundImage = `url('assets/night${r}.jpeg')`
    }
    if (data.current.precip_mm > 0) {
      document.body.style.backgroundImage = 'url("assets/rain .gif")'
    }
    if (data.current.precip_mm > 0 && data.current.temp_c < -1) {
      document.body.style.backgroundImage = 'url("assets/snowing.gif")'
    }
    if (data.current.temp_c < -4) {
      document.body.style.backgroundImage = 'url("assets/snow.gif")'
    }
    if (data.current.precip_mm > 3) {
      document.body.style.backgroundImage = 'url("assets/rainingex.gif")'
    }
  } catch (error) {
    alert('Failed to fetch weather data due to wrong city name:', error)
  }
}

searchBtn.addEventListener('click', () => {
  checkWeather(searchBox.value)
})

searchBox.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    checkWeather(searchBox.value)
  }
})
