import './101-pot.html'

const TP = Template.xp_101_pot

const value = new ReactiveVar(200);

TP.helpers({
  val: ()=>{
    return value.get();
  }
})

TP.onRendered(function () {
  const tp = this;

  function mouseWheelHandler(e) {

  	// cross-browser wheel delta
  	var e = window.event || e; // old IE support
  	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    console.log(`>>>>101 mousewheel delta:${delta}`)

  //  myimage.style.width = Math.max(50, Math.min(800, myimage.width + (30 * delta))) + "px";

    // update a reactive var.
    value.set(value.get() - delta);

    return false;
  }

  const elements = Array.from(document.querySelectorAll(`#vpot-k0`));

  if( (/Firefox/i.test(navigator.userAgent)) ) {
        elements[0].addEventListener("DOMMouseScroll", mouseWheelHandler, false);
  } else {
        elements[0].addEventListener("mousewheel", mouseWheelHandler, false);
  }


}); // onRendered



FlowRouter.route('/101', { name: '101-pot',
  triggerEnter: [
    function(context, redirect) {
    }
  ],
  action: function(params, queryParams){
    console.log('Router::action for: ', FlowRouter.getRouteName());
    console.log(' --- params:',params);
    document.title = "main-page";
    BlazeLayout.render('xp_101_pot');
  }
});
