import './rpm.html'
import {rpm} from './app.js';

const TP = Template.rpm;

TP.helpers({
  data() {
    const tp = Template.instance();
    const data = tp.data;
    console.log(`RPM helper `,{data})
    return tp.data;
  }
})


TP.onCreated(function(){
  const tp = this;
  tp.sine = 0;
  tp.cosine = 70*70;
  rpm.trace('rpm@20')
})

TP.onRendered(function(){
  const tp = this;
  const {width,height} = tp.data;
  const svg = d3.select(`#${tp.data.id}`)
    .attr('width',tp.data.width)
    .attr('height',tp.data.height)
    .style('background-color', 'rgb(120,120,190)');

  const g = svg.append('g')

  const needle = svg.append('line')
    .attr('x1', width/2)
    .attr('y1', height/2)
    .style("stroke", "white")
    .style("stroke-width", 2)
    .attr("x2", width/2)
//    .attr("y2", height/2+ 0 - height*Math.atan(10));
    .attr("y2", height/2 + 80);


  let _v = 0

  const t1 = new d3.timer(function(etime){

//    rpm.trace('rpm@44')
    rpm.pulse(1)
    //console.log(`@49 rpm T:${rpm.T}-${rpm.kx_.y}-${rpm.kv1_.y}-${rpm.kv2_.y} (${rpm.v2_.x}) v2:(${rpm.v2_.y})`)
    while(_v < rpm.v) {
      tp.sine += Math.floor(tp.cosine/70);
      tp.cosine -= Math.floor(tp.sine/70);
      _v +=1;
    }
    while(_v > rpm.v) {
      tp.cosine += Math.floor(tp.sine/70);
      tp.sine -= Math.floor(tp.cosine/70);
      _v -=1;
    }



    needle.attr('x2', width/2 - Math.floor(tp.sine/70))
    needle.attr('y2', height/2 + Math.floor(tp.cosine/70))
  })



})
