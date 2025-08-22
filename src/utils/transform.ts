import type { TransformMatrix, Vector2d } from "@/core/types/matrix";

const DEG180_OVER_PI = 180 / Math.PI;

export class Transform {
  m: TransformMatrix;
  private _decomposedCache: {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    skewX: number;
    skewY: number;
  } | null = null;
  private _invertedCache: Transform | null = null;
  private _isDirty = true;

  constructor(m = [1, 0, 0, 1, 0, 0]) {
    this.m = ((m && m.slice()) || [1, 0, 0, 1, 0, 0]) as TransformMatrix;
  }
  private _invalidateCache() {
    this._isDirty = true;
    this._decomposedCache = null;
    this._invertedCache = null;
  }

  reset() {
    this.m[0] = 1;
    this.m[1] = 0;
    this.m[2] = 0;
    this.m[3] = 1;
    this.m[4] = 0;
    this.m[5] = 0;
    this._invalidateCache();
  }

  copy() {
    return new Transform(this.m);
  }
  copyInto(tr: Transform) {
    tr.m[0] = this.m[0];
    tr.m[1] = this.m[1];
    tr.m[2] = this.m[2];
    tr.m[3] = this.m[3];
    tr.m[4] = this.m[4];
    tr.m[5] = this.m[5];
  }
  point(point: Vector2d) {
    const m = this.m;
    return {
      x: m[0] * point.x + m[2] * point.y + m[4],
      y: m[1] * point.x + m[3] * point.y + m[5],
    };
  }
  translate(x: number, y: number) {
    this.m[4] += this.m[0] * x + this.m[2] * y;
    this.m[5] += this.m[1] * x + this.m[3] * y;
    this._invalidateCache();
    return this;
  }
  scale(sx: number, sy: number) {
    this.m[0] *= sx;
    this.m[1] *= sx;
    this.m[2] *= sy;
    this.m[3] *= sy;
    this._invalidateCache();
    return this;
  }
  rotate(rad: number) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const m11 = this.m[0] * c + this.m[2] * s;
    const m12 = this.m[1] * c + this.m[3] * s;
    const m21 = this.m[0] * -s + this.m[2] * c;
    const m22 = this.m[1] * -s + this.m[3] * c;
    this.m[0] = m11;
    this.m[1] = m12;
    this.m[2] = m21;
    this.m[3] = m22;
    this._invalidateCache();
    return this;
  }
  getTranslation() {
    return {
      x: this.m[4],
      y: this.m[5],
    };
  }
  skew(sx: number, sy: number) {
    const m11 = this.m[0] + this.m[2] * sy;
    const m12 = this.m[1] + this.m[3] * sy;
    const m21 = this.m[2] + this.m[0] * sx;
    const m22 = this.m[3] + this.m[1] * sx;
    this.m[0] = m11;
    this.m[1] = m12;
    this.m[2] = m21;
    this.m[3] = m22;
    this._invalidateCache();
    return this;
  }
  multiply(matrix: Transform) {
    const m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1];
    const m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1];

    const m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3];
    const m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];

    const dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4];
    const dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];

    this.m[0] = m11;
    this.m[1] = m12;
    this.m[2] = m21;
    this.m[3] = m22;
    this.m[4] = dx;
    this.m[5] = dy;
    this._invalidateCache();
    return this;
  }
  /**
   * 获取逆矩阵
   */
  invert(): Transform {
    if (!this._invertedCache || this._isDirty) {
      const d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
      const m0 = this.m[3] * d;
      const m1 = -this.m[1] * d;
      const m2 = -this.m[2] * d;
      const m3 = this.m[0] * d;
      const m4 = d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
      const m5 = d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
      
      this._invertedCache = new Transform([m0, m1, m2, m3, m4, m5]);
    }
    return this._invertedCache.copy();
  }
  decompose() {
    if (!this._decomposedCache || this._isDirty) {
      const a = this.m[0];
      const b = this.m[1];
      const c = this.m[2];
      const d = this.m[3];
      const e = this.m[4];
      const f = this.m[5];

      const delta = a * d - b * c;

      const result = {
        x: e,
        y: f,
        rotation: 0,
        scaleX: 0,
        scaleY: 0,
        skewX: 0,
        skewY: 0,
      };

      if (a != 0 || b != 0) {
        const r = Math.sqrt(a * a + b * b);
        result.rotation = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
        result.scaleX = r;
        result.scaleY = delta / r;
        result.skewX = (a * c + b * d) / delta;
        result.skewY = 0;
      } else if (c != 0 || d != 0) {
        const s = Math.sqrt(c * c + d * d);
        result.rotation =
          Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
        result.scaleX = delta / s;
        result.scaleY = s;
        result.skewX = 0;
        result.skewY = (a * c + b * d) / delta;
      } else {
        // a = b = c = d = 0
      }

      result.rotation = radToDeg(result.rotation);
      
      this._decomposedCache = result;
      this._isDirty = false;
    }

    // 返回缓存的副本，避免外部修改
    return { ...this._decomposedCache };
  }
}

export const radToDeg = (rad: number) => {
  return rad * DEG180_OVER_PI;
}

/**
 * Transform 工具方法
 */
export class TransformUtils {
  /**
   * 创建平移变换
   */
  static createTranslation(x: number, y: number): Transform {
    return new Transform().translate(x, y);
  }

  /**
   * 创建旋转变换
   */
  static createRotation(degrees: number): Transform {
    return new Transform().rotate(degrees * Math.PI / 180);
  }

  /**
   * 创建缩放变换
   */
  static createScale(scaleX: number, scaleY: number = scaleX): Transform {
    return new Transform().scale(scaleX, scaleY);
  }

  /**
   * 创建倾斜变换
   */
  static createSkew(skewX: number, skewY: number = 0): Transform {
    return new Transform().skew(
      skewX * Math.PI / 180,
      skewY * Math.PI / 180
    );
  }

  /**
   * 创建复合变换
   */
  static createTransform(config: {
    x?: number;
    y?: number;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
    skewX?: number;
    skewY?: number;
  }): Transform {
    const transform = new Transform();

    if (config.x !== undefined || config.y !== undefined) {
      transform.translate(config.x || 0, config.y || 0);
    }

    if (config.rotation !== undefined) {
      transform.rotate(config.rotation * Math.PI / 180);
    }

    if (config.scaleX !== undefined || config.scaleY !== undefined) {
      transform.scale(config.scaleX || 1, config.scaleY || config.scaleX || 1);
    }

    if (config.skewX !== undefined || config.skewY !== undefined) {
      transform.skew(
        (config.skewX || 0) * Math.PI / 180,
        (config.skewY || 0) * Math.PI / 180
      );
    }

    return transform;
  }

  /**
   * 计算两点之间的距离
   */
  static distance(point1: Vector2d, point2: Vector2d): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 计算点的角度（相对于原点）
   */
  static angle(point: Vector2d): number {
    return Math.atan2(point.y, point.x) * DEG180_OVER_PI;
  }

  /**
   * 旋转点
   */
  static rotatePoint(point: Vector2d, angle: number, center: Vector2d = { x: 0, y: 0 }): Vector2d {
    const transform = new Transform()
      .translate(center.x, center.y)
      .rotate(angle * Math.PI / 180)
      .translate(-center.x, -center.y);

    return transform.point(point);
  }

  /**
   * 计算边界框
   */
  static getBounds(points: Vector2d[]): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    if (points.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
}
