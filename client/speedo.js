import './speedo.html';
import {Integrator, Cosine, xacc, roc} from './app.js';

const TP = Template.speedo

const width = 60;
const height = 800;

// speed range 0-600 increments 10 - numbers on 20
// but our integrator is 0-256 !!!!!!!
// TAKE i.y_

let one_shoot = 0;
const step = false;


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

  const width =60;
  const height = 512; //800;
  const DV = 60;
  const ND = Math.floor(height/DV) +3; //6;
  const DS = 20; // delta speed

  console.log({ND})

  /*********************************
  INFO : digital display for speed.
  **********************************/

  const info = d3.select("#info-speedo")
      .attr('width',100)
      .attr('height',30)
      .style('background-color', 'lightgreen')
  //    .attr("transform", `translate(100,100)`) // dash position

  const g2 = info.append('g')

  const speed_info = g2.append('text')
  .attr('x',10)
  .attr('y', DS)
  .attr("text-anchor", "start")
  .style("fill", "steelblue")
  .style("font-family","helvetica")
  .style("font-weight","bold")
  .style("font-size","18px")
  .text(`*****`);


  /*********************************
  A BUTTON TO CLICK
  **********************************/


/*
  .on('click', function() {
          d3.select(this)
          .style("fill", "red")
          console.log('click-stop')
          t1.stop();
        })
*/

  /*********************************
  speedometer - ruler
  paint the tape.
  **********************************/

  const svg2 = d3.select("#svg-speedo")
    .attr('width',width)
    .attr('height',height)
    .style('background-color', 'lightgreen');

  const g1 = svg2.append('g')

  const vt =[];

  for (let j=0; j<ND; j++) {
    // each line
    g1.append('rect')
      .attr('x',38)
      .attr('y', j*DV) // 5*20 = 100 ATTENTION.
      .attr('height',2)
      .attr('width',18)

    g1.append('rect')
      .attr('x',46)
      .attr('y', j*DV + 0.5*DV) // 5*20 = 100 ATTENTION.
      .attr('height',2)
      .attr('width',10)

  }


  for (let j=0; j<ND; j++) {
    vt[j] = g1.append('text')
      .attr('x',35)
      .attr('y', j*DV +6)
      .attr("text-anchor", "end")
      .style("fill", "steelblue")
      .style("font-family","helvetica")
      .style("font-weight","bold")
      .style("font-size","18px")
      .text(`${999}`);
  }





  // ----------------------------------------------------------------------------




  // ----------------------------------------------------------------------------

  let nframes=0;



  svg2.append('rect')
    .style("fill", "red")
  //  .style("stroke-width", 1)
    .attr("x", 49)
    .attr("y", height/2)
    .attr("width", 10)
    .attr("height",2);

    /*
  const line1 = svg2.append('line')
    .style("stroke", "red")
    .style("stroke-width", 1)
    .attr("x1", 60)
    .attr("y1", height/2 - Math.floor(a.x/a.K))
    .attr("x2", 80)
    .attr("y2", height/2 -  Math.floor(a.x/a.K));
    */


  let average_etime =0;
  let _atime_ =0;
  xacc.v.x = 0.5*xacc.v.K; // initial acceleration from THRUST.

  function every_frame(_atime) {

    const stime = new Date().getTime();
    _etime = _atime-_atime_;
    average_etime = (4*average_etime + 6*_etime)/10
    _atime_ = _atime;
//    console.log({_etime},{average_etime})


    /*
    if (bStop.click_Count%2 ==0) {
      return;
    }*/

    roc.Lift = xacc.v2.y

    /*
    try {
      const dv = xacc.pulse();
      if (dv) {
        // changed
    //    roc.x -= xacc.v2.dy // Lift.
        roc.Lift = xacc.v2.y
      }
    }

    catch(err) {
      console.log({err})
      xacc.trace(`@239`)
      t1.stop();
      return;
    }*/


    const v = xacc.v.y; // 1/3 kt == pixels


    speed_info.text(Math.floor(v/3))

    // from here we can compute in pixels
    let v_floor = Math.floor(v/60)*60; // 1/3 kt !

    const nd = Math.ceil((height/2)/60);

    const dy = -60 + v%60 + (height/2)%60
    g1.attr("transform", `translate(0,${dy})`) // first dash position (<= 0)


    if (step) {
      console.log(`V:${Math.floor(v/3)}`,{v},{v_floor})
    }




    const r = Math.floor(DV/DS);
    for (let j=0; j<ND; j++) {
      if (v>=0)
        vt[j].text(`${(Math.floor(v_floor/r) + (nd)*DS - j*DS)}`) // speed
      else {
        if (v%60 ==0) {
          // TRICKY SNEAKY
          vt[j].text(`${(Math.floor(v_floor/r) + (nd)*DS - j*DS)}`) // speed
        } else {
          vt[j].text(`${(Math.floor(v_floor/r) + (nd+1)*DS - j*DS)}`) // speed
        }
      }
    }


    const text0 = Math.floor((v_floor)/3) +nd*DS; // speed at first tick.




    if ( v == -60) {
//      t1.stop()

    }


    // -----------------------------------------------------------------------
//    t1.stop()

    if (!step && (nframes > 600*(1000/17))) {
      console.log(`stop@108`)
      t1.stop()
    }
    nframes += 1; // chaque frame ~~ 17 ms. NFRAMES
    const pTime = new Date().getTime() - stime;
    //console.log({nframes},{_atime},{_etime},{average_etime},{pTime})
    if (pTime >=15) {
      console.log(`ALERT OVERHEAT COMPUTER  p-Time : ${pTime}`)
      t1.stop();
    }
  } // every_frame


  const t1 = d3.timer(every_frame);

  d3.timeout(() => {
    console.log('timeout 2500 ms.')
    //t1.stop()
  }, 60*1000);


  function drawPoint(p) {
    ctx.fillRect(p[0],p[1],1,1);
  };


}) // on rendered
