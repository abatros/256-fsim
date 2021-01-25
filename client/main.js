import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';
import './top-panel.js';
import './PFD/PFD.js'

/*
import './speedo.js';
import './roc.js';
import './altimeter.js';
import './vario.js';
*/
import './control-panel.js';
import './vpot.js';
import './button.js';
import './timer.js';
import './rpm.js';

import './101-pot/101-pot.js';
import './102-layers/102-layers.js';
import './103-clock/103-clock.js';


FlowRouter.route('/', { name: 'main-page',
  triggerEnter: [
    function(context, redirect) {
    }
  ],
  action: function(params, queryParams){
    console.log('Router::action for: ', FlowRouter.getRouteName());
    console.log(' --- params:',params);
    document.title = "main-page";
    BlazeLayout.render('main_page');
  }
});
