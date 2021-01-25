package f16;

/** Helper class for Fortran-to-Java transliteration */

public class FortranArray2D {
  private int colIdxOff;
  private int rowIdxOff;
  private int nRows;
  private int nCols;
  private float[] data;

  public FortranArray2D(int minColIdx, int maxColIdx, int minRowIdx, int maxRowIdx) {
    colIdxOff = minColIdx;
    rowIdxOff = minRowIdx;
    nCols = maxColIdx - minColIdx + 1;
    nRows = maxRowIdx - minRowIdx + 1;
    data = new float[nCols * nRows];
  }

  public FortranArray2D(int minColIdx, int maxColIdx, int minRowIdx, int maxRowIdx, float[] data) {
    this(minColIdx, maxColIdx, minRowIdx, maxRowIdx);
    set(data);
  }

  public void set(int col, int row, float val) {
    data[ix(col, row)] = val;
  }

  public float get(int col, int row) {
    return data[ix(col, row)];
  }

  public void set(float[] vals) {
    if (vals.length != data.length) {
      throw new IllegalArgumentException("Sizes must match");
    }
    System.arraycopy(vals, 0, data, 0, vals.length);
  }

  private int ix(int col, int row) {
    return (row - rowIdxOff) * nCols + (col - colIdxOff);
  }
}
