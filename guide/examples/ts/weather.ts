import { tag } from '../../../module/esm/ai-ui.js'
//import { tag } from 'https://unpkg.com/@matatbread/ai-ui/esm/ai-ui.js'

const { h2, div, button, select, option, img } = tag();

/* Uses: 
  Geocoding: https://geocoding-api.open-meteo.com/v1/search?name=Berlin&count=1&language=en&format=json
  Weather: https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m
*/

const Chart = img.extended({
  constructed() {
  },
  prototype: {
    label: '',
    x: [] as number[],
    set y(d: number[]) {
      this.src = "https://quickchart.io/chart?width=300&height=200&chart="+encodeURIComponent(JSON.stringify({
        type:'bar',
        data:{
          labels: this.x,
          datasets: [{
            label: this.label,
            data: d
          }]
      }
    }))
  }
  }
})

function sleep(seconds: number) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function *synthData() {
  while (true) {
    yield [Math.random(),Math.random(),Math.random(),Math.random(),Math.random()]
    await sleep(3);
  }
}

const App = div.extended({
  async constructed() {
    // When we're constructed, create a few children within the element by default */
    return [
      Chart({
        label: 'Test',
        x: [1,2,3,4,5],
        y: [9,4,7,2,3]//synthData()
      })
    ]
  }
});

/* Create and add an "App" element to the document so the user can see it! */
document.body.appendChild(App());
