import './button.html';

const TP = Template.button;

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

TP.onCreated(function () {
const {
  color='lightgreen', bColor='rgb(120,120,120)',
  label ='***'} = this.data; // not tp.data
const tp = this;
tp.label = label;
tp.color = color;
tp.bColor = bColor;
tp.click_Count =0;
})


TP.onRendered(function () {
  const tp = this;
  const data = this.data; // funny !
  const {id, x=0, y=0, wd=100, ht=30, bColor='lightgreen'} = this.data; // not tp.data

  console.log(`vpot onRendered `,{data})
  const svg = d3.select(`#${id}`)
  .attr('width',wd)
  .attr('height',ht)

  const g = svg.append('g')


  const rect = g.append('rect')
  .style('fill', tp.bColor)
  .attr('rx', 5)
  .attr('ry', 5)
  .attr('x', 0)
  .attr('y', 0) // 5*20 = 100 ATTENTION.
  .attr('height', ht)
  .attr('width', wd)
  .style("cursor", "pointer")
  .on('click', function() {
    // d3.select(text)
    text.style("fill", "orange")
    //on_click(tp.click_Count)

    if (tp.click_Count%2 ==0)
      text.text('STOP');
    else
      text.text('RESUME');

    tp.click_Count +=1;
    console.log('click')
  })



  const time = g.append('text')
  .attr('x', wd/2)
  .attr('y', ht/2 +4)
  .attr("text-anchor", "middle")
  .style("fill", tp.color)
  .style("font-family","helvetica")
  .style("font-weight","bold")
  .style("font-size","14px")
  .text(`${tp.label}`);

})
