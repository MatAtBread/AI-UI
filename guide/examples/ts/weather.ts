import { tag } from '../../../module/esm/ai-ui.js'
//import { tag } from 'https://unpkg.com/@matatbread/ai-ui/esm/ai-ui.js'

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
  Define a "Chart" so it is like an image, but with additional attributes called `label`,
  `xData` and `yData`. 

  When these are all set, draw a chart for the data within the image
*/

const Chart = img.extended({
  prototype: {
    label: '',
    xData: [] as (string | number)[],
    set yData(d: number[]) {
      if (this.xData && this.label) {
        this.src = `https://quickchart.io/chart?width=${this.width}&height=${this.height}&chart=` + encodeURIComponent(JSON.stringify({
          type: 'line',
          data: {
            labels: this.xData,
            datasets: [{
              label: this.label,
              data: d
            }]
          }
        }))
      }
    }
  }
});

/* Define a "Location" element that is like an input tag that defaults to 'block' display style,
  and can indicate errors in a predefined way */
const Location = input.extended({
  prototype: {
    placeholder: 'Enter a town...',
    style: {
      display: 'block'
    },
    showError(f: boolean) {
      (this.style as any).backgroundColor = f ? '#fdd' : '';
    },
    onkeydown() {
      this.showError(false);
    }

  }
});

const App = div.extended({
  ids:{
    weather: Chart
  },
  async constructed() {
    /* When we're constructed, create a few children within the element by default.
      We also keep a reference to tha thing we're creating as we're using it in 
      am event handler. This is the common way to do this in DOM code, but is better 
      handled using `when`.
    */
    const app = this;
    return [
      Location({
        async onblur(e) {
          /* Note: this is the "obvious" way to do this (set the chart when the event
            fires), however AI-UI provides the `when` mechanism to make this much
            simpler, cleaner, type-safe and, most usefully, separating the data & events from
            the UI and layout, so that our "Location" tag doesn't have to ASSUME the 
            nextElementSibling is a Chart. 
            
            However, being just normal DOM elements, we choose to do it the "obvious" way 
            to introduce new concepts in an appropriate place.
            
            See https://github.com/MatAtBread/AI-UI/blob/main/guide/when.md
          */
          try {
            const geo = await getGeoInfo(this.value);
            const forecast = await getWeatherForecast(geo.results[0]);

            app.ids.weather!.label = geo.results[0].name;
            app.ids.weather!.xData = forecast.time.map(t => new Date().toDateString());
            app.ids.weather!.yData = forecast.temperature_2m_max;
          } catch (ex) {
            this.showError(true);
          }
        }
      }),
      Chart({
        id: 'weather',
        width: 600,
        height: 400
      })
    ]
  }
});

/* Create and add the "App" element to the document so the user can see it! */
document.body.appendChild(App());
