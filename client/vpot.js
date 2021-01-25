import './vpot.html';
import {Integrator, Cosine, roc, xacc, altimeter} from './app.js';


const TP = Template.vpot;


//const width = 60;
//const height = 512;

TP.helpers({
  data() {
    const tp = Template.instance();
    const data = tp.data;
    console.log(`helper data [${data.name}] x:${data.x}`,{data})
    return tp.data;
  }
})

TP.onCreated(function () {
  const tp = this;
  const {x=0, y=0, wd=60, ht=512, bColor='lightgreen'} = this.data; // not tp.data

})

const vstep = 20;
const yoffset = 10;




TP.onRendered(function () {
  const tp = this;
  const data = this.data; // funny !
  const {id="vpot", x=0, y=0, wd=60, ht=512, bColor='lightgreen'} = this.data; // not tp.data

  console.log(`vpot onRendered `,{data})
  const svg = d3.select(`#${id}`)
  .attr('width',wd)
  .attr('height',ht+2*yoffset)
//  .style('fill', 'red');


function mouseWheelHandler(e) {

	// cross-browser wheel delta
	var e = window.event || e; // old IE support
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
  console.log(`mousewheel [${id}] delta:${delta}`)

//  myimage.style.width = Math.max(50, Math.min(800, myimage.width + (30 * delta))) + "px";

  return false;
  }


// select elements
//  const elements = Array.from(document.querySelectorAll(`#${tp.id}`));
const elements = Array.from(document.querySelectorAll(`#${id}`));

if( (/Firefox/i.test(navigator.userAgent)) ) {
    elements[0].addEventListener("DOMMouseScroll", mouseWheelHandler, false);
} else {
    elements[0].addEventListener("mousewheel", mouseWheelHandler, false);
}

  const g = svg.append('g')
//  .attr('transform',`translate(${x},0)`)


  /***********************************
  background
  ************************************/

  g.append('rect')
  .style('fill', 'rgb(180,180,180)')
  .attr('x', 0)
  .attr('y', 0) // 5*20 = 100 ATTENTION.
  .attr('height', ht +2*yoffset)
  .attr('width', wd-20)



  console.log(`vpot onRendered `,{svg},{data})


  /***********************************
  the ruler :
  this should be static in a canvas.
  ************************************/


  for (let y=0; y <= ht; y += vstep) {
    // each line
    g.append('rect')
    .attr('x', 25)
    .attr('y', yoffset+y) // 5*20 = 100 ATTENTION.
    .attr('height',1)
    .attr('width',7)

    g.append('text')
    .attr('x', 20)
    .attr('y', yoffset+y +4)
    .attr("text-anchor", "end")
    .style("fill", "rgb(60,60,60)")
    .style("font-family","helvetica")
    .style("font-weight","bold")
    .style("font-size","10px")
    .text(`${y}`);
  }


  /****************************************************
  the BUG : yoffset - reactive var
  *****************************************************/

  let yc = 200;
  const cwd=30, cht=20;

  const xpos = 28;
  /*
  const c_path_Obsolete = `
    M ${xpos} ${yoffset+yc}
    L ${xpos+10} ${yoffset+yc-10}
    L ${xpos+25} ${yoffset+yc-10}
    L ${xpos+25} ${yoffset+yc+10}
    L ${xpos+10} ${yoffset+yc+10}
    L ${xpos} ${yoffset+yc}
  `; */

  const c_path = `
    M ${xpos} 0
    L ${xpos+10} -15
    L ${xpos+30} -15
    L ${xpos+30} +15
    L ${xpos+10} +15
    L ${xpos} 0
  `;

  const gCursor = g.append('g')
  .attr('transform',`translate(0, ${yoffset+200})`)

  gCursor.append('text')
  .style('fill', 'white')
  .attr('x', 55)
  .attr('y', 4) // 5*20 = 100 ATTENTION.
  .attr("text-anchor", "end")
//  .style("fill", "steelblue")
  .style("font-family","helvetica")
  .style("font-weight","bold")
  .style("font-size","12px")
  .text('200')

  const cursor = gCursor.append('path')
  .attr('stroke','white')
  .attr('stroke-width',2)
  .attr('fill','none')
  .attr('d',c_path)

  /*
  .on('mouseover', function(){
    console.log('mouseover')
  })
  .on('drag', function(d) {
    const g = this;
    console.log({g})
  })
  .on('drag', function(d) {
    const g = this;
    console.log({g})
  })*/



  const drag_Handler = d3.drag()
//    .origin(cursor)

  drag_Handler
  .on("drag", function(d,i){
    const g = this
    // console.log(`dragging @117 g.y:${g.y} dy:${d3.event.dy}`,{g},{i})


		g.y = (g.y !== undefined)? g.y : 200;

//		this.x += d3.event.dx;
		g.y += d3.event.dy;
    if (g.y <0) g.y =0;
    if (g.y >512) g.y =512;

    const x = d3.select(this)
    .attr('transform',`translate(0, ${yoffset + g.y})`)

    // d3.select(this.parentNode.parentNode).attr("x", x).attr("y", y);

    //console.log(`dragging @117 g.y:${g.y}`,{x})

  })
  .on("start", function(){
    const d1 = d3.select(this)

      console.log(`start dragging @117 d3.event.y:${d3.event.y} X:${d1.attr('x')}`)
      d3.select(this).raise().attr("stroke", "black");

      d1.dragstart = d3.mouse(this); // store this
      console.log("dragstart ",d1.dragstart);
      d1.fixedbeforedrag = d1.fixed;
      d1.fixed=true;

  })
  .on("end", function(){
      console.log('stop dragging @117')
  })
  ;


  drag_Handler(gCursor)

})
