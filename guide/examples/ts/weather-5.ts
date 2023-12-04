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
  prototype: {
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

/* Define a weather-specific Chart. It's like a chart, but exposes a `geo` attribute
that when set, fetches and displays the weather forecast for that location */
const WeatherForecast = Chart.extended({
  declare:{
    // New property initialisations
    set geo(g: GeoInfo | undefined) {
      /* Note: we can't use `await` here as setters can't be generators or otherwise 
        interrupt the execution of their caller, so we fall back to .then() */
      this.style.opacity = '0.2';
      if (g) {
        getWeatherForecast(g).then(forecast => {
          this.label = g.name + ', ' + g.country;
          this.xData = forecast.time.map(t => new Date(t * 1000).toDateString());

          /* ...and setting the yData on a Chart will cause it to redraw */
          this.yData = forecast.temperature_2m_max;
        });
      }
    }
  }
});
/* Define a "Location" element that is like an input tag that defaults to 'block' display style,
  and can indicate errors in a predefined way.

  In this revision of the code, we place the `onchange` within the context of the "Location" tag. It
  is now the responsibility of this tag to resolve the name into GeoInfo, and expose that via a new
  `geo` property. When the property is set, we dispatch a `change` event to indicate that the asynchronous
  resolution of the fetch.

  Additionally, this allows us to localise the error handling - the indication of the error no longer
  leaks out to become the responsibility of the element containing the Location. The tag is now responsible
  for handling input, asynchronous resolution and error handling without external knowledge of where it
  is contained within the DOM, and without the rest of the DOM knowing about it's internals.
*/
const Location = input.extended((inst:{ geo?: GeoInfo }) => ({
  declare: {
    get geo() { return this.resolveGeo() },

    /* We use this "internal" method as getters can't be declared async, and we
    want to use async/await, and TypeScript doesm't respect `ThisType` for getters/setters
    */
    async resolveGeo() {
      try {
        const g = await getGeoInfo(this.value);
        if (!inst.geo || g?.results[0].id !== inst.geo.id) {
          inst.geo = g?.results[0];
        }
        return inst.geo;
      } catch (ex) {
        this.style.backgroundColor = '#fdd';
      }
    },
  },
  prototype: {
    // Overrides for existing attributes
    placeholder: 'Enter a town...',
    style: {
      display: 'block',
      backgroundColor: ''
    },
    onkeydown(e) {
      this.style.backgroundColor = '';
    }
  }
}));

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
    location: Location
  },
  constructed() {
    /* When we're constructed, create a Location element and a Chart element.
      By using `this.when()`, we can specify the layout of our page without polluting
      it with events and references, simply making the WaetherForecase's geo attribute
      depend on 'locations's' geo attribute.
    */
    return [
      Location({ id: 'location' }),
      WeatherForecast({
        width: 600,
        height: 400,
        geo: this.when('#location').map(e => this.ids.location!.geo),
      })
    ]
  }
});

/* Create and add the "App" element to the document so the user can see it! */
document.body.appendChild(App());
