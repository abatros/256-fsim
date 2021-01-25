import './timer.html'

import sim from './app.js';

const TP = Template.timer;

TP.helpers({
  data: ()=>{
    const tp = Template.instance();
    const data = tp.data;
    return tp.data;
  },
  style: ()=>{
    return 'position:absolute;'
  }
})


TP.onCreated(function() {
  /*
  const {id, x=0, y=0,
    wd=100, ht=30,
    bColor='black',
    color='lightgreen'
  } = this.data; // not tp.data

  const tp = this;
  Object.assign(tp,{x,y,wd,ht})
  */
})


const s_Time = new Date().getTime();

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}


TP.onRendered(function() {
  const tp = this;
  const {id, wd=100,ht=30, color='lightgreen',bColor='black'} = this.data; // not tp.data

  const svg = d3.select(`#${id}`)

  const rect = svg.append('rect')
  .style('fill', bColor)
  .attr('rx', 5)
  .attr('ry', 5)
  .attr('x', 0)
  .attr('y', 0) // 5*20 = 100 ATTENTION.
  .attr('height', ht)
  .attr('width', wd)
  .style("cursor", "pointer")


  const etime = svg.append('text')
  .attr('x', wd/2)
  .attr('y', ht/2 +4)
  .attr("text-anchor", "middle")
  .style("fill", color)
  .style("font-family","helvetica")
  .style("font-weight","bold")
  .style("font-size","16px")
  .text(`99:99`);


  let sec_ =0;
  let min_ =0;

  function every_frame() {
    const etime_ = new Date().getTime() - s_Time;
    etime.text(millisToMinutesAndSeconds(etime_))
  }

  every_frame()

  const timer = d3.timer(every_frame);


})
