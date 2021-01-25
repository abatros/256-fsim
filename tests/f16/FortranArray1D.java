package f16;

/** Helper class for Fortran-to-Java transliteration */

public class FortranArray1D {
  private int idxOff;
  private float[] data;

  public FortranArray1D(int minIdx, int maxIdx) {
    idxOff = minIdx;
    int nEls = maxIdx - minIdx + 1;
    data = new float[nEls];
  }

  public FortranArray1D(int minIdx, int maxIdx, float[] data) {
    this(minIdx, maxIdx);
    set(data);
  }

  public void set(int el, float val) {
    data[ix(el)] = val;
  }

  public float get(int el) {
    return data[ix(el)];
  }

  public void set(float[] vals) {
    if (vals.length != data.length) {
      throw new IllegalArgumentException("Sizes must match");
    }
    System.arraycopy(vals, 0, data, 0, vals.length);
  }

  private int ix(int el) {
    return el - idxOff;
  }
}
