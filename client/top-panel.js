import './top-panel.html'
import './button.js'

import sim from './app.js';


const TP = Template.top_panel;


const bStop = new svg_button({x:10, y:10, label:'start'});
bStop.on_click = function(x){
  console.log(`x:${x} this:`,this)
  this.text.text(`${(x%2 ==0)?'resume':'stop'}`)
//    if (x>5) t1.stop();
}


const bplus = new svg_button({y:10, x:120, label:'+'})
bplus.rect.on('click', function() {
  d3.select(this)
  .style("fill", "red")
  console.log('click-plus')
  one_shoot = 1;
})

const bminus = new svg_button({y:10, x:220, label:'-'})
bminus.rect.on('click', function() {
  if (bStop.click_Count%2 ==0) return;
  d3.select(this)
  .style("fill", "red")
  console.log('click-minus')
  one_shoot = 1;
})

const bVerbose = new svg_button({y:10, x:320, label:'verbose'})
bVerbose.rect.on('click', function() {
  d3.select(this)
  .style("fill", "red")
  console.log('click-verbose')
  one_shoot = 1;
})


if (bVerbose.click_Count%2 !=0) {
  //console.log(`V:${Math.floor(v/3)} v%60:${v%60}`,{v},{v_floor},{nd},{dy},{text0})
}




function svg_button(o={}) {
  const i = this;

  const {x=0, y=0, width=60,height=30,label='***'} = o;

  i.click_Count =0;
  i.on_click = ()=>{};

  i.bStop = d3.select("body")
       .append('svg')
       .attr('width',width+20)
       .attr('height',height)
       .style('background-color', 'green')
       .style('position', 'absolute')
       .attr("transform", `translate(${x},${y})`) // dash position
       .append('g')
       .style("cursor", "pointer")
       .on('click', function() {
         d3.select(this)
         .style("fill", "red")
         i.click_Count +=1;
         i.on_click(i.click_Count)
       })



  i.rect = i.bStop.append('rect')
       .attr('x',3)
       .attr('y',3) // 5*20 = 100 ATTENTION.
       .attr('height', height-6)
       .attr('width', width-6)
       .style("stroke", "blue")
       .style("fill", "gray")
       .on('mouseover', function(){
         d3.select(this)
         .style("fill", "lightgreen")
       })
       .on("mouseout", function(){
         d3.select(this)
        .style("fill", "steelblue")
       })




    i.text = i.bStop.append('text')
    .attr('x',5)
    .attr('y',25)
  //  .attr("text-anchor", "start")
    .style("font-family","helvetica")
    .style("font-weight","bold")
    .style("font-size","18px")
    .style("fill", "white")
    .text(label)

    return i;
}
