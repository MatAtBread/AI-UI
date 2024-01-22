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
  Define a "Chart" so it is like an image, but with additional attributes called `label`,
  `xData` and `yData`. 

  When these are all set, draw a chart for the data within the image.
  Use opacity to indicate we're loading
*/

const Chart = img.extended({
  override: {
    // Overrides for existing attributes
    style: {
      transition: 'opacity 0.5s',
      opacity: '0.2'
    },
    onload() { this.style.opacity = '1' },
  },
  declare:{
    // New property initialisations
    label: '',
    xData: [] as (string | number)[],
    set yData(d: number[]) {
      if (this.xData && this.label) {
        this.style.opacity = '0.2';
        this.src = `https://quickchart.io/chart?width=${this.width}&height=${this.height}&chart=`
          + encodeURIComponent(JSON.stringify({
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
  declare:{
    showError(f: boolean) {
      (this.style as any).backgroundColor = f ? '#fdd' : '';
    }
  },
  override: {
    placeholder: 'Enter a town...',
    style: {
      display: 'block'
    },
    onkeydown() {
      this.showError(false);
    }
  }
});

const App = div.extended({
  /* The `ids` member defines the *type* of the children of this tag by their id.

  In this case, we declare that anything with the id:'weather' is a Chart tag. This allows
  our IDE to correctly work out what attributes and methods the element supports at run-
  time.

  Note, the `ids` member will appear in the transpiled .js file, but in fact are unused at
  run-time, the declarations merely serve to inform Typescript which ids are which 
  types 
  */
  ids:{
    weather: Chart,
    location: Location
  },
  async constructed() {
    /* When we're constructed, create a Location element and a Chart element.
      We also keep a reference to tha thing we're creating as we're using it in 
      am event handler. This is the common way to do this in DOM code, but is better 
      handled using `when`.
    */

    return [
      Location({
        id: 'location',
        onchange: async () => {
          /* Note: this is the "obvious" way to do this (set the chart when the event
            fires), however AI-UI provides the `when` mechanism to make this much
            simpler and cleaner way, avoiding things like requiring the `app` closure
            which is needed as `this` is hidden by the event handler definition.
            
            However, being just normal DOM elements, we choose to do it the "obvious" way 
            in order introduce new concepts in the appropriate places.
            
            See https://github.com/MatAtBread/AI-UI/blob/main/guide/when.md
          */
          try {
            /* Here we use the `ids` member directly, and VSCode knows that the
            child of the app called `location` is a Location.

            Note that although the type of the child is known, the element might not actually 
            exist in the DOM, so we use the non-null assertion operator (!) as we know (as 
            opposed to testing at run-time) it exists in the case.
            */
            const geo = await getGeoInfo(this.ids.location!.value);
            const forecast = await getWeatherForecast(geo.results[0]);

            
            /* Similarly, `weather` is a Chart */

            this.ids.weather!.label = geo.results[0].name + ', ' + geo.results[0].country;
            this.ids.weather!.xData = forecast.time.map(t => new Date().toDateString());

            /* ...and setting the yData on a Chart will cause it to redraw the chart */
            this.ids.weather!.yData = forecast.temperature_2m_max;
          } catch (ex) {
            this.ids.location!.showError(true);
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
