import './roc.html';
import {Integrator, Cosine, roc, xacc} from './app.js';





const TP = Template.ROC
const width = 200;
const height = 300;


TP.onRendered(function () {
  const svg = d3.select("#svg-roc")
    .attr('width',width)
    .attr('height',height)
    .style('background-color', 'lightgreen');

  const g1 = svg.append('g')


  const svg_axes = `M 5 ${height/2}
  L ${width-5} ${height/2}
  M 5 5 L 5 ${height-5}
  `;

  const axes = g1.append('path')
  .attr('stroke','white')
  .attr('stroke-width',2)
  .attr('fill','none')
  .attr('d', svg_axes)



  const p = g1.append('path')
  .attr('stroke','steelblue')
  .attr('stroke-width',2)
  .attr('fill','none')
//  .attr('d', svg_path)

  const thrust = g1.append('path')
  .attr('stroke','red')
  .attr('stroke-width',3)
  .attr('fill','none')


  const text = g1.append('text')
  .attr('x',width-30)
  .attr('y', height/2 + 100)
  .attr("text-anchor", "end")
  .style("fill", "steelblue")
  .style("font-family","helvetica")
  .style("font-weight","bold")
  .style("font-size","10px")
  .text(`ROC`);


  const vario = g1.append('text')
  .attr('x',width-30)
  .attr('y', height/2 + 115)
  .attr("text-anchor", "end")
  .style("fill", "steelblue")
  .style("font-family","helvetica")
  .style("font-weight","bold")
  .style("font-size","10px")
  .text(`R/C`);


  const rc_text = g1.append('text')
  .attr('x',10)
  .attr('y', height/2 + 130)
  .attr("text-anchor", "start")
  .style("fill", "steelblue")
  .style("font-family","helvetica")
  .style("font-weight","bold")
  .style("font-size","10px")
  .text(`R/C`);


  const t1 = d3.timer(every_frame);


  function every_frame(etime) {
    // 1 tick every 17 ms.
//    roc.trace('@70').dt(1);
//    roc.dt(1);
//t1.stop();
//    p.attr('d',`M 5+${etime/100} ${height/2} L 5+${etime/100} ${roc.y.x}`)
//    const xoff = 5+Math.floor(etime/10)%700
    const xoff = 5;
    const path = `M ${xoff} ${height/2} L ${xoff} ${height/2 + 0.7*roc.y.x}
      M ${xoff+5} ${height/2} L ${xoff+5} ${height/2 - 0.5*roc.y.y}
    `;
//    console.log({path})
    p.attr('d',path)
    text.text(`compression: ${roc.y.y}`)
    vario.text(`spring speed: ${roc.v.y}`)
    rc_text.text(`R/C: ${-roc.v.x}`) //

    let tpath = `
      M ${xoff+10} ${height/2} L ${xoff+10} ${height/2 - 0.4*xacc.v.x}
      M ${xoff+20} ${height/2} L ${xoff+20} ${height/2 - 0.4*xacc.v2.y}
      M ${xoff+40} ${height/2} L ${xoff+40} ${height/2 - 0.4*roc.v.x}
      M ${xoff+100} ${height/2} L ${xoff+100} ${height/2 - 0.4*xacc.v2.x}
      M ${xoff+110} ${height/2} L ${xoff+110} ${height/2 - 0.4*xacc.v2.y}
    `;

    tpath = `
      M ${xoff+100} ${height/2} L ${xoff+100} ${height/2 - 0.2*xacc.v2.x}
      M ${xoff+110} ${height/2} L ${xoff+110} ${height/2 - 0.2*xacc.v2.y}
      M ${xoff+110} ${height/2} L ${xoff+110} ${height/2 + 0.2*200}
    `;

    thrust.attr('d', tpath);
  }


});
