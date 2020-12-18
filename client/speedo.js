import './speedo.html';


const TP = Template.speedo

const width = 60;
const height = 800;

// speed range 0-600 increments 10 - numbers on 20
// but our integrator is 0-256 !!!!!!!
// TAKE i.y_

let one_shoot = 0;


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

  const info = d3.select("#info")
      .attr('width',100)
      .attr('height',30)
      .style('background-color', 'lightgreen')
  //    .attr("transform", `translate(100,100)`) // dash position

  const g2 = info.append('g')

  const speed_info = g2.append('text')
  .attr('x',10)
  .attr('y', 20)
  .attr("text-anchor", "start")
  .style("fill", "steelblue")
  .style("font-family","helvetica")
  .style("font-weight","bold")
  .style("font-size","18px")
  .text(`*****`);


  /*********************************
  A BUTTON TO CLICK
  **********************************/


  const bplus = d3.select("body")
      .append('svg')
      .attr('width',200)
      .attr('height',200)
      .style('background-color', 'orange')
      .attr("transform", `translate(300,0)`) // dash position
      .append('g')


  bplus.append('rect')
      .attr('x',50)
      .attr('y', 100) // 5*20 = 100 ATTENTION.
      .attr('height',30)
      .attr('width',40)
      .style("stroke", "red")
      .style("fill", "orange")
      .on('mouseover', function(){
        d3.select(this)
        .style("fill", "lightgreen")
      })
      .on("mouseout", function(){
        d3.select(this)
       .style("fill", "steelblue")
      })
     .on('click', function() {
       d3.select(this)
       .style("fill", "red")
       console.log('click-plus')
       one_shoot = 1;
     })

   bplus.append('text')
     .attr('x',62)
     .attr('y',122)
   //  .attr("text-anchor", "start")
     .style("font-family","helvetica")
     .style("font-weight","bold")
     .style("font-size","28px")
     .style("fill", "white")
     .text('+')



  const bminus = d3.select("body")
     .append('svg')
     .attr('width',200)
     .attr('height',200)
     .style('background-color', 'orange')
     .attr("transform", `translate(300,0)`) // dash position
     .append('g')


  bminus.append('rect')
     .attr('x',50)
     .attr('y', 100) // 5*20 = 100 ATTENTION.
     .attr('height',30)
     .attr('width',40)
     .style("stroke", "blue")
     .style("fill", "orange")
     .on('mouseover', function(){
       d3.select(this)
       .style("fill", "lightgreen")
     })
     .on("mouseout", function(){
       d3.select(this)
      .style("fill", "steelblue")
     })
    .on('click', function() {
      d3.select(this)
      .style("fill", "red")
      console.log('click-minus')
      one_shoot = -1;
    })

  bminus.append('text')
  .attr('x',65)
  .attr('y',122)
//  .attr("text-anchor", "start")
  .style("font-family","helvetica")
  .style("font-weight","bold")
  .style("font-size","28px")
  .style("fill", "white")
  .text('-')


  /*********************************
  speedometer - ruler
  paint the tape.
  **********************************/

  const svg2 = d3.select("#svg")
    .attr('width',width)
    .attr('height',height)
    .style('background-color', 'lightgreen');

  const g1 = svg2.append('g')

  const vt =[];

  for (let j=0; j<ND; j++) {
    // each line
    g1.append('rect')
      .attr('x',38)
      .attr('y', -DV +j*DV) // 5*20 = 100 ATTENTION.
      .attr('height',2)
      .attr('width',10)
  }


  for (let j=0; j<ND; j++) {
    vt[j] = g1.append('text')
      .attr('x',35)
      .attr('y', -DV +j*DV +6)
      .attr("text-anchor", "end")
      .style("fill", "steelblue")
      .style("font-family","helvetica")
      .style("font-weight","bold")
      .style("font-size","18px")
      .text(`${999}`);
  }


  const t1 = d3.timer(every_dt);

  d3.timeout(() => {
    console.log('timeout 2500 ms.')
    //t1.stop()
  }, 3*1000);


  // ----------------------------------------------------------------------------

  function Cosine(K) {
    const i = this;
    i.K =K;
    i.x = 0;
    i.y = K*(K-1);
    return i;
  }


  Cosine.prototype.dt = function(dt) {
    const i = this;
    if (dt>0) {
      i.x += Math.floor(i.y/i.K)
      i.y -= Math.floor(i.x/i.K)
    } else {
      i.y += Math.floor(i.x/i.K)
      i.x -= Math.floor(i.y/i.K)
    }
    return i;
  }

  Cosine.prototype.trace = function() {
    const i = this;
    console.log(`x:${Math.floor(i.x/i.K)} y:${Math.floor(i.y/i.K)}`)
    return i;
  }



  // ----------------------------------------------------------------------------

  let etime=0;
  const a = new Cosine(256);


  svg2.append('rect')
    .style("stroke", "red")
  //  .style("stroke-width", 1)
    .attr("x", 48)
    .attr("y", height/2)
    .attr("width", 10)
    .attr("height",1);

  const line1 = svg2.append('line')
    .style("stroke", "red")
    .style("stroke-width", 1)
    .attr("x1", 60)
    .attr("y1", height/2 - Math.floor(a.x/a.K))
    .attr("x2", 80)
    .attr("y2", height/2 -  Math.floor(a.x/a.K));


  function every_dt() {


    if (one_shoot != 0) {
      a.dt(one_shoot); // dv
      one_shoot = 0
    } else {
      return;
    }


//    a.dt(); // dv
    let v = 3*Math.floor(a.x/(a.K)); // 0-256

    /*
    if (etime%10 == 0) {
      speed_info.text(v)
    }*/


    speed_info.text(v)


    /*
      a.x/256 => [0,256] too small for height 800 px
      a.x/128 => [0,512] +/- => 1024 ok.
    */

//    const v = 2200 + Math.floor(a.x/a.K); // 0-256
//    const vv = 500 + Math.floor(a.x/(a.K/2)); // 0-256
    const vv = 512 + v

    /*
      translate the group by [0 - DV:100] pixels, then print the right numbers
      == translate the GRID
    */


  //  v =0;
    let voff = (height/2)%DV; // WRONG
    // first dash position
    g1.attr("transform", `translate(0,${Math.floor(v/20)*60+ voff})`) // dash position
//    g1.attr("transform", `translate(0,100)`) // dash position

      // for every 20 dy, recompute the numbers on the rule.

//    let zero_ = Math.floor(v/DV) + 20*6;
    let zero_ = Math.floor(v/20)*20 + 20*5; // speed at the first dash.

    console.log(`g.y:${v%DV}`,{zero_},{DV},{ND},{voff},{v})
    for (let j=0; j<ND; j++) {
        //vt[j].text(`${h_*100 - j*100}`)
        vt[j].text(`${(zero_ - j*20)}`) // speed
  //        .style("font-family","helvetica")

      }



    // -----------------------------------------------------------------------
//    t1.stop()

  /*
    if (etime >20) {
      console.log(`stop@108`)
      t1.stop()
    }
    */
    etime += 1; // chaque frame
  }


  function drawPoint(p) {
    ctx.fillRect(p[0],p[1],1,1);
  };


}) // on rendered
