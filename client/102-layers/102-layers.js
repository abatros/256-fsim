import './102-layers.html'

const TP = Template.xp_102_layers


TP.helpers({
})

TP.onRendered(function () {
  const tp = this;

  const svg = d3.select("#mydiv")
  .append("svg")
  .attr("width", 400)
  .attr("height", 400)
  .style('background-color', 'lightgreen')

  const gface = svg.append('g')
  .attr('id','clock-face')
  .attr('transform',`translate(200,200)`)

  // face(g) is centered in svg.

  // the circle

  gface.append("circle")
  .style("stroke", "red")
  .style("fill", "none")
  .attr("r", 90)
  .attr("cx", 0)
  .attr("cy", 0)

  // the divisions

  var radians = 0.0174532925,
  	clockRadius = 100,
  	margin = 50,
  	width = (clockRadius+margin)*2,
      height = (clockRadius+margin)*2,
      hourHandLength = 2*clockRadius/3,
      minuteHandLength = clockRadius,
      secondHandLength = clockRadius-12,
      secondHandBalance = 30,
      secondTickStart = clockRadius,
      secondTickLength = -10,
      hourTickStart = clockRadius,
      hourTickLength = -18,
      secondLabelRadius = clockRadius + 16,
      secondLabelYOffset = 5,
      hourLabelRadius = clockRadius - 40,
      hourLabelYOffset = 7;

      var minuteScale = secondScale = d3.scaleLinear()
      	.range([0,354])
//        .range([0,200])
      	.domain([0,59]);


        var hourScale = d3.scaleLinear()
        	.range([0,330])
        	.domain([0,11]);

  //add marks for seconds
  	gface.selectAll('.second-tick')
  		.data(d3.range(0,60)).enter()
  			.append('line')
  			.attr('class', 'second-tick')
  			.attr('x1',0)
  			.attr('x2',0)
  			.attr('y1',secondTickStart)
  			.attr('y2',secondTickStart + secondTickLength)
  			.attr('transform',function(d){
  				return 'rotate(' + secondScale(d) + ')';
  			});


    let avg_load = 0;
    const txt = gface.append('text')
    .attr('x', 0)
    .attr('y', 180)
    .attr("text-anchor", "middle")
    .style("fill-stroke", 'black')
//    .style("stroke", 'orange')
    .style("font-family","helvetica")
//    .style("font-weight","bold")
    .style("font-size","22px")
    .text(`${Math.floor(avg_load)}`);


    const needle = gface.append('line')
    .attr('class', 'second-tick')
    .attr('x1',0)
    .attr('y1',0)
    .attr('x2',100)
    .attr('y2',100)

//    const t1 = d3.timer(every_frame);

    let etime =0;

    function every_frame() {
//      let s=new Date().getTime();
      let s=performance.now()
      needle.attr('x2', -90*Math.sin(hourScale(etime)*radians))
      needle.attr('y2', 90*Math.cos(hourScale(etime)*radians))
      etime += 0.005
      //console.log(performance.now()-s)
      avg_load = 0.5*avg_load + 0.5*(performance.now()-s)
      if (Math.floor(etime*0.005)%1000 ==0)
      txt.text(Math.floor(avg_load*10)/10)
      requestAnimationFrame(every_frame)
    }

    requestAnimationFrame(every_frame)


}); // onRendered



FlowRouter.route('/102', { name: '102-layers',
  triggerEnter: [
    function(context, redirect) {
    }
  ],
  action: function(params, queryParams){
    BlazeLayout.render('xp_102_layers');
  }
});
