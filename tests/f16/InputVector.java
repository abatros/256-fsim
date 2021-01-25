package f16;

/** Input vector for F16 simulator. */

public class InputVector {
  // These values are symmetric; i.e., elevator ranges from -25 to +25
  public static final float MAX_ELEVATOR_MAG = 25.0f;
  public static final float MAX_AILERON_MAG  = 21.5f;
  public static final float MAX_RUDDER_MAG   = 30.0f;

  private float throttle;     // 0 <= throttle <= 1.0f
  private float elevator;     // degrees
  private float aileron;      // degrees
  private float rudder;       // degrees
  private float vxTurbulence; // ft/sec
  private float vyTurbulence; // ft/sec
  private float vzTurbulence; // ft/sec

  public void  setThrottle(float val) { throttle = val; }
  public float throttle()             { return throttle; }

  /** In degrees; see MAX_ELEVATOR_MAG, above */
  public void  setElevator(float val) { elevator = val; }
  /** In degrees; see MAX_ELEVATOR_MAG, above */
  public float elevator()             { return elevator; }

  /** In degrees; see MAX_AILERON_MAG, above */
  public void  setAileron(float val) { aileron = val; }
  /** In degrees; see MAX_AILERON_MAG, above */
  public float aileron()             { return aileron; }

  /** In degrees; see MAX_RUDDER_MAG, above */
  public void  setRudder(float val) { rudder = val; }
  /** In degrees; see MAX_RUDDER_MAG, above */
  public float rudder()             { return rudder; }

  public void  setVxTurbulence(float val) { vxTurbulence = val; }
  public float vxTurbulence()             { return vxTurbulence; }

  public void  setVyTurbulence(float val) { vyTurbulence = val; }
  public float vyTurbulence()             { return vyTurbulence; }

  public void  setVzTurbulence(float val) { vzTurbulence = val; }
  public float vzTurbulence()             { return vzTurbulence; }
}
