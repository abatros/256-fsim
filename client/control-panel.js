import './control-panel.html';
import {Integrator, Cosine, roc, xacc, altimeter} from './app.js';


const TP = Template.control_panel;


const width = 600;
const height = 600;

TP.onRendered(function () {
  const tp = this;
  const data = tp.data


  /*
  return;
  const svg = d3.select("#control-panel")
  .attr('width',width)
  .attr('height',height)
  .style('background-color', 'none');

  console.log(`control-panel onRendered `,{svg},{data})


  const g = svg.append('g')
  */
})
