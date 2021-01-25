package f16;

/** Simplified 13-state model of F16 flight dynamics. Originally
    authored by <a href =
    "http://www.cds.caltech.edu/~murray/">Prof. Richard M. Murray</a>;
    available in the Caltech <a href =
    "http://www.cds.caltech.edu/~vehicles/models/">Aerospace Models
    Archive</a>. Translated from Fortran to Java by <a href =
    "http://www.media.mit.edu/~kbrussel/">Kenneth Russell</a>. */

public class F16Model {
  private static final FortranArray1D c = initConstants();
  private boolean simpleAero = false;

  private static final float S    = 300.0f;
  private static final float B    = 30.0f;
  private static final float CBAR = 11.32f;
  private static final float XCGR = 0.35f;
  private static final float HE   = 160.0f;
  private static final float G    = 32.174f;
  private static final float RTOD = 57.29578f;

  static class Atmospheric {
    float rmach;
    float qbar;
  }
  private Atmospheric atmospheric = new Atmospheric();

  static class F16Engine {
    float thrust;
    float dpow;
  }
  private F16Engine engine = new F16Engine();

  static class F16Aero {
    // Body axis nondimensional aerodynamic force coefficients
    float cx;
    float cy;
    float cz;
    // Body axis nondimensional aerodynamic moment coefficients
    float cl;
    float cm;
    float cn;
  }
  private F16Aero aero = new F16Aero();

  private FortranArray1D damping = new FortranArray1D(1, 9);

  /** Computes state derivatives for the f-16 model.

      @param u Input vector - thtl,el,ail,rdr.+ vxTurb,vyTurb,vzTurb
      @param x State vector - vt,alpha,beta,phi,theta,psi,p,q,r,xn(north),xe(east),h.
      @param xd Output: state vector time derivative.  */
  public void derivative(InputVector u,
                         StateVector x,
                         StateVector xd) {
    derivative(u, x, c, xd);
  }

  /** Allows disabling of angle of attack and sideslip angle in
      aerodynamics computation to improve stability of the simulator.
      Default is the full computation. */
  public void setSimplifiedAerodynamics(boolean isSimplifiedOn) {
    simpleAero = isSimplifiedOn;
  }

  //----------------------------------------------------------------------
  // Internals only below this point
  //

  private void derivative(InputVector u,
                          StateVector x,
                          FortranArray1D c,
                          StateVector xd) {
    float vt1    = x.vt();
    float alpha1 = x.alpha() * RTOD;
    float beta1  = x.beta() * RTOD;
    float phi    = x.phi();
    float the    = x.theta();
    float psi    = x.psi();
    float p      = x.p();
    float q      = x.q();
    float r      = x.r();
    float alt    = x.h();
    float pow    = x.pow();
    float thtl   = u.throttle();
    float el     = u.elevator();
    float ail    = u.aileron();
    float rdr    = u.rudder();
    float rm     = 1.0f / c.get(10);
    float xcg    = c.get(11);

    // Turbulence
    float vxturb = u.vxTurbulence();
    float vyturb = u.vyTurbulence();
    float vzturb = u.vzTurbulence();

    // Incorporating gust into aero coefficients table look up
    float cbta = (float) Math.cos(x.beta());
    float vx1  = vt1 * (float) Math.cos(x.alpha()) * cbta;
    float vy1  = vt1 * (float) Math.sin(x.beta());
    float vz1  = vt1 * (float) Math.sin(x.alpha()) * cbta;
    
    float vx = vx1 + vxturb;
    float vy = vy1 + vyturb;
    float vz = vz1 + vzturb;

    float vt    = (float) Math.sqrt(vx * vx + vy * vy + vz * vz);
    float alpha = (simpleAero ? 0 : ((float) Math.atan(vz / vx) * RTOD));
    float beta  = (simpleAero ? 0 : ((float) Math.asin(vy / vt) * RTOD));

    atm(vt, alt, atmospheric);
    f16Engine(pow, alt, atmospheric.rmach, thtl, engine);
    xd.setPow(engine.dpow);
    f16Aero(vt, alpha, beta, p, q, r, el, ail, rdr, xcg, aero);
    float cx = aero.cx;
    float cy = aero.cy;
    float cz = aero.cz;
    float cl = aero.cl;
    float cm = aero.cm;
    float cn = aero.cn;
    float sth = (float) Math.sin(the);
    float cth = (float) Math.cos(the);
    float sph = (float) Math.sin(phi);
    float cph = (float) Math.cos(phi);
    float spsi = (float) Math.sin(psi);
    float cpsi = (float) Math.cos(psi);
    float qs = atmospheric.qbar * S;
    float ay = rm * qs * cy;
    float az = rm * qs * cz;

    // Force equations.
    float vxDot = r * vy - q * vz - G * sth + rm * (qs * cx + engine.thrust);
    float vyDot = p * vz - r * vx + G * cth * sph + ay;
    float vzDot = q * vx - p * vy + G * cth * cph + az;
    float den   = vx * vx + vz * vz;
    xd.setVt   ((vx * vxDot + vy * vyDot + vz * vzDot) / vt);
    xd.setAlpha((vx * vzDot - vz * vxDot) / den);
    xd.setBeta ((vt * vyDot - vy * xd.vt()) * cbta / den);

    // Kinematics.
    xd.setPsi((q * sph + r * cph) / cth);
    xd.setPhi(p + sth*xd.psi());
    xd.setTheta(q*cph - r*sph);

    // Moment equations.
    xd.setP((c.get(1)*r + c.get(2)*p + c.get(4)*HE)*q + qs*B*(c.get(3)*cl + c.get(4)*cn));
    xd.setQ((c.get(5)*p - c.get(7)*HE)*r + c.get(6)*(r*r-p*p) + c.get(7)*qs*CBAR*cm);
    xd.setR((c.get(8)*p - c.get(2)*r + c.get(9)*HE)*q + qs*B*(c.get(4)*cl + c.get(9)*cn));

    // Navigation equations.
    xd.setXn(vx*cth*cpsi + vy*(sph*sth*cpsi-cph*spsi)
             + vz*(sph*spsi+cph*sth*cpsi));
    xd.setXe(vx*cth*spsi + vy*(cph*cpsi+sph*sth*spsi)
             + vz*(cph*sth*spsi-sph*cpsi));
    xd.setH(vx*sth - vy*sph*cth - vz*cph*cth);
  }

  /** Computes properties of the standard atmosphere. */
  private void atm(float vt, float alt, Atmospheric atmos) {
    final float ro = 0.002377f;
    
    float tfac = 1.0f - alt*0.703E-05f;
    float t = 519.0f*tfac;
    if (alt >= 35000.0f) t=390.0f;
    float rho = ro*((float) Math.pow(tfac, 4.14f));
    atmos.rmach = vt / (float) Math.sqrt(1.4f*1716.3f*t);
    atmos.qbar = 0.5f*rho*vt*vt;
  }

  /** Computes the body axis nondimensional aerodynamic coefficients
      for the F-16 based on wind tunnel data from NASA TP 1538,
      December 1979.
      
      @param vt    Airspeed, ft/sec.
      @param alpha Angle of attack, deg. ( -10 <= alpha <= 45 )
      @param beta  Sideslip angle, deg.  ( -30 <= BETA <= 30 )
      @param p     Body axis angular velocity in roll, rad/sec.
      @param q     Body axis angular velocity in pitch, rad/sec.
      @param r     Body axis angular velocity in yaw, rad/sec.
      @param el    Elevator deflection, deg.  ( -25 <= EL <= 25 )
      @param ail   Aileron deflection, deg.  ( -21.5 <= AIL <= 21.5 )
      @param rdr   Rudder deflection, deg.  ( -30 <= RDR <= 30 )
      @param xcg   Longitudinal c.g. location, distance normalized by the m.a.c.
      @param aero Output. cx,cy,cz = Body axis nondimensional
                  aerodynamic force coefficients; cl,cm,cn = body axis
                  nondimensional aerodynamic moment coefficients.
  */
  private void f16Aero(float vt, float alpha, float beta,
                       float p, float q, float r,
                       float el, float ail, float rdr, float xcg,
                       F16Aero aero) {
    // Basic flow angle and control surface aerodynamics.
    aero.cx = cxAero(alpha, el);
    aero.cy = cyAero(beta, ail, rdr);
    aero.cz = czAero(alpha, beta, el);
    float dail = ail / 20.0f;
    float drdr = rdr / 30.0f;
    aero.cl = clAero(alpha, beta);
    float dclda = dlda(alpha, beta);
    float dcldr = dldr(alpha, beta);
    aero.cl = aero.cl + dclda*dail + dcldr*drdr;
    aero.cm = cmAero(alpha, el);
    aero.cn = cnAero(alpha, beta);
    float dcnda = dnda(alpha, beta);
    float dcndr = dndr(alpha, beta);
    aero.cn = aero.cn + dcnda*dail + dcndr*drdr;
    
    // Add damping terms.
    FortranArray1D d = damping;
    damp(alpha, d);
    float cq  = 0.5f*q*CBAR/vt;
    float b2v = 0.5f*B/vt;
    aero.cx += cq*d.get(1);
    aero.cy += b2v*(d.get(2)*r + d.get(3)*p);
    aero.cz += cq*d.get(4);
    aero.cl += b2v*(d.get(5)*r + d.get(6)*p);
    aero.cm += cq*d.get(7) + aero.cz*(XCGR-xcg);
    aero.cn += b2v*(d.get(8)*r + d.get(9)*p) - aero.cy*(XCGR-xcg)*CBAR/B;
  }
    
  /** Computes the damping coefficients for the F-16 aerodynamic
      model. 

      @param alpha Angle of attack, deg  ( -10 <= ALPHA <= 45 )
      @param d     Output: d = [CXq, CYr, CYp, CZq, Clr, Clp, Cmq, Cnr, Cnp]
  */
  private void damp(float alpha, FortranArray1D d) {
    FortranArray2D a = dampingTable;
    float s = 0.2f*alpha;
    int k = (int) s;
    if (k <= -2) k = -1;
    if (k >=  9) k = 8;
    float da = s - (float) k;
    int l = k + (int) sign(1.1f, da);
    for (int i = 1; i <= 9; i++) {
      d.set(i, a.get(k,i) + Math.abs(da)*(a.get(l,i)-a.get(k,i)));
    }
  }
  private static final FortranArray2D dampingTable =
    new FortranArray2D(-2, 9, 1, 9, new float[] {
      - .267f,-  .110f,   .308f,  1.34f,   2.08f,   2.91f,   2.76f,   2.05f,   1.50f,   1.49f,   1.83f,   1.21f,      
        .882f,   .852f,   .876f,   .958f,   .962f,   .974f,   .819f,   .483f,   .590f,  1.21f, -  .493f,- 1.04f,
      - .108f,-  .108f,-  .188f,   .110f,   .258f,   .226f,   .344f,   .362f,   .611f,   .529f,   .298f,-  .227f,
      -8.80f, -25.8f,  -28.9f,  -31.4f,  -31.2f,  -30.7f,  -27.7f,  -28.2f,  -29.0f,  -29.8f,  -38.3f,  -35.3f,
      - .126f,-  .026f,   .063f,   .113f,   .208f,   .230f,   .319f,   .437f,   .680f,   .100f,   .447f,-  .330f,
      - .360f,-  .359f,-  .443f,-  .420f,-  .383f,-  .375f,-  .329f,-  .294f,-  .230f,-  .210f,-  .120f,-  .100f,
      -7.21f, - 5.40f, - 5.23f, - 5.26f, - 6.11f, - 6.64f, - 5.69f, - 6.00f, - 6.20f, - 6.40f, - 6.60f, - 6.00f,
      - .380f,-  .363f,-  .378f,-  .386f,-  .370f,-  .453f,-  .550f,-  .582f,-  .595f,-  .637f,- 1.02f, -  .840f,
        .061f,   .052f,   .052f,-  .012f,-  .013f,-  .024f,   .050f,   .150f,   .130f,   .158f,   .240f,   .150f
    });      

      
  /** Computes the X body axis aerodynamic force coefficient for the
      F-16 aerodynamic model.
      
      @param alpha Angle of attack, deg      ( -10 <= ALPHA <= 45 )
      @param el    Elevator deflection, deg  ( -25 <= EL <= 25 )
  */
  private static float cxAero(float alpha, float el) {
    FortranArray2D a = cxAeroTable;
    float s = 0.2f*alpha;
    int k = (int) s;
    if (k <= -2) k = -1;
    if (k >= 9)  k = 8;
    float da = s - (float) k;
    int l = k + (int) sign(1.1f, da);
    s = el / 12.0f;
    int m = (int) s;
    if (m <= -2) m = -1;
    if (m >=  2) m =  1;
    float de = s - (float) m;
    int n = m + (int) sign(1.1f, de);
    float v = a.get(k,m) + Math.abs(da)*(a.get(l,m)-a.get(k,m));
    float w = a.get(k,n) + Math.abs(da)*(a.get(l,n)-a.get(k,n));
    return v + (w-v)*Math.abs(de);
  }
  private static final FortranArray2D cxAeroTable =
    new FortranArray2D(-2, 9, -2, 2, new float[] {
      -.099f,-.081f,-.081f,-.063f,-.025f,.044f, .097f,.113f,.145f,.167f,.174f,.166f,      
      -.048f,-.038f,-.040f,-.021f, .016f,.083f, .127f,.137f,.162f,.177f,.179f,.167f,
      -.022f,-.020f,-.021f,-.004f, .032f,.094f, .128f,.130f,.154f,.161f,.155f,.138f,
      -.040f,-.038f,-.039f,-.025f, .006f,.062f, .087f,.085f,.100f,.110f,.104f,.091f,
      -.083f,-.073f,-.076f,-.072f,-.046f,.012f, .024f,.025f,.043f,.053f,.047f,.040f
    });

    
  /** This function computes the Y body axis aerodynamic force coefficient
      for the F-16 aerodynamic model.

      @param beta Sideslip angle, deg     ( -30 <= BETA <= 30 )
      @param ail  Aileron deflection, deg ( -21.5 <= AIL <= 21.5 )
      @param rdr  Rudder deflection, deg  ( -30 <= RDR <= 30 )
  */
  private static float cyAero(float beta, float ail, float rdr) {
    return -.02f*beta + .021f*(ail/20.0f) + .086f*(rdr/30.0f);
  }
    

  /* Computes the Z body axis aerodynamic force coefficient for the
     F-16 aerodynamic model.

     @param alpha Angle of attack, deg     ( -10 <= ALPHA <= 45 )
     @param beta  Sideslip angle, deg      ( -30 <= BETA <= 30 )
     @param el    Elevator deflection, deg ( -25 <= EL <= 25 )
  */
  private static float czAero(float alpha, float beta, float el) {
    FortranArray1D a = czAeroTable;
    float s = 0.2f*alpha;
    int k = (int) s;
    if (k <= -2) k = -1;
    if (k >=  9) k =  8;
    float da = s - (float) k;
    int l = k + (int) sign(1.1f, da);
    s = a.get(k) + Math.abs(da)*(a.get(l)-a.get(k));
    return s * (1.0f-(float) Math.pow(beta/57.3f, 2)) - .19f*(el/25.0f);
  }
  private static final FortranArray1D czAeroTable =
    new FortranArray1D(-2, 9, new float[] {
      .770f, .241f, -.100f, -.416f, -.731f, -1.053f, -1.366f, -1.646f, -1.917f, -2.120f, -2.248f, -2.229f      
    });


  /* Computes the Y body axis aerodynamic moment coefficient for the
     F-16 aerodynamic model.

     @param alpha  Angle of attack, deg     ( -10 <= ALPHA <= 45 )
     @param el     Elevator deflection, deg ( -25 <= EL <= 25 )
  */
  private static float cmAero(float alpha, float el) {
    FortranArray2D a = cmAeroTable;
    float s = 0.2f*alpha;
    int k = (int) s;
    if (k <= -2) k = -1;
    if (k >=  9) k =  8;
    float da = s - (float) k;
    int l = k + (int) sign(1.1f, da);
    s = el / 12.0f;
    int m = (int) s;
    if (m <= -2) m = -1;
    if (m >=  2) m =  1;
    float de = s - (float) m;
    int n = m + (int) sign(1.1f,de);
    float v = a.get(k,m) + Math.abs(da)*(a.get(l,m)-a.get(k,m));
    float w = a.get(k,n) + Math.abs(da)*(a.get(l,n)-a.get(k,n));
    return v + (w-v)*Math.abs(de);
  }
  private static final FortranArray2D cmAeroTable =
    new FortranArray2D(-2, 9, -2, 2, new float[] {
       .205f, .168f, .186f, .196f, .213f, .251f, .245f, .238f, .252f, .231f, .198f, .192f,      
       .081f, .077f, .107f, .110f, .110f, .141f, .127f, .119f, .133f, .108f, .081f, .093f,
      -.046f,-.020f,-.009f,-.005f,-.006f, .010f, .006f,-.001f, .014f, .000f,-.013f, .032f,
      -.174f,-.145f,-.121f,-.127f,-.129f,-.102f,-.097f,-.113f,-.087f,-.084f,-.069f,-.006f,
      -.259f,-.202f,-.184f,-.193f,-.199f,-.150f,-.160f,-.167f,-.104f,-.076f,-.041f,-.005f
    });
    

  /** Computes the X body axis aerodynamic moment coefficient for the
      F-16 aerodynamic model.

      @param alpha Angle of attack, deg  ( -10 <= ALPHA <= 45 )
      @param beta  Sideslip angle, deg   ( -30 <= BETA <= 30 )
  */
  private static float clAero(float alpha, float beta) {
    FortranArray2D a = clAeroTable;
    float s = 0.2f*alpha;
    int k = (int) s;
    if (k <= -2) k = -1;
    if (k >=  9) k =  8;
    float da = s - (float) k;
    int l = k + (int) sign(1.1f, da);
    s = .2f*Math.abs(beta);
    int m = (int) s;
    if (m <= 0) m = 1;
    if (m >= 6) m = 5;
    float db = s - (float) m;
    int n = m + (int) sign(1.1f, db);
    float v = a.get(k,m) + Math.abs(da)*(a.get(l,m)-a.get(k,m));
    float w = a.get(k,n) + Math.abs(da)*(a.get(l,n)-a.get(k,n));
    return (v + (w-v)*Math.abs(db))*sign(1.0f,beta);
  }
  private static final FortranArray2D clAeroTable =
    new FortranArray2D(-2, 9, 0, 6, new float[] {
      0.f,0.f,0.f,0.f,0.f,0.f,0.f,0.f,0.f,0.f,0.f,0.f,
      -.001f,-.004f,-.008f,-.012f,-.016f,-.022f,-.022f,-.021f,-.015f,-.008f,-.013f,-.015f,
      -.003f,-.009f,-.017f,-.024f,-.030f,-.041f,-.045f,-.040f,-.016f,-.002f,-.010f,-.019f,
      -.001f,-.010f,-.020f,-.030f,-.039f,-.054f,-.057f,-.054f,-.023f,-.006f,-.014f,-.027f,
       .000f,-.010f,-.022f,-.034f,-.047f,-.060f,-.069f,-.067f,-.033f,-.036f,-.035f,-.035f,
       .007f,-.010f,-.023f,-.034f,-.049f,-.063f,-.081f,-.079f,-.060f,-.058f,-.062f,-.059f,
       .009f,-.011f,-.023f,-.037f,-.050f,-.068f,-.089f,-.088f,-.091f,-.076f,-.077f,-.076f
    });
    
    
  /** Computes the Z body axis aerodynamic moment coefficient for the
      F-16 aerodynamic model.

      @param alpha Angle of attack, deg  ( -10 <= ALPHA <= 45 )
      @param beta  Sideslip angle, deg  ( -30 <= BETA <= 30 )
  */
  private static float cnAero(float alpha, float beta) {
    FortranArray2D a = cnAeroTable;
    float s = 0.2f*alpha;
    int k = (int) s;
    if (k <= -2) k = -1;
    if (k >=  9) k =  8;
    float da = s - (float) k;
    int l = k + (int) sign(1.1f, da);
    s = .2f*Math.abs(beta);
    int m = (int) s;
    if (m <= 0) m = 1;
    if (m >= 6) m = 5;
    float db = s - (float) m;
    int n = m + (int) sign(1.1f, db);
    float v = a.get(k,m) + Math.abs(da)*(a.get(l,m)-a.get(k,m));
    float w = a.get(k,n) + Math.abs(da)*(a.get(l,n)-a.get(k,n));
    return (v + (w-v)*Math.abs(db))*sign(1.0f,beta);
  }
  private static final FortranArray2D cnAeroTable =
    new FortranArray2D(-2, 9, 0, 6, new float[] {
      0.f,0.f,0.f,0.f,0.f,0.f,0.f,0.f,0.f,0.f,0.f,0.f,
      .018f,.019f,.018f,.019f,.019f,.018f,.013f,.007f,.004f,-.014f,-.017f,-.033f,
      .038f,.042f,.042f,.042f,.043f,.039f,.030f,.017f,.004f,-.035f,-.047f,-.057f,
      .056f,.057f,.059f,.058f,.058f,.053f,.032f,.012f,.002f,-.046f,-.071f,-.073f,
      .064f,.077f,.076f,.074f,.073f,.057f,.029f,.007f,.012f,-.034f,-.065f,-.041f,
      .074f,.086f,.093f,.089f,.080f,.062f,.049f,.022f,.028f,-.012f,-.002f,-.013f,
      .079f,.090f,.106f,.106f,.096f,.080f,.068f,.030f,.064f, .015f, .011f,-.001f
    });    
    
    
  /** Computes the rolling moment due to aileron deflection for the
      F-16 aerodynamic model.

      @param alpha Angle of attack, deg  ( -10 <= ALPHA <= 45 )
      @param beta  Sideslip angle, deg   ( -30 <= BETA <= 30 )
  */
  private static float dlda(float alpha, float beta) {
    FortranArray2D a = dldaTable;
    float s = 0.2f*alpha;
    int k = (int) s;
    if (k <= -2) k = -1;
    if (k >=  9) k =  8;
    float da = s - (float) k;
    int l = k + (int) sign(1.1f, da);
    s = 0.1f*beta;
    int m = (int) s;
    if (m <= -3) m = -2;
    if (m >=  3) m = 2;
    float db = s - (float) m;
    int n = m + (int) sign(1.1f, db);
    float v = a.get(k,m) + Math.abs(da)*(a.get(l,m)-a.get(k,m));
    float w = a.get(k,n) + Math.abs(da)*(a.get(l,n)-a.get(k,n));
    return v + (w-v)*Math.abs(db);
  }
  private static final FortranArray2D dldaTable =
    new FortranArray2D(-2, 9, -3, 3, new float[] {
      -.041f,-.052f,-.053f,-.056f,-.050f,-.056f,-.082f,-.059f,-.042f,-.038f,-.027f,-.017f,      
      -.041f,-.053f,-.053f,-.053f,-.050f,-.051f,-.066f,-.043f,-.038f,-.027f,-.023f,-.016f,
      -.042f,-.053f,-.052f,-.051f,-.049f,-.049f,-.043f,-.035f,-.026f,-.016f,-.018f,-.014f,
      -.040f,-.052f,-.051f,-.052f,-.048f,-.048f,-.042f,-.037f,-.031f,-.026f,-.017f,-.012f,
      -.043f,-.049f,-.048f,-.049f,-.043f,-.042f,-.042f,-.036f,-.025f,-.021f,-.016f,-.011f,
      -.044f,-.048f,-.048f,-.047f,-.042f,-.041f,-.020f,-.028f,-.013f,-.014f,-.011f,-.010f,
      -.043f,-.049f,-.047f,-.045f,-.042f,-.037f,-.003f,-.013f,-.010f,-.003f,-.007f,-.008f
    });
    
  /** Computes the rolling moment due to rudder deflection for the
      F-16 aerodynamic model.
      
      @param alpha Angle of attack, deg  ( -10 <= ALPHA <= 45 )
      @param BETA  Sideslip angle, deg   ( -30 <= BETA <= 30 )
  */
  private static float dldr(float alpha, float beta) {
    FortranArray2D a = dldrTable;
    float s = 0.2f*alpha;
    int k = (int) s;
    if (k <= -2) k = -1;
    if (k >=  9) k =  8;
    float da = s - (float) k;
    int l = k + (int) sign(1.1f, da);
    s = 0.1f*beta;
    int m = (int) s;
    if (m <= -3) m = -2;
    if (m >=  3) m =  2;
    float db = s - (float) m;
    int n = m + (int) sign(1.1f, db);
    float v = a.get(k,m) + Math.abs(da)*(a.get(l,m)-a.get(k,m));
    float w = a.get(k,n) + Math.abs(da)*(a.get(l,n)-a.get(k,n));
    return v + (w-v)*Math.abs(db);
  }
  private static final FortranArray2D dldrTable =
    new FortranArray2D(-2, 9, -3, 3, new float[] {
      .005f,.017f,.014f,.010f,-.005f,.009f,.019f,.005f,.000f,-.005f,-.011f,.008f,      
      .007f,.016f,.014f,.014f, .013f,.009f,.012f,.005f,.000f, .004f, .009f,.007f,
      .013f,.013f,.011f,.012f, .011f,.009f,.008f,.005f,.000f, .005f, .003f,.005f,
      .018f,.015f,.015f,.014f, .014f,.014f,.014f,.015f,.013f, .011f, .006f,.001f,
      .015f,.014f,.013f,.013f, .012f,.011f,.011f,.010f,.008f, .008f, .007f,.003f,
      .021f,.011f,.010f,.011f, .010f,.009f,.008f,.010f,.006f, .005f, .000f,.001f,
      .023f,.010f,.011f,.011f, .011f,.010f,.008f,.010f,.006f, .014f, .020f,.000f
    });
    
  /** Computes the yawing moment due to aileron deflection for the
      F-16 aerodynamic model.

      @param alpha Angle of attack, deg  ( -10 <= ALPHA <= 45 )
      @param beta  Sideslip angle, deg   ( -30 <= BETA <= 30 )
  */
  private static float dnda(float alpha, float beta) {
    FortranArray2D a = dndaTable;
    float s = 0.2f*alpha;
    int k = (int) s;
    if (k <= -2) k = -1;
    if (k >=  9) k =  8;
    float da = s - (float) k;
    int l = k + (int) sign(1.1f, da);
    s = 0.1f*beta;
    int m = (int) s;
    if (m <= -3) m = -2;
    if (m >=  3) m =  2;
    float db = s - (float) m;
    int n = m + (int) sign(1.1f, db);
    float v = a.get(k,m) + Math.abs(da)*(a.get(l,m)-a.get(k,m));
    float w = a.get(k,n) + Math.abs(da)*(a.get(l,n)-a.get(k,n));
    return v + (w-v)*Math.abs(db);
  }
  private static final FortranArray2D dndaTable =
    new FortranArray2D(-2, 9, -3, 3, new float[] {
       .001f,-.027f,-.017f,-.013f,-.012f,-.016f, .001f, .017f, .011f,.017f, .008f,.016f,      
       .002f,-.014f,-.016f,-.016f,-.014f,-.019f,-.021f, .002f, .012f,.016f, .015f,.011f,
      -.006f,-.008f,-.006f,-.006f,-.005f,-.008f,-.005f, .007f, .004f,.007f, .006f,.006f,
      -.011f,-.011f,-.010f,-.009f,-.008f,-.006f, .000f, .004f, .007f,.010f, .004f,.010f,
      -.015f,-.015f,-.014f,-.012f,-.011f,-.008f,-.002f, .002f, .006f,.012f, .011f,.011f,
      -.024f,-.010f,-.004f,-.002f,-.001f, .003f, .014f, .006f,-.001f,.004f, .004f,.006f,
      -.022f, .002f,-.003f,-.005f,-.003f,-.001f,-.009f,-.009f,-.001f,.003f,-.002f,.001f
    });  


  /** Computes the yawing moment due to rudder deflection for the F-16
      aerodynamic model.

      @param alpha Angle of attack, deg  ( -10 <= ALPHA <= 45 )
      @param beta  Sideslip angle, deg  ( -30 <= BETA <= 30 )
  */
  private static float dndr(float alpha, float beta) {
    FortranArray2D a = dndrTable;
    float s = 0.2f*alpha;
    int k = (int) s;
    if (k <= -2) k = -1;
    if (k >=  9) k =  8;
    float da = s - (float) k;
    int l = k + (int) sign(1.1f, da);
    s = 0.1f*beta;
    int m = (int) s;
    if (m <= -3) m = -2;
    if (m >=  3) m =  2;
    float db = s - (float) m;
    int n = m + (int) sign(1.1f, db);
    float v = a.get(k,m) + Math.abs(da)*(a.get(l,m)-a.get(k,m));
    float w = a.get(k,n) + Math.abs(da)*(a.get(l,n)-a.get(k,n));
    return v + (w-v)*Math.abs(db);
  }
  private static final FortranArray2D dndrTable =
    new FortranArray2D(-2, 9, -3, 3, new float[] {
      -.018f,-.052f,-.052f,-.052f,-.054f,-.049f,-.059f,-.051f,-.030f,-.037f,-.026f,-.013f,      
      -.028f,-.051f,-.043f,-.046f,-.045f,-.049f,-.057f,-.052f,-.030f,-.033f,-.030f,-.008f,
      -.037f,-.041f,-.038f,-.040f,-.040f,-.038f,-.037f,-.030f,-.027f,-.024f,-.019f,-.013f,
      -.048f,-.045f,-.045f,-.045f,-.044f,-.045f,-.047f,-.048f,-.049f,-.045f,-.033f,-.016f,
      -.043f,-.044f,-.041f,-.041f,-.040f,-.038f,-.034f,-.035f,-.035f,-.029f,-.022f,-.009f,
      -.052f,-.034f,-.036f,-.036f,-.035f,-.028f,-.024f,-.023f,-.020f,-.016f,-.010f,-.014f,
      -.062f,-.034f,-.027f,-.028f,-.027f,-.027f,-.023f,-.023f,-.019f,-.009f,-.025f,-.010f
    });


  /** Computes the engine thrust and the time derivative of the engine
      power state for the F-16.

      @param pow    Engine power level, percent. ( 0 <= POW <= 100. )
      @param alt    Altitude, ft.                ( 0 <= ALT <= 50000. )
      @param rmach  Mach number.                 ( 0 <= RMACH <= 1.0 )
      @param thtl   Throttle setting.            ( 0 <= THTL <= 1.0 )
      @param engine Output. thrust = engine thrust, lbf; dpow = time
                    derivative of the engine power level, percent/sec.
  */
  private static void f16Engine(float pow, float alt, float rmach, float thtl,
                                F16Engine engine) {
    // Compute engine thrust.
    engine.thrust = engineThrust(pow, alt, rmach);
    // Compute commanded power level and power level time derivative.
    float cpow  = tgear(thtl);
    engine.dpow = pdot(pow,cpow);
  }


  /** Computes the thrust for the F-16 model.

      @param pow   Engine power level, percent. ( 0 <= POW <= 100. )
      @param alt   Altitude, ft.                ( 0 <= ALT <= 50000. )
      @param rmach Mach number.                 ( 0 <= RMACH <= 1.0 )
   */
  private static float engineThrust(float pow, float alt, float rmach) {
    FortranArray2D a = idlePowerData;
    FortranArray2D b = milPowerData;
    FortranArray2D c = maxPowerData;
    
    // Row index for altitude.
    float h = 0.0001f*alt;
    int i = (int) h;
    if (i >= 5) i = 4;
    float dh = h - (float) i;
    // Column index for mach number.
    float rm = 5.f*rmach;
    int m = (int) rm;
    if (m >= 5) m = 4;
    float dm = rm - (float) m;
    float cdh = 1.0f - dh;

    //
    // Compute mil thrust.
    //
    // Altitude interpolation.
    float s = b.get(i,m)*cdh + b.get(i+1,m)*dh;
    float t = b.get(i,m+1)*cdh + b.get(i+1,m+1)*dh;
    // Mach number interpolation.
    float tmil= s + (t-s)*dm;

    // Interpolate with idle or max thrust, depending on power level command.
    if (pow < 50.0f) {

      // Compute idle thrust.
      // Altitude interpolation.
      s = a.get(i,m)*cdh + a.get(i+1,m)*dh;
      t = a.get(i,m+1)*cdh + a.get(i+1,m+1)*dh;
      // Mach number interpolation.
      float tidl = s + (t-s)*dm;
      return tidl + (tmil-tidl)*pow/50.0f;

    } else {

      // Compute max thrust.
      // Altitude interpolation.
      s = c.get(i,m)*cdh + c.get(i+1,m)*dh;
      t = c.get(i,m+1)*cdh + c.get(i+1,m+1)*dh;
      // Mach number interpolation.
      float tmax = s + (t-s)*dm;
      return tmil + (tmax-tmil)*(pow-50.0f)*0.02f;
      
    }
  }      
  private static final FortranArray2D idlePowerData =
    new FortranArray2D(0, 5, 0, 5, new float[] {
       1060.f,  670.f,  880.f, 1140.f, 1500.f, 1860.f,
        635.f,  425.f,  690.f, 1010.f, 1330.f, 1700.f,
         60.f,   25.f,  345.f,  755.f, 1130.f, 1525.f,
      -1020.f, -710.f, -300.f,  350.f,  910.f, 1360.f,
      -2700.f,-1900.f,-1300.f, -247.f,  600.f, 1100.f,
      -3600.f,-1400.f, -595.f, -342.f, -200.f,  700.f
    });
  private static final FortranArray2D milPowerData =
    new FortranArray2D(0, 5, 0, 5, new float[] {
      12680.f, 9150.f, 6200.f, 3950.f, 2450.f, 1400.f,
      12680.f, 9150.f, 6313.f, 4040.f, 2470.f, 1400.f,
      12610.f, 9312.f, 6610.f, 4290.f, 2600.f, 1560.f,
      12640.f, 9839.f, 7090.f, 4660.f, 2840.f, 1660.f,
      12390.f,10176.f, 7750.f, 5320.f, 3250.f, 1930.f,
      11680.f, 9848.f, 8050.f, 6100.f, 3800.f, 2310.f
    });
  private static final FortranArray2D maxPowerData =
    new FortranArray2D(0, 5, 0, 5, new float[] {
      20000.f,15000.f,10800.f, 7000.f, 4000.f, 2500.f,
      21420.f,15700.f,11225.f, 7323.f, 4435.f, 2600.f,
      22700.f,16860.f,12250.f, 8154.f, 5000.f, 2835.f,
      24240.f,18910.f,13760.f, 9285.f, 5700.f, 3215.f,
      26070.f,21075.f,15975.f,11115.f, 6860.f, 3950.f,
      28886.f,23319.f,18300.f,13484.f, 8642.f, 5057.f
    });


  /** Computes the engine power level command, POW, for an input
      throttle setting, THTL, for the F-16 engine model.

      @param thtl Throttle setting.  ( 0 <= THTL <= 1.0 )
  */
  private static float tgear(float thtl) {
    if (thtl <= 0.77f) {
      return 64.94f*thtl;
    } else {
      return 217.38f*thtl-117.38f;
    }
  }


  /** Computes the rate of change in engine power level using a first
      order lag as a function of actual power, POW, and commanded
      power, CPOW, for the F-16 engine model.

      @param pow  Engine power level, percent.  ( 0 <= POW <= 100. )
      @param cpow Commanded engine power level, percent.  ( 0 <= CPOW <= 100. )
  */
  private static float pdot(float pow, float cpow) {
    float tpow = 0;
    float t = 0;

    if (cpow >= 50.0f) {
      if (pow >= 50.0f) {
        tpow = cpow;
        t = 5.0f;
      } else {
        tpow=60.0f;
        t=rtau(tpow-pow);
      }
    } else {
      if (pow >= 50.0f) {
        tpow = 40.0f;
        t = 5.0f;
      } else {
        tpow = cpow;
        t = rtau(tpow-pow);
      }
    }
    return t*(tpow-pow);
  }


  /** Computes the thrust lag reciprocal time constant for the F-16
      engine model.

      @param dp Change in power level, percent  ( 0 <= DP <= 100. )
  */
  private static float rtau(float dp) {
    if (dp <= 25.0f) return 1.0f;
    if (dp >= 50.0f) return 0.1f;
    return 1.9f - 0.036f*dp;
  }

  private static final float sign(float a, float b) {
    int s = ((b >= 0) ? 1 : -1);
    return s * Math.abs(a);
  }

  private static FortranArray1D initConstants() {
    // Computes mass properties for the F16 nonlinear model.
    // c[1] through c[9]  = inertia tensor elements.
    //              c[10] = aircraft mass, slugs.
    //              c[11] = xcg, longitudinal c.g. location,
    //                      distance normalized by the m.a.c.

    float g    = 32.174f;      // gravitational constant, ft/sec^2
    float mass = 20500.0f / g; // mass of the aircraft, slugs
    float xcg  = 0.35f;        // location of center of mass
    float ixx  = 9496.0f;      // inertial parameters
    float iyy  = 55814.0f;
    float izz  = 63100.0f;
    float ixz  = 982.0f;

    float gamma = ixx * izz - ixz * ixz;
    return new FortranArray1D(1, 11, new float[] {
      ((iyy - izz) * izz - ixz * ixz) / gamma,
      (ixx - iyy + izz) * ixz / gamma,
      izz / gamma,
      ixz / gamma,
      (izz - ixx) / iyy,
      ixz / iyy,
      1.0f / iyy,
      (ixx * (ixx - iyy) + ixz * ixz) / gamma,
      ixx / gamma,
      mass,
      xcg
    });
  }
}
