package f16;

/** State vector for F16 simulator. */

public class StateVector {
  private float vt;    // ft/sec
  private float alpha; // radians
  private float beta;  // radians
  private float phi;   // radians
  private float theta; // radians
  private float psi;   // radians
  private float p;     // radians/sec
  private float q;     // radians/sec
  private float r;     // radians/sec
  private float xn;    // ft
  private float xe;    // ft
  private float h;     // ft
  private float pow;   // percent, 0 <= pow <= 100

  public void  setVt(float val) { vt = val; }
  public float vt()             { return vt; }

  public void  setAlpha(float val) { alpha = val; }
  public float alpha()             { return alpha; }

  public void  setBeta(float val) { beta = val; }
  public float beta()             { return beta; }

  /** Roll */
  public void  setPhi(float val) { phi = val; }
  /** Roll */
  public float phi()             { return phi; }

  /** Pitch */
  public void  setTheta(float val) { theta = val; }
  /** Pitch */
  public float theta()             { return theta; }

  /** Yaw */
  public void  setPsi(float val) { psi = val; }
  /** Yaw */
  public float psi()             { return psi; }

  public void  setP(float val) { p = val; }
  public float p()             { return p; }

  public void  setQ(float val) { q = val; }
  public float q()             { return q; }

  public void  setR(float val) { r = val; }
  public float r()             { return r; }

  public void  setXn(float val) { xn = val; }
  public float xn()             { return xn; }

  public void  setXe(float val) { xe = val; }
  public float xe()             { return xe; }

  public void  setH(float val) { h = val; }
  public float h()             { return h; }

  public void  setPow(float val) { pow = val; }
  public float pow()             { return pow; }

  /** Integration support. Integrates the derivative vector <b>v</b>
      into this one, scaling the derivative by dt.

      @param v  Derivative state vector
      @param dt delta-t scaling factor for derivative
      @param simplifiedAero If true, disables angle-of-attack and
                            sideslip forces for better stability
      @param afterburnerFactor Scale factor for velocity (usually 1.0f)
  */
  public void integrate(StateVector v, float dt,
                        boolean simplifiedAero,
                        float afterburnerFactor) {
    vt    += dt * v.vt;
    if (simplifiedAero) {
      // Disables angle-of-attack and sideslip forces for better stability
      alpha  = 0;
      beta   = 0;
    } else {
      alpha += dt * v.alpha;
      beta  += dt * v.beta;
    }
    phi   += dt * v.phi;
    theta += dt * v.theta;
    psi   += dt * v.psi;
    p     += dt * v.p;
    q     += dt * v.q;
    r     += dt * v.r;
    xn    += dt * afterburnerFactor * v.xn;
    xe    += dt * afterburnerFactor * v.xe;
    h     += dt * afterburnerFactor * v.h;
    pow   += dt * v.pow;
  }
}
