import './103-clock.html'
import { axisRadialInner, axisRadialOuter } from 'd3-radial-axis';
//d3.radialAxis = require('d3-radial-axis');

const TP = Template.xp_103_clock;

TP.onRendered(function(){
  const r = Math.min(window.innerWidth, window.innerHeight) / 2;
  const secMinScale = d3.scaleLinear().domain([0, 60]).range([0, 360]);
  const hourScale = d3.scaleLinear().domain([0, 12]).range([0, 360]);

console.log({hourScale})

// needles:
const pointersRelDimensions = [
    { class: 'hour', width: 0.05, height: 0.55 },
    { class: 'min', width: 0.05, height: 0.85 },
    { class: 'sec', width: 0.01, height: 0.85 }
]

// Size canvas
const svg = d3.select('#canvas')
    .attr('width', r * 2)
    .attr('height', r * 2)
    .attr('viewBox', `${-r} ${-r} ${r*2} ${r*2}`)

// Add background
svg.append('circle')
.classed('background', true)
.attr('cx', 0)
.attr('cy', 0)
.attr('r', r)

// Add axis
/*
      axisRadialInner(myAngleScale, myRadius);
      myAngleScale := hourScale
        .copy() //another instance or.. D3 v5.0 introduced selection.clone
*/

const inRadius = r-1;

const myAngleScale = hourScale.copy().range([0, 2 * Math.PI])
// 24 ticks in domain [0,12]
const h_axeInner = axisRadialInner(myAngleScale,inRadius).ticks(12).tickSize(10);
svg.append('g').classed('axis', true).call(h_axeInner)


const secAngleScale = secMinScale.copy().range([0, 2 * Math.PI]);
const s_axeInner = axisRadialInner(secAngleScale,inRadius).ticks(60).tickSize(6);
svg.append('g').classed('minor-ticks', true).call(s_axeInner)


// Add pointers : NEEDLES
svg.append('g').classed('pointers', true)
    .attr('transform', `scale(${r})`)
    .selectAll('rect')
        .data(pointersRelDimensions)
        .enter() // for each needle: a rounded-rectangle
            .append('rect')
            .attr('class', d=> d.class)
            .attr('x', d => -d.width/2)
            .attr('y', d => -d.height + d.width/2)
            .attr('width', d => d.width)
            .attr('height', d => d.height)
            .attr('rx', 0.02)
            .attr('ry', 0.03)

// Add center
svg.select('.pointers')
    .append('circle').classed('center', true)
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 0.02)

// Kick-off clock

function every_frame() {
    const dt = new Date()

    const ms = dt.getMilliseconds(),
        secs = dt.getSeconds() + ms/1000,
        mins = dt.getMinutes() + secs/60,
        hours = dt.getHours()%12 + mins/60

    d3.select('.pointers .hour').attr('transform', `rotate(${hourScale(hours)})`)
    d3.select('.pointers .min').attr('transform', `rotate(${secMinScale(mins)})`)
    d3.select('.pointers .sec').attr('transform', `rotate(${secMinScale(secs)})`)

    requestAnimationFrame(every_frame)
} //every_frame
requestAnimationFrame(every_frame)



}) // onRendered.

FlowRouter.route('/103', { name: '103_clock',
  triggerEnter: [
    function(context, redirect) {
    }
  ],
  action: function(params, queryParams){
    BlazeLayout.render('xp_103_clock');
  }
});
