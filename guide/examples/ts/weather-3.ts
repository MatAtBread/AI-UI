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
  declare: {
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

/* Define a weather-specific Chart. It's like a chart, but exposes a `geo` attribute
that when set, fetches and displays the weather forecast for that location */
const WeatherForecast = Chart.extended({
  declare:{
    set geo(g: GeoInfo) {
      /* Note: we can't use `await` here as setters can return values (even Promises) */
      getWeatherForecast(g).then(forecast => {
        this.label = g.name + ', ' + g.country;
        this.xData = forecast.time.map(t => new Date().toDateString());

        /* ...and setting the yData on a Chart will cause it to redraw the chart */
        this.yData = forecast.temperature_2m_max;
      });
    }
  }
})
/* Define a "Location" element that is like an input tag that defaults to 'block' display style,
  and can indicate errors in a predefined way.

  In this revision of the code, we place the `onblur` within the context of the "Location" tag. It
  is now the responsibility of this tag to resolve the name into GeoInfo, and expose that via a new
  `geo` property. When the property is set, we dispatch a `change` event to indicate that the asynchronous
  resolution of the fetch.

  Additionally, this allows us to localise the error handling - the indication of the error no longer
  leaks out to become the responsibility of the element containing the Location. The tag is now responsible
  for handling input, asynchronous resolution and error handling without external knowledge of where it
  is contained within the DOM, and without the rest of the DOM knowing about it's internals.
*/
const Location = input.extended({
  declare:{
    geo: null as null | GeoInfo
  },
  override: {
    placeholder: 'Enter a town...',
    style: {
      display: 'block',
      backgroundColor: ''
    },
    onkeydown() {
      this.style.backgroundColor = '';
    },
    async onblur() {
      try {
        const g = await getGeoInfo(this.value);
        this.geo = g?.results[0];
        this.dispatchEvent(new Event('change'));
      } catch (ex) {
        this.style.backgroundColor = '#fdd';
      }
    }
  },
  constructed() {
    /* This is a bit of nastiness. Because we dispatch the 'change' event when the geo is 
     resolved asynchronously, we need to consume the "normal" <input> change event so
     anything that is listening to the change event doesn't get two - one for the text change
     and one for the geo change.

     Alternatives to this technique are to use a different (custom) event name, but in keeping
     with the concept of treating "Location" as a specialised <input>, it is better to have 
     identical interfaces, including event interfaces*/
    this.addEventListener('change', (e) => {
      if (e.isTrusted) e.stopImmediatePropagation();
    }, {
      capture: true
    })
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
    weather: WeatherForecast,
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
        onchange:async () => {
          /* Since the error detection and UI is now handled by the Location tag, we no
          longer need an exception handler here. The "Location" tag will only emit a change
          event when it has geo data, and the weather forecast deals with it's own rendering
          
          Our Location and WeatherForecast tags now encapsulate their own asynchronous\
          logic for handling input, IO and UI, so we can set the value of the Location.geo
          on the WaetherForecast.geo */
          this.ids.weather!.geo = this.ids.location!.geo!;
        }
      }),
      WeatherForecast({
        id: 'weather',
        width: 600,
        height: 400
      })
    ]
  }
});

/* Create and add the "App" element to the document so the user can see it! */
document.body.appendChild(App());
