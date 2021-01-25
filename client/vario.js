import './vario.html';
import {Integrator, Cosine, roc, xacc, altimeter} from './app.js';


const TP = Template.vario;


const width = 60;
const height = 600;
//const PPD = 80; // pixels per division
//const ND = Math.floor(height/PPD) +3; //6;
const DS = 200; // every 200 ft => division (also 100 ft)


const voffset = 0;

TP.onRendered(function () {
  let rc = 0;


  const svg = d3.select("#svg-vario")
    .attr('width',width)
    .attr('height',height)
    .style('background-color', 'rgb(120,120,120)');

  const g = svg.append('g')


  function dash(y,s) {
    const K = 1000*1000;
  //  const y_ = Math.cbrt(K*y)
    const y_ = 0.32*height*Math.atan(y)
    svg.append('rect')
      .style("stroke", "white")
    //  .style("stroke-width", 1)
      .attr("x", 20)
      .attr("y", height/2 + voffset + y_)
      .attr("width", 6)
      .attr("height",1)

    if (s) {
      svg.append('text')
        .attr('x', 4)
        .attr("y", height/2 + voffset+ y_ +6)
        .attr("text-anchor", "start")
        .style("fill", "white")
        .style("font-family","helvetica")
        .style("font-weight","bold")
        .style("font-size","16px")
        .text(s);
    }

  }

  svg.append('rect')
    .style("stroke", "red")
  //  .style("stroke-width", 1)
    .attr("x", 38)
    .attr("y", height/2 + voffset)
    .attr("width", 10)
    .attr("height",1)
    .style("color",'white');

  dash(0)

  dash(0)
  dash(0.5)
  dash(1,'1')
  dash(1.5)
  dash(2,"2")
  dash(3,'3')
  dash(4)
  dash(5)
  dash(6,"6")

  dash(-0.5)
  dash(-1,'1')
  dash(-1.5)
  dash(-2,"2")
  dash(-3,'3')
  dash(-4)
  dash(-5)
  dash(-6,"6")


  const needle = svg.append('line')
    .attr('x1',250)
    .attr('y1',height/2)
    .style("stroke", "white")
    .style("stroke-width", 2)
    .attr("x2", 30)
//    .attr("y2", height/2+ 0 - height*Math.atan(10));
    .attr("y2", height/2 - rc);

  const rate = svg.append('text')
    .attr('x', 5)
    .attr('y', height + voffset +20)
    .attr("text-anchor", "start")
    .style("fill", "white")
    .style("font-family","helvetica")
    .style("font-weight","bold")
    .style("font-size","22px")
    .text(`0000`);


  const timer = d3.timer(every_frame);


  function every_frame(etime) {
    try {
      const Lift = xacc.v2.y;
      const Weight = 200;
      rc = Lift - Weight
      needle.attr("y2", height/2 - rc);

    }

    catch(err) {
      console.log({err})
      vario.trace(`@239`)
      timer.stop();
      return;
    }

  }


})
