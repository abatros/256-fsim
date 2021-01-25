import './altimeter.html';
import {Integrator, Cosine, roc, xacc, altimeter} from './app.js';


const TP = Template.altimeter;


const width = 80;
const height = 600;
//const DX = 60; // pixels per division
const DX = 200; // pixels per division
const ND = Math.floor(height/DX) +3; //6;
const DU = 200; // every 200 ft => division (also 100 ft)

// --------------------------------------------------------------------------

TP.helpers({
  data: ()=>{
    const tp = Template.instance();
    const data = tp.data;
    console.log(`helper data [${data.id}] x:${data.x} y:${data.y}`,{data})
    return tp.data;
  },
  style: ()=>{
    return 'position:absolute;'
  }
})

// --------------------------------------------------------------------------


TP.onRendered(function () {
  const svg = d3.select("#svg-altimeter")
    .attr('width',width)
    .attr('height',height)
    .style('background-color', 'lightgreen');

  const g = svg.append('g')

  const vt =[];     // text for FL
  const vt200 =[];  // text for 200 divisions

  for (let j=0; j<ND; j++) {
    // each line
    g.append('rect')
    .attr('x',3)
    .attr('y', j*DX) // 5*20 = 100 ATTENTION.
    .attr('height',2)
    .attr('width',18)

    g.append('rect')
    .attr('x',3)
    .attr('y', j*DX + 0.5*DX) // 5*20 = 100 ATTENTION.
    .attr('height',2)
    .attr('width',10)

    vt[j] = g.append('text')
    .attr('x',45)
    .attr('y', j*DX +6)
    .attr("text-anchor", "end")
    .style("fill", "steelblue")
    .style("font-family","helvetica")
    .style("font-weight","bold")
    .style("font-size","24px")
    .text(`99`);

    vt200[j] = g.append('text')
    .attr('x',45)
    .attr('y', j*DX +6)
    .attr("text-anchor", "start")
    .style("fill", "steelblue")
    .style("font-family","helvetica")
    .style("font-weight","bold")
    .style("font-size","18px")
    .text(`000`);



  } // each


  const rc = g.append('path')
  .attr('stroke','red')
  .attr('stroke-width',3)
  .attr('fill','none')




  function paint_tape() {
    const z = altimeter.y;
//    console.log(`altitude:${z}`,{altimeter})

//    let z_floor = Math.floor(z/DX)*DX; // 1/3 kt !
    let z_floor = Math.floor(z/DU)*DU; // 1/3 kt !

    const nd = Math.ceil((height/2)/DX);

    const dy = -DX + z%DX + (height/2)%DX
    g.attr("transform", `translate(0,${dy})`) // first dash position (<= 0)


    function P1(x) {
      const p1 = Math.floor(x/1000)
      if (p1 == 0) return ''
      return p1
    }
    function P2(x) {
      let p2 = (x%1000)
      if (p2<0) p2 = -p2
      if (p2 == 0) return '000'
      return p2;
    }

    const r = Math.floor(DX/DU);
    for (let j=0; j<ND; j++) {
      if (z>=0)
        vt[j].text(`${P1((Math.floor(z_floor/r) + (nd)*DU - j*DU))}`) // speed
      else {
        if (z%DX ==0) {
          // TRICKY SNEAKY
          vt[j].text(`${P1((Math.floor(z_floor/r) + (nd)*DU - j*DU))}`) // speed
        } else {
          vt[j].text(`${P1((Math.floor(z_floor/r) + (nd+1)*DU - j*DU))}`) // speed
        }
      }

      if (z>=0)
        vt200[j].text(`${P2((Math.floor(z_floor/r) + (nd)*DU - j*DU))}`) // speed
      else {
        if (z%DX ==0) {
          // TRICKY SNEAKY
          vt200[j].text(`${P2((Math.floor(z_floor/r) + (nd)*DU - j*DU))}`) // speed
        } else {
          vt200[j].text(`${P2((Math.floor(z_floor/r) + (nd+1)*DU - j*DU))}`) // speed
        }
      }


    }

    /*
    //const r = 60/200
    for (let j=0; j<ND; j++) {
      if (z>=0)
        vt[j].text(`${(Math.floor(z_floor/30) + (nd)*200 - j*200)}`) // speed
      else {
        if (z%60 ==0) {
          // TRICKY SNEAKY
          vt[j].text(`${(Math.floor(z_floor/30) + (nd)*200 - j*200)}`) // speed
        } else {
          vt[j].text(`${(Math.floor(z_floor/30) + (nd+1)*200 - j*200)}`) // speed
        }
      }
    }
    */
} // paint-tape.


  paint_tape();
  const timer = d3.timer(every_frame);


  function every_frame(etime) {
    try {
//      const rc = roc.v.y;
//      altimeter.x = rc;
//      const dh = altimeter.pulse(1)
//console.log(`altitude`)
      paint_tape()
//      const z = altimeter.y;


    }

    catch(err) {
      console.log({err})
      altimeter.trace(`@239`)
//      timer.stop();
      return;
    }

  }


}) // rendered
