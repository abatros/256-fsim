module.exports = {
  Integrator,
  Cosine,
}

function Integrator(K,id) {
  const i = this;
  i.id = id;
  i.K =K;
  i.x =0;
  i.y =0;
  i.y_ =0;
// NO !  i.dy =0;
  return i;
}

Integrator.prototype.trace = function(s) {
  const i = this;
  console.log(`${s}[${i.id}] K:${i.K} x:${i.x} y:${i.y} (${i.y_})`)
  return i;
}


Integrator.prototype.pulse = function(dt) {
  const i = this;
  const _y = i.y;

  if (i.x >i.K) {
    console.log(`ALERT (x:${i.x}) > ${i.K} `, i)
    throw `Integrator overflow X`
  }


  i.y_ += i.x;
  i.y = Math.floor(i.y_/i.K)
  const dy = i.y - _y;
  if (dy >1) {
    console.log(`ALERT (dy:${dy}) >1 `, i)
    throw `Integrator overflow X`
  }
  return dy; // only valid once : do not store dy. dangerous.
}


Integrator.prototype.square = function(dx) {
  const i = this;
  const _y = i.y;

  if (i.x >= i.K) {
    console.log(`ALERT (x:${i.x}) > ${i.K} `, i)
    throw `Integrator(square) overflow X`
  }


  i.y_ += i.x;
  i.x += dx;
  i.y_ += i.x;

  i.y = Math.floor(i.y_/(i.K*2))
  const dy = i.y - _y;
  if (dy >1) {
    console.log(`ALERT (dy:${dy}) >1 `, i)
    throw `Integrator(square) overflow X`
  }
  return dy; // only valid once : do not store dy. dangerous.
}



function Cosine(K) {
  const i = this;
  i.K =K;
  i.x_ = 0;
  i.y_ = (K-1)*K;
  i.x = Math.floor(i.x_/i.K)
  i.y = Math.floor(i.y_/i.K)

  return i;
}


Cosine.prototype.dt = function(dt) {
  const i = this;
  if (dt>0) {
    i.x_ += i.y;
    i.x = Math.floor(i.x_/i.K)
    i.y_ -= i.x;
    i.y = Math.floor(i.y_/i.K)
  } else {
    i.y_ += i.x;
    i.y = Math.floor(i.y_/i.K)
    i.x_ -= i.y;
    i.x = Math.floor(i.x_/i.K)
  }
  return i;
}

Cosine.prototype.trace = function(s) {
  const i = this;
  console.log(`[${s}] x:${i.x} y:${i.y}`)
  return i;
}


function ROC() {
  const i = this;
  i.weight = 200; // initial weight (relative weight  W-L)
  i.Lift = 0;
  i.y = new Integrator(256, 'ROC:Y');
  i.v = new Integrator(256, 'ROC:V');

  return i;
}

ROC.prototype.trace = function(s) {
  const i = this;
  console.log(`[${s}] y(spring):${i.y.y} zacc:${i.v.x}`)
  return i;
}

ROC.prototype.dt = function(dt) {
  const i = this;
  if (dt <=0) return 0;
  i.y.x = i.v.y
  const r = 0.5;
  /*
  if ((i.y.y > r* i.y.K)||(i.y.y < -r* i.y.K*0.5) || (i.y.y < -100)) {
    console.log(`ALERT MAX SPRING y:${i.y.y}`)
  }*/


  if (i.y.y < -90) {
//    console.log(`ALERT EXT MAX y:${i.y.y}`)
//    i.y.y = -100;
  }


  let dy =0;
  let f = i.weight -i.Lift

  /*
    if (y>=0) apply weight
    else substract wheel weight/
  */

  if (i.y.y > -100) {
    // not airborne YET.
    f -= i.y.y // prop to compression
    f -= 0.85*i.y.x; // damper
  }
  dy = i.y.pulse(1); // altitude


  // damper is % to speed.
  i.v.x = f; //i.weight - i.y.y -i.Lift- 0.85*i.y.x; // acceleration
  const dv = i.v.pulse(1);

  return dy; // y % thrust
}


const roc = new ROC();
module.exports.roc = roc;

// ---------------------------------------------------------------------


/*
const xacc = new Integrator(max_speed).trace('@200');
xacc.x = 100; // initial thrust
const v2 = new Integrator(max_speed/2).trace(`@201`)
*/
function XACC(max_speed=256, id="XACC") {
  const i = this
  i.v = new Integrator(max_speed,`${id}:V`).trace('@200');
//  i.v.x = _acc; // initial acceleration := thrust
  i.v2 = new Integrator(max_speed,`${id}:V2`).trace(`@201`)
  i.k2 = new Integrator(max_speed,`${id}:K2`).trace(`@202`)
  i.k2.x = Math.floor(i.k2.K * 0.5);

  return i;
}

XACC.prototype.trace = function(s) {
  const i = this
  console.log(`[${s}] xacc:${i.v.x} v:${i.v.y} v2:${i.v2.y}`,i)
  return i;
}

XACC.prototype.pulse =  function(dt=1) {
  const i = this
  const dv = i.v.pulse(dt)
  const _v2 = i.v2.y;
  i.v2.dy = 0;

  if (dv) {
    i.v2.square(dv)
    i.v2.dy = i.v2.y - _v2;

    // frequency divisor
    i.v.x -= i.k2.pulse(i.v2.dy);
   }
  return dv; // !! not the instance.
}


const max_speed = 700; // kts
const xacc = new XACC(max_speed);
module.exports.xacc = xacc;


const altimeter = new Integrator(255);

module.exports.altimeter = altimeter;

// ------------------------------------------------------------------------

xacc.v.x = 0.5*xacc.v.K; // initial acceleration from THRUST.


const interval = 10; // ms
const T0 = new Date().getTime();
let expected = T0 + interval;
let max_err =0;

setTimeout(step, interval);

function step() {
    const err = new Date().getTime() - expected; // the drift (positive for overshooting)
    ;(max_err < err) && (max_err = err);
    if (err > interval) {
        // something really bad happened. Maybe the browser (tab) was inactive?
        // possibly special handling to avoid futile "catch up" run
///        console.log(`ALERT overheat`)
    //console.log(`@${expected-T0} tick ${interval} ms  err:${err}(${max_err}) ${(err>interval)?'ALERT':''}`)
    }

    // ----------------------------------------------------------------------

    try {
//      const dv = xacc.trace(`@241`).pulse();
      const dv = xacc.pulse();
      if (dv) {
        // changed
    //    roc.x -= xacc.v2.dy // Lift.
      }
      weight = 200;
      altimeter.x = xacc.v2.y - weight;
      altimeter.pulse(1)
      if (altimeter.y <0) {altimeter.y_=0;}
    }

    catch(err) {
      console.log({err})
      xacc.trace(`@239`)
    }




    // ----------------------------------------------------------------------

    expected += interval;
    setTimeout(step, Math.max(0, interval - err)); // take into account drift
  }


// ------------------------------------------------------------------------

function TI(K) {
  const i = this;
  i.K=K;
  i.x=0;
  i.y_=0;
  i.y=0;
  return i;
}

TI.prototype.trace =  function(s) {
  const i = this
  console.log(`TI[${s}] K:${i.K} x:${i.x} y:${i.y} _y:${i.y_}`)
  return i;
}


TI.prototype.pulse =  function(dt=1) {
  const i = this

  if ((dt>1)||(dt < -1)) throw 'TI.dt overflow'

  i.y_ += i.x*dt;
  const y = i.y;
  i.y = Math.floor(i.y_/i.K)
  return (i.y-y)
}

TI.prototype.add =  function(x) {
  const i = this

  if ((x>i.K)||(x <-i.K)) throw 'TI.x overflow'

  i.x = x;
  i.y_ += x;
  const y = i.y;
  i.y = Math.floor(i.y_/i.K)
  return (i.y-y)
}

// --------------------------------------------------------------------------

function TI2(K) {
  const i = this;
  i.K = K;
  i.x=0;
  i.y_=0;
  i.y=0;
  return i;
}

TI2.prototype.pulse =  function(dx=0) {
  if (dx == 0) return 0;
  if ((dx>1)||(dx < -1)) throw 'TI2.dx overflow'

  const i = this
  const y = i.y;
  i.y_ += i.x*dx;
  i.x += dx;
  i.y_ += i.x*dx;
  i.y = Math.floor(i.y_/i.K/2)
  return (i.y-y)
}

// --------------------------------------------------------------------------

function RLC2(o) {
  const i = this;
  const {
    K=256,
    T=0,
    M=0,
    x=0,
//    v=0,
//    v2=0,
    kM=0,
    kx=0,
    kv1=0, kv2=0,
    acc=0,
    } =o;



  i.K = K
  i.T = T
  i.kM = K; // min-weight (never zero)
  i.x = x;
  i.v = 0;
  i.v2 = 0;
  i.kx = kx;
  i.kv1 = kv1;
  i.kv2 = kv2;
  i.acc = acc;
  console.log(`i.acc:${i.acc} `,{acc})
  i.drag =0;


  i.kM_ = new TI(256).trace('@365 i.kM_');
  i.kx_ = new TI(K); // rappel elastic
  i.kv1_ = new TI(K); // damper
  i.kv2_ = new TI(K); // drag
  i.mdv_ = new TI(K);
  i.v2_ = new TI2(K);
  i.x_ = new TI(K);
  return i;
}

RLC2.prototype.trace =  function(s) {
  const i = this
  console.log(`[${s}] relative-weight:${i.acc} v:${i.v} x:${i.x} drag:${i.drag}`)
  return i;
}


RLC2.prototype.pulse =  function(dt=1) {
  const i = this

  const F = i.T
            - i.kx_.y //(elastic)
            -i.kv1_.y     // damper
            -i.kv2_.y;    // drag

  const fdt = i.mdv_.add(F)

  i.kM_.x = i.kM;
  const dv = i.kM_.pulse(fdt);

  i.kv1_.add(i.kv1*dv); // damper
  const dv2 = i.v2_.pulse(dv);

  i.kv2_.add(i.kv2*dv2); // drag
  const dx = i.x_.add(i.v);

  i.kx_.add(i.kx*dx); // elastic


  i.v = i.kM_.y;
  i.x = i.x_.y;
  i.drag = i.kv2_.y;
  i.acc = i.mdv_.x; // divided by M
  //console.log(`[pulse] mdv_:(${i.mdv_.x},${i.mdv_.y},${i.mdv_.K})`)
  return i;
}




// TESTING.
const rpm = new RLC2({K:256, T:100, kM:256, kv1:10, kv2:200, kx:0}).trace('@405::rpm');
module.exports.rpm = rpm;
