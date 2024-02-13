import { tag } from '../../../module/esm/ai-ui.js' // 'https://unpkg.com/@matatbread/ai-ui/esm/ai-ui.js'

const { div, img, input } = tag();

/* With thanks to https://open-meteo.com/
  Geocoding: https://geocoding-api.open-meteo.com/v1/search?name=Berlin&count=1&language=en&format=json
  Weather: https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m
*/

interface GeoInfo {
  id: number,
  name: string,
  latitude: number,
  longitude: number,
  elevation: number,
  country_code: string,
  timezone: `${string}/${string}`,
  population: number,
  country: string,
}

interface GeoInfoResponse {
  results: GeoInfo[]
}

interface Forecast {
  temperature_2m_max: number[]
  time: number[]
}

async function getGeoInfo(s: string): Promise<GeoInfoResponse> {
  return fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(s)}&count=1&language=en&format=json`)
    .then(res => res.json())
}

async function getWeatherForecast(g: GeoInfo): Promise<Forecast> {
  return fetch(`https://api.open-meteo.com/v1/forecast?forecast_days=16&timezone=${encodeURIComponent(g.timezone)}&latitude=${g.latitude}&longitude=${g.longitude}&daily=temperature_2m_max&timeformat=unixtime&format=json`)
    .then(res => res.json())
    .then(obj => obj.daily)
}

/* 
  Define a "Chart" so it is like an image, but with additional attributes called `label` and `data`.

  When `data` is set, draw a chart for the data within the image.
  Use opacity to indicate we're loading.
*/

const Chart = img.extended({
  override: {
    style: {
      transition: 'opacity 0.5s',
      opacity: '0.2'
    },
    onload() { this.style.opacity = '1' },
  },
  declare: {
    label: '',
    set data([xData, yData]: [(string | number)[], number[]]) {
      this.style.opacity = '0.2';
      this.src = `https://quickchart.io/chart?width=${this.width}&height=${this.height}&chart=`
        + encodeURIComponent(JSON.stringify({
          type: 'line',
          data: {
            labels: xData,
            datasets: [{
              label: this.label,
              data: yData
            }]
          }
        }))
    }
  }
});

/* Define a weather-specific Chart. It's like a chart, but exposes a `geo` attribute
that when set, fetches and displays the weather forecast for the specified GeoInfo */
const WeatherForecast = Chart.extended({
  declare: {
    // New property initialisations
    set geo(g: GeoInfo | undefined) {
      this.style.opacity = '0.2';
      if (g) {
        /* Note: we can't use `await` here as setters can't be generators or otherwise 
          interrupt the execution of their caller, so we fall back to .then() */
        getWeatherForecast(g).then(forecast => {
          this.label = g.name + ', ' + g.country;
          /* setting the data on a Chart will cause it to redraw */
          this.data = [
            forecast.time.map(t => new Date(t * 1000).toDateString()),
            forecast.temperature_2m_max
          ];
        });
      }
    }
  }
});
/* Define a "Location" element that is like an input tag that defaults to 'block' display style,
  and can indicate errors in a predefined way.

  In this revision of the code, we expose the GeoInfo as an AsyncIterable, by mapping the location
  string (the input.value) via the GeoInfo API call.

  Additionally, this allows us to localise the error handling - the indication of the error no longer
  leaks out to become the responsibility of the element containing the Location. The tag is now responsible
  for handling input, asynchronous resolution and error handling without external knowledge of where it
  is contained within the DOM, and without the rest of the DOM knowing about it's internals.
*/
const Location = input.extended({
  declare: {
    geo() {
      return this.when('change').map(_ => {
        this.disabled = true;
        return getGeoInfo(this.value).then(g => {
          const lastGeo = g?.results?.[0];
          this.style.backgroundColor = lastGeo ? '' : '#fdd';
          return lastGeo;
        }).finally(() => this.disabled = false);
      })
    }
  },
  override: {
    placeholder: 'Enter a town...',
    style: {
      display: 'block',
      backgroundColor: ''
    },
    onkeydown() {
      this.style.backgroundColor = '';
    }
  }
});

const App = div.extended({
  constructed() {
    /* When we're constructed, create a Location element and a WeatherForecast element.
      The WeatherForecast is a Chart plus a `geo` attribute that is updated automatically
      from the Location.geo AsyncIterable.
    */
    const location = Location();
    return [
      location,
      WeatherForecast({
        width: 600,
        height: 400,
        geo: location.geo(),
      })
    ]
  }
});

/* Create and add the "App" element to the document so the user can see it! */
document.body.appendChild(App());
