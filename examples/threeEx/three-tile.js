import { Vector3 as m, PlaneGeometry as G, MeshBasicMaterial as J, Mesh as be, Matrix4 as Pt, Frustum as jt, Box3 as Ye, MathUtils as Z, MeshLambertMaterial as At, FrontSide as Dt, Float32BufferAttribute as ue, Loader as ie, LoadingManager as It, Vector2 as T, Box2 as Qe, Texture as we, SRGBColorSpace as Ot, Raycaster as Je, Clock as et, CanvasTexture as zt, MeshNormalMaterial as Ct, Color as xe, Ray as kt, Plane as Rt, EventDispatcher as tt, MOUSE as F, TOUCH as Y, Quaternion as Ze, Spherical as Ge, Scene as Bt, FogExp2 as Ue, WebGLRenderer as Ft, PerspectiveCamera as Nt, AmbientLight as Yt, DirectionalLight as Zt, ShaderMaterial as Gt, UniformsUtils as Ut, UniformsLib as Wt } from "three";
const Ko = "0.6.2", $o = {
  name: "GuoJiangfeng",
  email: "hz_gjf@163.com"
}, Ht = new m();
function Xt(i, t, o) {
  const e = i.position.clone().setZ(o).applyMatrix4(i.matrixWorld);
  return t.distanceTo(e);
}
function Kt(i) {
  const t = new m(-0.5, -0.5, 0).applyMatrix4(i.matrixWorld), o = new m(0.5, 0.5, 0).applyMatrix4(i.matrixWorld);
  return t.sub(o).length();
}
function We(i, t) {
  const o = t.getWorldPosition(Ht), e = Xt(i, o, i.avgZ), s = Kt(i), n = e / s;
  return Math.log10(n) * 5 + 0.5;
}
var ye = /* @__PURE__ */ ((i) => (i[i.none = 0] = "none", i[i.create = 1] = "create", i[i.remove = 2] = "remove", i))(ye || {});
function $t(i, t, o, e, s) {
  if (i.coord.z > o && i.index === 0 && i.parent?.isTile) {
    const a = We(i.parent, t);
    if (i.coord.z > e || a > s * 1.02)
      return 2;
  }
  if (i.coord.z < e && i.isLeafInFrustum) {
    const a = We(i, t);
    if (i.userData.dist = a, i.coord.z < o || a < s / 1.02)
      return 1;
  }
  return 0;
}
function H(i, t, o, e, s) {
  const n = new ne(i, t, o);
  return n.position.copy(e), n.scale.copy(s), n;
}
function Vt(i, t = !1) {
  if (i.isTile) {
    const o = i.coord.z + 1, e = i.coord.x * 2, s = 0, n = 1 / 4;
    if (i.coord.z === 0 && t) {
      const a = i.coord.y, c = new m(0.5, 1, 1);
      i.add(H(e, a, o, new m(-n, 0, s), c)), i.add(H(e + 1, a, o, new m(n, 0, s), c));
    } else {
      const a = i.coord.y * 2, c = new m(0.5, 0.5, 1);
      i.add(H(e, a + 1, o, new m(-n, -n, s), c)), i.add(H(e + 1, a + 1, o, new m(n, -n, s), c)), i.add(H(e, a, o, new m(-n, n, s), c)), i.add(H(e + 1, a, o, new m(n, n, s), c));
    }
    i.traverse((a) => {
      a.updateMatrix(), a.updateMatrixWorld(), a.receiveShadow = i.receiveShadow, a.castShadow = i.castShadow;
    });
  }
  return i.children;
}
const me = new G(), pe = new J({ color: 16711680 });
class ne extends be {
  /** coordinate of tile */
  coord;
  /** is a tile? */
  isTile = !0;
  /** tile parent */
  parent = null;
  /** children of tile */
  children = [];
  /** max height of tile */
  maxZ = 0;
  /** min height of tile */
  minZ = 0;
  /** avg height of tile */
  avgZ = 0;
  /** index of tile, mean positon in parent.
   *  (0:left-bottom, 1:right-bottom,2:left-top、3:right-top、-1:parent is null）
   */
  get index() {
    return this.parent ? this.parent.children.indexOf(this) : -1;
  }
  /* downloading abort controller */
  _abortController = new AbortController();
  /** singnal of abort when downloading  */
  get abortSignal() {
    return this._abortController.signal;
  }
  _loadState = "empty";
  /** get the tile load state*/
  get loadState() {
    return this._loadState;
  }
  _toLoad = !1;
  /** needs to load? */
  get _needsLoad() {
    return this.inFrustum && this._toLoad && this.loadState === "empty";
  }
  _inFrustum = !1;
  /** is tile in frustum? */
  get inFrustum() {
    return this._inFrustum;
  }
  /** set tile is in frustum */
  set inFrustum(t) {
    this._inFrustum != t && (this._inFrustum = t, t ? this._toLoad = this.isLeaf : this.dispose(!0));
  }
  /** is leaf in frustum ? */
  get isLeafInFrustum() {
    return this.inFrustum && this.isLeaf;
  }
  _isTemp = !1;
  /** set the tile to temp*/
  set isTemp(t) {
    if (this._isTemp = t, this.material.forEach((o) => {
      "wireframe" in o && (o.wireframe = t || o.userData.wireframe);
    }), !t) {
      const o = this._getLoadedParent();
      o && o.loadState;
    }
  }
  /** is leaf?  */
  get isLeaf() {
    return this.children.length === 0;
  }
  /**
   * constructor
   * @param x tile X-coordinate, default:0
   * @param y tile X-coordinate, default:0
   * * @param z tile level, default:0
   */
  constructor(t = 0, o = 0, e = 0) {
    super(me, [pe]), this.coord = { x: t, y: o, z: e }, this.name = `Tile ${e}-${t}-${o}`, this.matrixAutoUpdate = !1, this.matrixWorldAutoUpdate = !1;
  }
  /**
   * Override Obejct3D.traverse, change the callback param type to "this"
   * @param callback callback
   */
  traverse(t) {
    t(this), this.children.forEach((o) => {
      o.traverse(t);
    });
  }
  /**
   * Override mesh.raycast，only called when tile has loaded
   * @param raycaster
   * @param intersects
   */
  // public raycast(raycaster: Raycaster, intersects: Intersection[]): void {
  // 	if (this.loadState === "loaded") {
  // 		super.raycast(raycaster, intersects);
  // 	}
  // }
  /**
   * Level Of Details
   * @param camera
   * @param minLevel min level for LOD
   * @param maxLevel max level for LOD
   * @param threshold threshold for LOD
   * @param isWGS is WGS projection?
   * @returns new tiles
   */
  _lod(t, o, e, s, n) {
    let a = [];
    const c = $t(this, t, o, e, s);
    if (c === ye.create)
      a = Vt(this, n), this._toLoad = !1;
    else if (c === ye.remove) {
      const d = this.parent;
      d?.isTile && (d._toLoad = !0);
    }
    return a;
  }
  /**
   * load data
   * @param loader data loader
   * @returns Promise<void>
   */
  _load(t) {
    return this._needsLoad ? (this._abortController = new AbortController(), this._loadState = "loading", new Promise((o, e) => {
      t.load(
        this,
        () => o(this._onLoad()),
        (s) => o(this._onError(s))
      );
    })) : Promise.resolve();
  }
  /**
   * callback function when error. (include abort)
   * @param err error message
   */
  _onError(t) {
    this._toLoad = !1, t.name === "AbortError" ? console.assert(this._loadState === "empty") : (this._loadState = "loaded", console.error(t.message || t.type || t));
  }
  /**
   * Recursion to find loaded parent (hide when parent showing)
   * @returns loaded parent or null
   */
  _getLoadedParent() {
    const t = this.parent;
    return !t || !t.isTile ? null : t.loadState === "loaded" && !t._isTemp ? t : t._getLoadedParent();
  }
  _checkVisible() {
    const t = [];
    this.traverse((e) => t.push(e));
    const o = !t.filter((e) => e.isLeafInFrustum).some((e) => e.loadState != "loaded");
    return o && t.forEach((e) => {
      e.isLeaf ? e.isTemp = !1 : e.dispose(!1);
    }), o;
  }
  /**
   * tile loaded callback
   */
  _onLoad() {
    this._loadState = "loaded", this.material.forEach((t) => {
      "wireframe" in t && (t.userData.wireframe = t.wireframe);
    }), this._updateHeight(), !this.isLeaf && this._toLoad && (this.children.forEach((t) => t.dispose(!0)), this.clear()), this.isTemp = this._getLoadedParent() != null, this._toLoad = !1, this._getLoadedParent()?._checkVisible();
  }
  // update height
  _updateHeight() {
    this.geometry.computeBoundingBox(), this.maxZ = this.geometry.boundingBox?.max.z || 0, this.minZ = this.geometry.boundingBox?.min.z || 0, this.avgZ = (this.maxZ + this.minZ) / 2;
  }
  /**
   * abort download
   */
  abortLoad() {
    this._abortController.abort();
  }
  /**
   * free the tile
   * @param removeChildren remove children?
   */
  dispose(t) {
    return this.loadState != "empty" && this._dispose(), t && (this.children.forEach((o) => {
      o.dispose(t), o.clear();
    }), this.clear()), this;
  }
  _dispose() {
    this.abortLoad(), this._loadState = "empty", this.isTemp = !0, this._toLoad = !1, this.material[0] != pe && (this.material.forEach((t) => t.dispose()), this.material = [pe]), this.geometry != me && (this.geometry.dispose(), this.geometry.groups = [], this.geometry = me), this.dispatchEvent({ type: "dispose" });
  }
}
const qt = new Pt(), He = new jt();
class Qt extends ne {
  _treeReadyCount = 0;
  _autoLoad = !0;
  _loader;
  _minLevel = 0;
  /**
   * Get minLevel of the map
   */
  get minLevel() {
    return this._minLevel;
  }
  /**
   * Set minLevel of the map,
   */
  set minLevel(t) {
    this._minLevel = t;
  }
  _maxLevel = 19;
  /**
   * Get maxLevel of the map
   */
  get maxLevel() {
    return this._maxLevel;
  }
  /**
   * Set  maxLevel of the map
   */
  set maxLevel(t) {
    this._maxLevel = t;
  }
  _LODThreshold = 1;
  /**
   * Get LOD threshold
   */
  get LODThreshold() {
    return this._LODThreshold;
  }
  /**
   * Set LOD threshold
   */
  set LODThreshold(t) {
    this._LODThreshold = t;
  }
  /**
   * Is the map WGS projection
   */
  isWGS = !1;
  /**
   * Get tile loader
   */
  get loader() {
    return this._loader;
  }
  /**
   * Set tile loader
   */
  set loader(t) {
    this._loader = t;
  }
  /**
   * Get whether allow tile data to update, default true.
   */
  get autoLoad() {
    return this._autoLoad;
  }
  /**
   * Set whether allow tile data to update, default true.
   * true: load data on the scene update every frame it is rendered.
   * false: do not load data, only update tile true.
   */
  set autoLoad(t) {
    this._autoLoad = t;
  }
  _vierwerBufferSize = 0.6;
  // tile bounds, used to decide the tile in frustum, it greater than tile size to cache
  _tileBox = new Ye(
    new m(-this.viewerbufferSize, -this.viewerbufferSize, 0),
    new m(this.viewerbufferSize, this.viewerbufferSize, 9)
  );
  /**
   * Get renderer cache size scale. (0.5-2.5，default: 0.6)
   */
  get viewerbufferSize() {
    return this._vierwerBufferSize;
  }
  /**
   * Get renderer cache size. (0.5-2.5，default: 0.6)
   */
  set viewerbufferSize(t) {
    this._vierwerBufferSize = Z.clamp(t, 0.5, 2.5), this._tileBox = new Ye(
      new m(-this.viewerbufferSize, -this.viewerbufferSize, 0),
      new m(this.viewerbufferSize, this.viewerbufferSize, 9)
    );
  }
  /**
   * Constructor
   * @param loader tile data loader
   * @param level tile level, default:0
   * @param x tile X-coordinate, default:0
   * @param y tile y-coordinate, default:0
   */
  constructor(t, o = 0, e = 0, s = 0) {
    super(o, e, s), this._loader = t, this.matrixAutoUpdate = !0, this.matrixWorldAutoUpdate = !0;
  }
  /**
   * Update tile tree and tile data. It needs called on the scene update every frame.
   * @param camera
   */
  update(t) {
    return this._updateTileTree(t) ? this._treeReadyCount = 0 : this._treeReadyCount = Math.min(this._treeReadyCount + 1, 100), this.autoLoad && this._treeReadyCount > 10 && this._updateTileData(), this;
  }
  /**
   * Reload data, Called to take effect after source has changed
   */
  reload() {
    return this.dispose(!0), this;
  }
  /**
   * Update tile tree use LOD
   * @param camera  camera
   * @returns  the tile tree has changed
   */
  _updateTileTree(t) {
    let o = !1;
    return He.setFromProjectionMatrix(qt.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse)), this.traverse((e) => {
      if (e.isTile) {
        e.geometry.computeBoundingBox(), e.geometry.computeBoundingSphere(), e.inFrustum = He.intersectsBox(this._tileBox.clone().applyMatrix4(e.matrixWorld));
        const s = e._lod(t, this.minLevel, this.maxLevel, this.LODThreshold, this.isWGS);
        s.forEach((n) => {
          this.dispatchEvent({ type: "tile-created", tile: n });
        }), s.length > 0 && (o = !0);
      }
    }), o;
  }
  /**
   *  Update tileTree data
   */
  _updateTileData() {
    return this.traverse((t) => {
      t.isTile && t._load(this.loader).then(() => {
        t.loadState === "loaded" && (this._updateVisibleHight(), this.dispatchEvent({ type: "tile-loaded", tile: t }));
      });
    }), this;
  }
  /**
   * Update height of tiles in view
   */
  _updateVisibleHight() {
    let t = 0, o = 0;
    this.maxZ = 0, this.minZ = 9e3, this.traverse((e) => {
      e.isTile && e.isLeafInFrustum && e.loadState === "loaded" && (this.maxZ = Math.max(this.maxZ, e.maxZ), this.minZ = Math.min(this.minZ, e.minZ), t += e.avgZ, o++);
    }), o > 0 && (this.avgZ = t / o);
  }
}
class Jt extends At {
  constructor(t = { transparent: !0, side: Dt }) {
    super(t);
  }
}
class Vo extends G {
  build(t, o) {
    this.dispose(), this.copy(new G(1, 1, o - 1, o - 1));
    const e = this.getAttribute("position");
    for (let s = 0; s < e.count; s++)
      e.setZ(s, t[s]);
  }
  setData(t, o) {
    if (t.length != o * o)
      throw "DEM array size error!";
    return this.build(t, o), this.computeBoundingBox(), this.computeBoundingSphere(), this.computeVertexNormals(), this;
  }
}
class eo extends G {
  _min = 0;
  /**
   * buile
   * @param dem 2d array of dem
   * @param tileSize tile size
   */
  build(t, o) {
    this.dispose();
    const e = 1, s = 1, n = o - 1, a = o - 1, c = e / 2, d = s / 2;
    let h = Math.floor(n), u = Math.floor(a);
    const v = e / h, w = s / u;
    h += 2, u += 2;
    const b = h + 1, M = u + 1, E = [], O = [], z = [], C = [];
    let A = 0;
    this._min = Math.min(...Array.from(t));
    for (let x = 0; x < M; x++)
      for (let y = 0; y < b; y++) {
        let D = (y - 1) * v - c, g = (x - 1) * w - d, j = (y - 1) / (h - 2), I = 1 - (x - 1) / (u - 2);
        D = Z.clamp(D, -0.5, 0.5), g = Z.clamp(g, -0.5, 0.5), j = Z.clamp(j, 0, 1), I = Z.clamp(I, 0, 1);
        let X = 0;
        x === 0 || x === M - 1 || y === 0 || y === b - 1 ? X = this._min - 0.01 : (X = t[A], A++), O.push(D, -g, X), z.push(0, 0, 1), C.push(j, I);
      }
    for (let x = 0; x < u; x++)
      for (let y = 0; y < h; y++) {
        const D = y + b * x, g = y + b * (x + 1), j = y + 1 + b * (x + 1), I = y + 1 + b * x;
        E.push(D, g, I), E.push(g, j, I);
      }
    return this.setIndex(E), this.setAttribute("position", new ue(O, 3)), this.setAttribute("normal", new ue(z, 3)), this.setAttribute("uv", new ue(C, 2)), this;
  }
  /**
   * set the tile dem data
   * @param dem 2d dem array
   * @param tileSize dem size
   * @returns this
   */
  setData(t, o) {
    if (t.length != o * o)
      throw "DEM array size error!";
    return this.build(t, o), this.computeBoundingBox(), this.computeBoundingSphere(), this.computeVertexNormals(), this;
  }
  // set normal on edge(skirt)
  // 瓦片边缘法向量计算比较复杂，需要根据相邻瓦片高程计算，暂未完美实现
  // 考虑使用Mapbox Terrain-DEM v1格式地形 https://docs.mapbox.com/data/tilesets/reference/mapbox-terrain-dem-v1/
  computeVertexNormals() {
    super.computeVertexNormals();
    const t = this.index, o = this.getAttribute("position"), e = this.getAttribute("normal"), s = new m(), n = new m(), a = new m(), c = new m(0, 0, 1);
    function d(h) {
      return e.setXYZ(h, c.x, c.y, c.z);
    }
    if (t)
      for (let h = 0, u = t.count; h < u; h += 3) {
        const v = t.getX(h + 0), w = t.getX(h + 1), b = t.getX(h + 2);
        s.fromBufferAttribute(o, v), n.fromBufferAttribute(o, w), a.fromBufferAttribute(o, b), (s.z < this._min || n.z < this._min || a.z < this._min) && (d(v), d(w), d(b));
      }
    e.needsUpdate = !0;
  }
}
class se {
  static enabled = !0;
  static size = 500;
  static files = /* @__PURE__ */ new Map();
  static add(t, o) {
    if (!this.enabled || this.files.has(t))
      return;
    this.files.set(t, o);
    const e = Array.from(this.files.keys()), s = this.files.size - this.size;
    for (let n = 0; n < s; n++)
      this.remove(e[n]);
    console.assert(this.files.size <= this.size);
  }
  static get(t) {
    if (this.enabled)
      return this.files.get(t);
  }
  static remove(t) {
    this.files.delete(t);
  }
  static clear() {
    this.files.clear();
  }
}
class to extends Error {
  response;
  constructor(t, o) {
    super(t), this.response = o;
  }
}
class oo extends ie {
  mimeType;
  responseType;
  constructor(t) {
    super(t);
  }
  load(t, o, e, s, n) {
    this.path !== void 0 && (t = this.path + t), t = this.manager.resolveURL(t);
    const a = se.get(t);
    if (a)
      return this.manager.itemStart(t), setTimeout(() => {
        o && o(a), this.manager.itemEnd(t);
      }), a;
    if (n?.aborted) {
      console.log("aborted befor load");
      return;
    }
    const c = new Request(t, {
      headers: new Headers(this.requestHeader),
      credentials: this.withCredentials ? "include" : "same-origin",
      // An abort controller could be added within a future PR
      signal: n
    }), d = this.mimeType, h = this.responseType;
    fetch(c).then((u) => {
      if (u.status === 200 || u.status === 0)
        return u.status === 0 && console.warn("THREE.FileLoader: HTTP Status 0 received."), u;
      throw new to(
        `fetch for "${u.url}" responded with ${u.status}: ${u.statusText}`,
        u
      );
    }).then((u) => {
      switch (h) {
        case "arraybuffer":
          return u.arrayBuffer();
        case "blob":
          return u.blob();
        case "document":
          return u.text().then((v) => new DOMParser().parseFromString(v, d));
        case "json":
          return u.json();
        default:
          if (d === void 0)
            return u.text();
          {
            const w = /charset="?([^;"\s]*)"?/i.exec(d), b = w && w[1] ? w[1].toLowerCase() : void 0, M = new TextDecoder(b);
            return u.arrayBuffer().then((E) => M.decode(E));
          }
      }
    }).then((u) => {
      se.add(t, u), o && o(u);
    }).catch((u) => {
      s && s(u), u.name != "AbortError" && this.manager.itemError(t);
    }).finally(() => {
      this.manager.itemEnd(t);
    }), this.manager.itemStart(t);
  }
  setResponseType(t) {
    return this.responseType = t, this;
  }
  setMimeType(t) {
    return this.mimeType = t, this;
  }
}
const L = {
  manager: new It(),
  // dict of dem loader
  demLoaderMap: /* @__PURE__ */ new Map(),
  // dict of img loader
  imgLoaderMap: /* @__PURE__ */ new Map(),
  /**
   * register material loader
   * @param loader material loader
   */
  registerMaterialLoader(i) {
    L.imgLoaderMap.set(i.dataType, i), console.log(`* Register imageLoader: ${i.dataType}`);
  },
  /**
   * register geometry loader
   * @param loader geometry loader
   */
  registerGeometryLoader(i) {
    L.demLoaderMap.set(i.dataType, i), console.log(`* Register terrainLoader: ${i.dataType}`);
  },
  /**
   * get material loader from datasource
   * @param source datasource
   * @returns material loader
   */
  getMaterialLoader(i) {
    const t = L.imgLoaderMap.get(i.dataType);
    if (t)
      return t;
    throw `Source dataType "${i.dataType}" is not support!`;
  },
  /**
   * get geometry loader from datasource
   * @param source datasouce
   * @returns geometry loader
   */
  getGeometryLoader(i) {
    const t = L.demLoaderMap.get(i.dataType);
    if (t)
      return t;
    throw `Source dataType "${i.dataType}" is not support!`;
  }
}, ro = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
class ot extends ie {
  loader = new oo(L.manager);
  constructor(t) {
    super(t), this.loader.setResponseType("blob");
  }
  /**
   * load image
   * @param url imageurl
   * @param onLoad callback when loaded and abort and error
   * @param onProgress callback when progress
   * @param onError callback when error
   * @param abortSignal signal of abort loading
   * @returns image
   */
  load(t, o, e, s, n) {
    const a = new Image(), c = (u) => {
      h(), o && o(a);
    }, d = (u) => {
      h(), s && s(u), a.src = ro;
    }, h = () => {
      a.removeEventListener("load", c, !1), a.removeEventListener("error", d, !1);
    };
    return a.addEventListener("load", c, !1), a.addEventListener("error", d, !1), this.crossOrigin, this.requestHeader, this.loader.load(
      t,
      (u) => {
        o && (a.src = URL.createObjectURL(u));
      },
      e,
      s,
      n
    ), a;
  }
}
function rt(i, t) {
  i.translate(new T(0.5, 0.5));
  const o = Math.floor(i.min.x * t), e = Math.floor(i.min.y * t), s = Math.floor((i.max.x - i.min.x) * t), n = Math.floor((i.max.y - i.min.y) * t);
  return { sx: o, sy: e, sw: s, sh: n };
}
function qo(i, t) {
  if (i.width <= t)
    return i;
  const o = document.createElement("canvas"), e = o.getContext("2d");
  o.width = t, o.height = t;
  const s = t - 2;
  e.drawImage(i, 0, 0, i.width, i.height, 1, 1, s, s);
  const n = e.getImageData(1, 1, s, s);
  return e.putImageData(n, 0, 0), o;
}
function st(i, t) {
  if (t.coord.z < i.minLevel)
    return {
      url: void 0
    };
  if (t.coord.z <= i.maxLevel)
    return {
      url: i.getTileUrl(t.coord.x, t.coord.y, t.coord.z),
      bounds: new Qe(new T(-0.5, -0.5), new T(0.5, 0.5))
    };
  const o = so(t, i.maxLevel);
  return { url: i.getTileUrl(
    o.tile.coord.x,
    o.tile.coord.y,
    o.tile.coord.z
  ), bounds: o.bounds };
}
function so(i, t) {
  const o = new m(), e = new T(1, 1);
  for (; i.coord.z > t && (o.applyMatrix4(i.matrix), e.multiplyScalar(0.5), i.parent instanceof ne); )
    i = i.parent;
  o.setY(-o.y);
  const s = new Qe().setFromCenterAndSize(new T(o.x, o.y), e);
  return { tile: i, bounds: s };
}
class io extends ie {
  /** get loader cache size of file  */
  get cacheSize() {
    return se.size;
  }
  /** set loader cache size of file  */
  set cacheSize(t) {
    se.size = t;
  }
  _imgSource = [];
  /** get image source */
  get imgSource() {
    return this._imgSource;
  }
  /** set image source */
  set imgSource(t) {
    this._imgSource = t;
  }
  _demSource;
  /** get dem source */
  get demSource() {
    return this._demSource;
  }
  /** set dem source */
  set demSource(t) {
    this._demSource = t;
  }
  /**
   * constructor
   */
  constructor() {
    super(L.manager);
  }
  /**
   * load material and geometry data
   * @param tile tile to load
   * @param onLoad callback on data loaded
   * @returns geometry, material(s)
   */
  load(t, o, e) {
    if (this.imgSource.length === 0)
      throw new Error("imgSource can not be empty");
    const s = () => {
      if (n && a) {
        for (let h = 0; h < d.length; h++)
          c.addGroup(0, 1 / 0, h);
        o();
      }
    };
    let n = !1, a = !1;
    const c = this.loadGeometry(
      t,
      () => {
        n = !0, s();
      },
      e
    ), d = this.loadMaterial(
      t,
      () => {
        a = !0, s();
      },
      e
    );
    return t.geometry = c, t.material = d, { geometry: c, material: d };
  }
  /**
   * load geometry
   * @param tile tile to load
   * @param onLoad loaded callback
   * @param onError error callback
   * @returns geometry
   */
  loadGeometry(t, o, e) {
    let s;
    return this.demSource ? s = L.getGeometryLoader(this.demSource).load(this.demSource, t, o, e) : (s = new G(), setTimeout(o)), s;
  }
  /**
   * load material
   * @param tile tile to load
   * @param onLoad loaded callback
   * @param onError error callback
   * @returns material
   */
  loadMaterial(t, o, e) {
    const s = this.imgSource.map((n) => {
      const c = L.getMaterialLoader(n).load(
        n,
        t,
        () => {
          c.userData.loaded = !0, s.every((d) => d.userData.loaded) && o();
        },
        e
      );
      return c;
    });
    return s;
  }
}
const no = new we(new Image(1, 1));
class ao {
  // image loader
  loader = new ot(L.manager);
  /**
   * load the tile texture
   * @param tile tile to load
   * @param source datasource
   * @param onLoad callback
   * @returns texture
   */
  load(t, o, e, s) {
    const { url: n, bounds: a } = st(t, o);
    if (!n)
      return setTimeout(e, 10), no;
    const c = new we(new Image());
    return c.colorSpace = Ot, this.loader.load(
      n,
      // onLoad
      (d) => {
        o.coord.z > t.maxLevel ? c.image = co(d, a) : c.image = d, c.needsUpdate = !0, e();
      },
      // onProgress
      void 0,
      // onError
      s,
      o.abortSignal
    ), c;
  }
}
function co(i, t) {
  const o = i.width, e = new OffscreenCanvas(o, o), s = e.getContext("2d"), { sx: n, sy: a, sw: c, sh: d } = rt(t, i.width);
  return s.drawImage(i, n, a, c, d, 0, 0, o, o), e;
}
class lo {
  dataType = "image";
  load(t, o, e, s) {
    const n = (h) => {
      const u = h.target;
      u.map?.image instanceof ImageBitmap && u.map.image.close(), u.map?.dispose(), u.removeEventListener("dispose", n);
    }, a = this.createMaterial();
    a.opacity = t.opacity, a.addEventListener("dispose", n);
    const d = new ao().load(
      t,
      o,
      () => {
        a.map = d, d.needsUpdate = !0, e();
      },
      (h) => {
        s(h);
      }
    );
    return a;
  }
  createMaterial() {
    return new Jt();
  }
}
L.registerMaterialLoader(new lo());
class ho extends ie {
  dataType = "terrain-rgb";
  imageLoader = new ot(L.manager);
  /**
   * load tile's data from source
   * @param source
   * @param tile
   * @param onLoad
   * @param onError
   * @returns
   */
  load(t, o, e, s) {
    const { url: n, bounds: a } = st(t, o);
    return n ? this._load(o, n, a, e, s) : (setTimeout(e, 100), new G());
  }
  _load(t, o, e, s, n) {
    let a = t.coord.z * 3;
    const c = this.createGeometry();
    return this.imageLoader.load(
      o,
      // onLoad
      (d) => {
        const h = po(d, e, a);
        c.setData(mo(h.data), h.width), s();
      },
      // onProgress
      void 0,
      // onError
      n,
      t.abortSignal
    ), c;
  }
  createGeometry() {
    return new eo();
  }
}
function uo(i, t) {
  if (i[t * 4 + 3] === 0)
    return 0;
  const o = i[t * 4], e = i[t * 4 + 1], s = i[t * 4 + 2];
  return (((o << 16) + (e << 8) + s) * 0.1 - 1e4) / 1e3;
}
function mo(i) {
  const t = Math.floor(i.length / 4), o = new Float32Array(t);
  for (let e = 0; e < o.length; e++)
    o[e] = uo(i, e);
  return o;
}
function po(i, t, o) {
  const e = rt(t, i.width);
  o = Math.min(o, e.sw);
  const n = new OffscreenCanvas(o, o).getContext("2d");
  return n.imageSmoothingEnabled = !1, n.drawImage(i, e.sx, e.sy, e.sw, e.sh, 0, 0, o, o), n.getImageData(0, 0, o, o);
}
L.registerGeometryLoader(new ho());
class S {
  dataType = "image";
  attribution = "ThreeTile";
  minLevel = 0;
  maxLevel = 19;
  projectionID = "3857";
  url = "";
  subdomains = [];
  s = "";
  opacity = 1;
  // public bounds: [number, number, number, number] = [60, 10, 140, 60];
  bounds = [-180, -85.05112877980659, 180, 85.05112877980659];
  /**
   * constructor
   * @param options
   */
  constructor(t) {
    Object.assign(this, t);
  }
  /**
   * Get url from tile coordinate, public，called by TileLoader
   * @param x
   * @param y
   * @param z
   * @returns url
   */
  getTileUrl(t, o, e) {
    const s = this.subdomains.length;
    if (s > 0) {
      const n = Math.floor(Math.random() * s);
      this.s = this.subdomains[n];
    }
    return this.getUrl(t, o, e);
  }
  /**
   * Get url from tile coordinate, protected, overwrite to custom generation tile url from xyz
   * @param x
   * @param y
   * @param z
   * @returns url
   */
  getUrl(t, o, e) {
    const s = Object.assign({}, this, { x: t, y: o, z: e });
    return fo(this.url, s);
  }
  /**
   * source factory function, create source directly through factoy functions.
   * @param options
   * @returns ISource
   */
  static create(t) {
    return new S(t);
  }
}
function fo(i, t) {
  const o = /\{ *([\w_ -]+) *\}/g;
  return i.replace(o, (e, s) => {
    let n = t[s];
    if (n === void 0)
      throw new Error(`source url template error, No value provided for variable: ${e}`);
    return typeof n == "function" && (n = n(t)), n;
  });
}
class fe extends S {
  _source;
  _projection;
  get projection() {
    return this._projection;
  }
  set projection(t) {
    this._projection = t, this._bounds = this.projection.getPorjBounds(this._source.bounds);
  }
  _bounds;
  _getTileBounds(t, o, e, s = 1) {
    const n = this.projection.getTileXYZproj(t, o, e), a = this.projection.getTileXYZproj(t + s, o + s, e);
    return {
      minX: Math.min(n.x, a.x),
      minY: Math.min(n.y, a.y),
      maxX: Math.max(n.x, a.x),
      maxY: Math.max(n.y, a.y)
    };
  }
  constructor(t, o) {
    super(), Object.assign(this, t), this._source = t, this.projection = o;
  }
  getUrl(t, o, e) {
    const s = Math.pow(2, e);
    let n = t + Math.round(s / 360 * this.projection.lon0);
    n >= s ? n -= s : n < 0 && (n += s);
    const a = 1, c = this._bounds, d = this._getTileBounds(n, o, e, a);
    if (!(d.maxX < c.minX || d.minX > c.maxX || d.maxY < c.minY || d.minY > c.maxY))
      return this._source.getTileUrl(n, o, e);
  }
}
class it {
  _lon0 = 0;
  /** 中央经线 */
  get lon0() {
    return this._lon0;
  }
  /**
   * 构造函数
   * @param centerLon 中央经线
   */
  constructor(t = 0) {
    this._lon0 = t;
  }
  /**
   * 根据中央经线取得变换后的瓦片X坐标
   * @param x
   * @param z
   * @returns
   */
  getTileXWithCenterLon(t, o) {
    const e = Math.pow(2, o);
    let s = t + Math.round(e / 360 * this._lon0);
    return s >= e ? s -= e : s < 0 && (s += e), s;
  }
  /**
   * 根据瓦片坐标计算投影坐标
   * @param x
   * @param y
   * @param z
   * @returns
   */
  getTileXYZproj(t, o, e) {
    const s = this.mapWidth, n = this.mapHeight / 2, a = t / Math.pow(2, e) * s - s / 2, c = n - o / Math.pow(2, e) * n * 2;
    return { x: a, y: c };
  }
  /**
   * 取得投影后的经纬度边界坐标
   * @param bounds 经纬度边界
   * @returns 投影坐标
   */
  getPorjBounds(t) {
    const o = this.project(t[0] + this.lon0, t[1]), e = this.project(t[2] + this.lon0, t[3]);
    return {
      minX: Math.min(o.x, e.x),
      minY: Math.min(o.y, e.y),
      maxX: Math.max(o.x, e.x),
      maxY: Math.max(o.y, e.y)
    };
  }
}
const Q = 6378;
class nt extends it {
  ID = "3857";
  // projeciton ID
  isWGS = !1;
  // Is linear projection of latitude and longitude
  mapWidth = 2 * Math.PI * Q;
  //E-W scacle Earth's circumference(km)
  mapHeight = this.mapWidth;
  //S-N scacle Earth's circumference(km)
  mapDepth = 1;
  //Height scale
  /**
   * Latitude and longitude to projected coordinates
   * @param lon longitude
   * @param lat Latitude
   * @returns projected coordinates
   */
  project(t, o) {
    const e = (t - this.lon0) * (Math.PI / 180), s = o * (Math.PI / 180), n = Q * e, a = Q * Math.log(Math.tan(Math.PI / 4 + s / 2));
    return { x: n, y: a };
  }
  /**
   * Projected coordinates to latitude and longitude
   * @param x projection x
   * @param y projection y
   * @returns latitude and longitude
   */
  unProject(t, o) {
    const e = t / Q * (180 / Math.PI) + this.lon0;
    return { lat: (2 * Math.atan(Math.exp(o / Q)) - Math.PI / 2) * (180 / Math.PI), lon: e };
  }
}
class go extends it {
  ID = "4326";
  isWGS = !0;
  mapWidth = 36e3;
  //E-W scacle (*0.01°)
  mapHeight = 18e3;
  //S-N scale (*0.01°)
  mapDepth = 1;
  //height scale
  project(t, o) {
    return { x: (t - this.lon0) * 100, y: o * 100 };
  }
  unProject(t, o) {
    return { lon: t / 100 + this.lon0, lat: o / 100 };
  }
}
const Xe = {
  /**
   * create projection object from projection ID
   *
   * @param id projeciton ID, default: "3857"
   * @returns IProjection instance
   */
  createFromID: (i = "3857", t) => {
    let o;
    switch (i) {
      case "3857":
        o = new nt(t);
        break;
      case "4326":
        o = new go(t);
        break;
      default:
        throw new Error(`Projection ID: ${i} is not supported.`);
    }
    return o;
  }
};
function at(i, t) {
  const o = t.intersectObjects([i.rootTile]);
  for (const e of o)
    if (e.object instanceof ne) {
      const s = i.worldToLocal(e.point.clone()), n = i.pos2geo(s);
      return Object.assign(e, {
        location: n
      });
    }
}
function Ke(i, t) {
  const o = new m(0, -1, 0), e = new m(t.x, 10, t.z), s = new Je(e, o);
  return at(i, s);
}
function yo(i, t, o) {
  const e = new Je();
  return e.setFromCamera(o, i), at(t, e);
}
function bo(i) {
  const t = i.loader.manager;
  return t.onStart = (o, e, s) => {
    i.dispatchEvent({
      type: "loading-start",
      itemsLoaded: e,
      itemsTotal: s
    });
  }, t.onError = (o) => {
    i.dispatchEvent({ type: "loading-error", url: o });
  }, t.onLoad = () => {
    i.dispatchEvent({ type: "loading-complete" });
  }, t.onProgress = (o, e, s) => {
    i.dispatchEvent({
      type: "loading-progress",
      url: o,
      itemsLoaded: e,
      itemsTotal: s
    });
  }, i.rootTile.addEventListener("tile-created", (o) => {
    i.dispatchEvent({ type: "tile-created", tile: o.tile });
  }), i.rootTile.addEventListener("tile-loaded", (o) => {
    i.dispatchEvent({ type: "tile-loaded", tile: o.tile });
  }), i.rootTile.addEventListener("loaded", () => {
    i.dispatchEvent({ type: "loaded" });
  }), i;
}
function wo(i) {
  let t = 0, o = 0, e = 0, s = 0;
  return i.rootTile.traverse((n) => {
    n.isTile && (t++, n.isLeafInFrustum && o++, n.isLeaf && s++, e = Math.max(e, n.coord.z));
  }), { total: t, visible: o, leaf: s, maxLevle: e };
}
function xo(i) {
  const t = [];
  let o = i.imgSource;
  if (Array.isArray(o) || (o = [o]), o.forEach((e) => {
    const s = e.attribution;
    s && t.push(s);
  }), i.demSource) {
    const e = i.demSource.attribution;
    e && t.push(e);
  }
  return Array.from(new Set(t));
}
class ct extends be {
  // 渲染时钟计时器
  _clock = new et();
  // 是否为LOD模型（LOD模型，当autoUpdate为真时渲染时会自动调用update方法）
  isLOD = !0;
  /**
  
  	 * Whether the LOD object is updated automatically by the renderer per frame or not.
  	 * If set to false, you have to call LOD.update() in the render loop by yourself. Default is true.
  	 * 瓦片是否在每帧渲染时自动更新，默认为真
  	 */
  autoUpdate = !0;
  /**
   * Root tile, it is the root node of tile tree.
   * 根瓦片
   */
  rootTile;
  /**
   * Map data loader, it used for load tile data and create tile geometry/Material
   * 地图数据加载器
   */
  loader;
  /**
   * Get min level of map
   * 取得地图最小缩放级别，小于这个级别瓦片树不再更新
   */
  get minLevel() {
    return this.rootTile.minLevel;
  }
  /**
   * Set max level of map
   * 设置地图最小缩放级别，小于这个级别瓦片树不再更新
   */
  set minLevel(t) {
    this.rootTile.minLevel = t;
  }
  /**
   * Get max level of map
   * 取得地图最大缩放级别，大于这个级别瓦片树不再更新
   */
  get maxLevel() {
    return this.rootTile.maxLevel;
  }
  /**
   * Set max level of map
   * 设置地图最大缩放级别，大于这个级别瓦片树不再更新
   */
  set maxLevel(t) {
    this.rootTile.maxLevel = t;
  }
  /**
   * Whether the LOD object is load data automatically by the renderer per frame or not.
   * 取得是否在每帧渲染时按需更新瓦片数据
   */
  get autoLoad() {
    return this.rootTile.autoLoad;
  }
  /**
   * Get whether the LOD object is load data automatically by the renderer per frame or not.
   * 设置是否在每帧渲染时按需更新瓦片数据
   */
  set autoLoad(t) {
    this.rootTile.autoLoad = t;
  }
  _autoPosition = !1;
  /**
   * Get whether to adjust z of map automatically.
   * 取得是否自动根据视野内地形高度调整地图坐标
   */
  get autoPosition() {
    return this._autoPosition;
  }
  /**
   * Set whether to adjust z of map automatically.
   * 设置是否自动调整地图坐标，如果设置为true，将在每帧渲染中将地图坐标调整可视区域瓦片的平均高度
   */
  set autoPosition(t) {
    this._autoPosition = t;
  }
  /**
   * Get the number of  download cache files.
   * 取得瓦片下载缓存文件数量。
   */
  get loadCacheSize() {
    return this.loader.cacheSize;
  }
  /**
   * Set the number of  download cache files.
   * 设置瓦片下载缓存文件数量。使用该属性限制缓存瓦片数量，较大的缓存能加快数据下载速度，但会增加内存使用量，一般取<1000。
   */
  set loadCacheSize(t) {
    this.loader.cacheSize = t;
  }
  /**
   * Get the render cache size. Default:1.2
   * 取得瓦片渲染缓冲大小
   */
  get viewerBufferSize() {
    return this.rootTile.viewerbufferSize * 2;
  }
  /**
   * Set the render cache size. Default:1.2.
   * 设置瓦片视图缓冲大小（取值范围1.2-5.0，默认1.2）.
   * 在判断瓦片是否在可视范围时，将瓦片大小扩大该属性倍来判断，可预加载部分不在可视范围的瓦片，增大viewerBufferSize可预加载较多瓦片，但也增大了数据下载量并占用更多资源。
   */
  set viewerBufferSize(t) {
    this.rootTile.viewerbufferSize = t / 2;
  }
  /**
   * Get max height in view
   * 取得可视范围内瓦片的最高高度
   */
  get maxZInView() {
    return this.rootTile.maxZ;
  }
  /**
   * Set min height in view
   * 取得可视范围内瓦片的最低高度
   */
  get minZInView() {
    return this.rootTile.minZ;
  }
  /**
   * Get avg hegiht in view
   * 取得可视范围内瓦片的平均高度
   */
  get avgZInView() {
    return this.rootTile.avgZ;
  }
  /**
   * Get central Meridian latidute
   * 取得中央子午线经度
   */
  get lon0() {
    return this.projection.lon0;
  }
  /**
   * Set central Meridian latidute, default:0
   * 设置中央子午线经度，中央子午线决定了地图的投影中心经度，可设置为-90，0，90
   */
  set lon0(t) {
    this.projection.lon0 !== t && (t != 0 && this.rootTile.minLevel < 1 && console.warn(`Map centralMeridian is ${this.lon0}, minLevel must > 0`), this.projection = Xe.createFromID(this.projection.ID, t), this.reload());
  }
  _projection = new nt(0);
  /**
   * Set the map projection object
   * 取得地图投影对象
   */
  get projection() {
    return this._projection;
  }
  /**
   * Get the map projection object
   * 设置地图投影对象
   */
  set projection(t) {
    this._projection = t, this.rootTile.scale.set(t.mapWidth, t.mapHeight, t.mapDepth), this.rootTile.isWGS = t.isWGS, this.imgSource.forEach((o) => o.projection = this.projection), this.demSource && (this.demSource.projection = this.projection), t.ID != this.projection.ID && t.lon0 != this.lon0 && (this.reload(), console.log("Map Projection Changed:", t.ID), this.dispatchEvent({
      type: "projection-changed",
      projection: t
    }));
  }
  _imgSource = [];
  /**
   * Get the image data source object
   * 取得影像数据源
   */
  get imgSource() {
    return this._imgSource;
  }
  /**
   * Set the image data source object
   * 设置影像数据源
   */
  set imgSource(t) {
    const o = Array.isArray(t) ? t : [t];
    if (o.length === 0)
      throw new Error("imgSource can not be empty");
    this.projection = Xe.createFromID(o[0].projectionID, this.projection.lon0);
    const e = o.map((s) => s instanceof fe ? s : new fe(s, this.projection));
    this._imgSource = e, this.loader.imgSource = e, this.dispatchEvent({ type: "source-changed", source: t });
  }
  _demSource;
  /**
   * Get the terrain data source
   * 设置地形数据源
   */
  get demSource() {
    return this._demSource;
  }
  /**
   * Set the terrain data source
   * 取得地形数据源
   */
  set demSource(t) {
    t ? this._demSource = new fe(t, this.projection) : this._demSource = void 0, this.loader.demSource = this._demSource, this.dispatchEvent({ type: "source-changed", source: t });
  }
  /**
   * Get LOD threshold
   * 取得LOD阈值
   */
  get LODThreshold() {
    return this.rootTile.LODThreshold;
  }
  /**
   * Set LOD threshold
   * 设置LOD阈值，LOD阈值越大，使用更多瓦片显示，地图越清晰，但耗费资源越高，建议取0.8-5之间
   */
  set LODThreshold(t) {
    this.rootTile.LODThreshold = t;
  }
  /**
   * Get the map model width
   * 取得地图模型宽度
   */
  get width() {
    return this.projection.mapWidth;
  }
  /**
   * Get the map model height
   * 取得地图模型高度
   */
  get height() {
    return this.projection.mapHeight;
  }
  /**
      * Create a map using factory function
      * 地图创建工厂函数
        @param params 地图参数 {@link MapParams}
        @returns map mesh 地图模型
        @example
        ``` typescript
         TileMap.create({
             // 影像数据源
             imgSource: [Source.mapBoxImgSource, new TestSource()],
             // 高程数据源
             demSource: source.mapBoxDemSource,
             // 地图投影中心经度
             lon0: 90,
             // 最小缩放级别
             minLevel: 1,
             // 最大缩放级别
             maxLevel: 18,
         });
        ```
      */
  static create(t) {
    return new ct(t);
  }
  /**
   * Map mesh constructor
   *
   * 地图模型构造函数
   * @param params 地图参数 {@link MapParams}
   * @example
   * ``` typescript
  
    const map = new TileMap({
    		// 加载器
  		loader: new TileLoader(),
             // 影像数据源
             imgSource: [Source.mapBoxImgSource, new TestSource()],
             // 高程数据源
             demSource: source.mapBoxDemSource,
             // 地图投影中心经度
             lon0: 90,
             // 最小缩放级别
             minLevel: 1,
             // 最大缩放级别
             maxLevel: 18,
         });;
   * ```
   */
  constructor(t) {
    super(), this.up.set(0, 0, 1), this.loader = t.loader ?? new io(), this.rootTile = t.rootTile ?? new Qt(this.loader), this.minLevel = t.minLevel ?? 0, this.maxLevel = t.maxLevel ?? 19, this.imgSource = t.imgSource, this.demSource = t.demSource, this.lon0 = t.lon0 ?? 0, bo(this), this.add(this.rootTile), this.rootTile.updateMatrix(), this.rootTile.updateMatrixWorld();
  }
  /**
   * Update the map, It is automatically called after mesh adding a scene
   * 模型更新回调函数，地图加入场景后会在每帧更新时被调用，该函数调用根瓦片实现瓦片树更新和数据加载
   * @param camera
   */
  update(t) {
    if (this.rootTile.receiveShadow = this.receiveShadow, this.rootTile.castShadow = this.castShadow, this.rootTile.update(t), this.autoPosition) {
      const o = this.localToWorld(this.up.clone().multiplyScalar(this.avgZInView)), e = this.position.clone().add(o).multiplyScalar(0.01);
      this.position.sub(e);
    }
    this.dispatchEvent({ type: "update", delta: this._clock.getDelta() });
  }
  /**
   * reload the map data，muse called after the source has changed
   * 重新加载地图，在改变地图数据源后调用它才能生效
   */
  reload() {
    this.rootTile.dispose(!0);
  }
  /**
   * dispose map.
   * todo: remve event.
   * 释放地图资源，并移出场景
   */
  dispose() {
    this.removeFromParent(), this.reload();
  }
  /**
   * Geo coordinates converted to map model coordinates
   * 地理坐标转换为地图模型坐标
   * @param geo 地理坐标（经纬度）
   * @returns 模型坐标
   */
  geo2pos(t) {
    const o = this.projection.project(t.x, t.y);
    return new m(o.x, o.y, t.z);
  }
  /**
   * Map model coordinates converted to coordinates geo
   * 地图模型坐标转换为地理坐标
   * @param pos 模型坐标
   * @returns 地理坐标（经纬度）
   */
  pos2geo(t) {
    const o = this.projection.unProject(t.x, t.y);
    return new m(o.lon, o.lat, t.z);
  }
  /**
   * Get the ground infomation for the specified latitude and longitude
   * 获取指定经纬度的地面信息（法向量、高度等）
   * @param geo 地理坐标
   * @returns 地面信息
   */
  getLocalInfoFromGeo(t) {
    const o = this.geo2pos(t);
    return Ke(this, o);
  }
  /**
   * Get loacation infomation from world position
   * 获取指定世界坐标的地面信息
   * @param pos 世界坐标
   * @returns 地面信息
   */
  getLocalInfoFromWorld(t) {
    return Ke(this, t);
  }
  /**
   * Get loacation infomation from screen point
   * 获取指定屏幕坐标的地面信息
   * @param camera 摄像机
   * @param pointer 点的屏幕坐标（-0.5~0.5）
   * @returns 位置信息（经纬度、高度等）
   */
  getLocalInfoFromScreen(t, o) {
    return yo(t, this, o);
  }
  /**
   * Get map data attributions information
   * 取得地图数据归属版权信息
   * @returns Attributions 版权信息字符串数组
   */
  get attributions() {
    return xo(this);
  }
  /**
   * Get map tiles statistics to debug
   * @returns 取得瓦片统计信息，用于调试性能
   */
  get tileCount() {
    return wo(this);
  }
}
class To {
  dataType = "debug";
  load(t, o, e, s) {
    const n = (d) => {
      const h = d.target;
      h.map?.image instanceof ImageBitmap && h.map.image.close(), h.map?.dispose(), h.removeEventListener("dispose", n);
    }, a = new zt(this.drawTile(o));
    a.needsUpdate = !0;
    const c = new J({
      transparent: !0,
      map: a,
      opacity: t.opacity
    });
    return c.addEventListener("dispose", n), setTimeout(e), c;
  }
  /**
   * draw a box and coordiante
   * @param tile
   * @returns bitmap
   */
  drawTile(t) {
    const e = new OffscreenCanvas(256, 256), s = e.getContext("2d");
    return s.scale(1, -1), s.translate(0, -256), s && (s.strokeStyle = "#ccc", s.lineWidth = 4, s.strokeRect(5, 5, 246, 246), s.fillStyle = "white", s.shadowColor = "black", s.shadowBlur = 5, s.shadowOffsetX = 1, s.shadowOffsetY = 1, s.font = "bold 20px arial", s.textAlign = "center", s.fillText(`Tile Test - level: ${t.coord.z}`, 256 / 2, 50), s.fillText(`[${t.coord.x}, ${t.coord.y}]`, 256 / 2, 80)), e.transferToImageBitmap();
  }
}
L.registerMaterialLoader(new To());
class Lo {
  dataType = "logo";
  /**
   * 加载材质
   * @param source 数据源
   * @param tile 瓦片
   * @param onLoad 加载完成回调
   * @returns 材质
   */
  load(t, o, e, s) {
    if (o.coord.z < 4)
      return setTimeout(e), new J();
    const n = new we(this.drawLogo(t.attribution));
    n.needsUpdate = !0;
    const a = new J({
      transparent: !0,
      map: n,
      opacity: t.opacity
    }), c = (d) => {
      const h = d.target;
      h.map?.image instanceof ImageBitmap && h.map.image.close(), h.map?.dispose(), h.removeEventListener("dispose", c);
    };
    return a.addEventListener("dispose", c), setTimeout(e), a;
  }
  /**
   * draw LOGO
   * @param logo text
   * @returns bitmap
   */
  drawLogo(t) {
    const e = new OffscreenCanvas(256, 256), s = e.getContext("2d");
    return s.scale(1, -1), s.translate(0, -256), s && (s.fillStyle = "white", s.shadowColor = "black", s.shadowBlur = 5, s.shadowOffsetX = 1, s.shadowOffsetY = 1, s.font = "bold 14px arial", s.textAlign = "center", s.translate(256 / 2, 256 / 2), s.rotate(30 * Math.PI / 180), s.fillText(`${t}`, 0, 0)), e.transferToImageBitmap();
  }
}
L.registerMaterialLoader(new Lo());
class vo {
  dataType = "normal";
  load(t, o, e, s) {
    const n = new Ct({
      transparent: !0,
      opacity: t.opacity,
      flatShading: !0
    });
    return setTimeout(e), n;
  }
}
L.registerMaterialLoader(new vo());
class _o {
  dataType = "wireframe";
  load(t, o, e, s) {
    const n = new xe(`hsl(${o.coord.z * 14}, 100%, 50%)`), a = new J({
      transparent: !0,
      wireframe: !0,
      color: n,
      opacity: t.opacity
    });
    return setTimeout(e), a;
  }
}
L.registerMaterialLoader(new _o());
const $e = { type: "change" }, ge = { type: "start" }, Ve = { type: "end" }, re = new kt(), qe = new Rt(), So = Math.cos(70 * Z.DEG2RAD);
class Eo extends tt {
  constructor(t, o) {
    super(), this.object = t, this.domElement = o, this.domElement.style.touchAction = "none", this.enabled = !0, this.target = new m(), this.cursor = new m(), this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minTargetRadius = 0, this.maxTargetRadius = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = !1, this.dampingFactor = 0.05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = { LEFT: "ArrowLeft", UP: "ArrowUp", RIGHT: "ArrowRight", BOTTOM: "ArrowDown" }, this.mouseButtons = { LEFT: F.ROTATE, MIDDLE: F.DOLLY, RIGHT: F.PAN }, this.touches = { ONE: Y.ROTATE, TWO: Y.DOLLY_PAN }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this.getPolarAngle = function() {
      return c.phi;
    }, this.getAzimuthalAngle = function() {
      return c.theta;
    }, this.getDistance = function() {
      return this.object.position.distanceTo(this.target);
    }, this.listenToKeyEvents = function(r) {
      r.addEventListener("keydown", he), this._domElementKeyEvents = r;
    }, this.stopListenToKeyEvents = function() {
      this._domElementKeyEvents.removeEventListener("keydown", he), this._domElementKeyEvents = null;
    }, this.saveState = function() {
      e.target0.copy(e.target), e.position0.copy(e.object.position), e.zoom0 = e.object.zoom;
    }, this.reset = function() {
      e.target.copy(e.target0), e.object.position.copy(e.position0), e.object.zoom = e.zoom0, e.object.updateProjectionMatrix(), e.dispatchEvent($e), e.update(), n = s.NONE;
    }, this.update = function() {
      const r = new m(), l = new Ze().setFromUnitVectors(t.up, new m(0, 1, 0)), p = l.clone().invert(), f = new m(), _ = new Ze(), N = new m(), P = 2 * Math.PI;
      return function(Mt = null) {
        const Fe = e.object.position;
        r.copy(Fe).sub(e.target), r.applyQuaternion(l), c.setFromVector3(r), e.autoRotate && n === s.NONE && K(X(Mt)), e.enableDamping ? (c.theta += d.theta * e.dampingFactor, c.phi += d.phi * e.dampingFactor) : (c.theta += d.theta, c.phi += d.phi);
        let k = e.minAzimuthAngle, R = e.maxAzimuthAngle;
        isFinite(k) && isFinite(R) && (k < -Math.PI ? k += P : k > Math.PI && (k -= P), R < -Math.PI ? R += P : R > Math.PI && (R -= P), k <= R ? c.theta = Math.max(k, Math.min(R, c.theta)) : c.theta = c.theta > (k + R) / 2 ? Math.max(k, c.theta) : Math.min(R, c.theta)), c.phi = Math.max(e.minPolarAngle, Math.min(e.maxPolarAngle, c.phi)), c.makeSafe(), e.enableDamping === !0 ? e.target.addScaledVector(u, e.dampingFactor) : e.target.add(u), e.target.sub(e.cursor), e.target.clampLength(e.minTargetRadius, e.maxTargetRadius), e.target.add(e.cursor);
        let V = !1;
        if (e.zoomToCursor && D || e.object.isOrthographicCamera)
          c.radius = le(c.radius);
        else {
          const B = c.radius;
          c.radius = le(c.radius * h), V = B != c.radius;
        }
        if (r.setFromSpherical(c), r.applyQuaternion(p), Fe.copy(e.target).add(r), e.object.lookAt(e.target), e.enableDamping === !0 ? (d.theta *= 1 - e.dampingFactor, d.phi *= 1 - e.dampingFactor, u.multiplyScalar(1 - e.dampingFactor)) : (d.set(0, 0, 0), u.set(0, 0, 0)), e.zoomToCursor && D) {
          let B = null;
          if (e.object.isPerspectiveCamera) {
            const q = r.length();
            B = le(q * h);
            const oe = q - B;
            e.object.position.addScaledVector(x, oe), e.object.updateMatrixWorld(), V = !!oe;
          } else if (e.object.isOrthographicCamera) {
            const q = new m(y.x, y.y, 0);
            q.unproject(e.object);
            const oe = e.object.zoom;
            e.object.zoom = Math.max(e.minZoom, Math.min(e.maxZoom, e.object.zoom / h)), e.object.updateProjectionMatrix(), V = oe !== e.object.zoom;
            const Ne = new m(y.x, y.y, 0);
            Ne.unproject(e.object), e.object.position.sub(Ne).add(q), e.object.updateMatrixWorld(), B = r.length();
          } else
            console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), e.zoomToCursor = !1;
          B !== null && (this.screenSpacePanning ? e.target.set(0, 0, -1).transformDirection(e.object.matrix).multiplyScalar(B).add(e.object.position) : (re.origin.copy(e.object.position), re.direction.set(0, 0, -1).transformDirection(e.object.matrix), Math.abs(e.object.up.dot(re.direction)) < So ? t.lookAt(e.target) : (qe.setFromNormalAndCoplanarPoint(e.object.up, e.target), re.intersectPlane(qe, e.target))));
        } else if (e.object.isOrthographicCamera) {
          const B = e.object.zoom;
          e.object.zoom = Math.max(e.minZoom, Math.min(e.maxZoom, e.object.zoom / h)), B !== e.object.zoom && (e.object.updateProjectionMatrix(), V = !0);
        }
        return h = 1, D = !1, V || f.distanceToSquared(e.object.position) > a || 8 * (1 - _.dot(e.object.quaternion)) > a || N.distanceToSquared(e.target) > a ? (e.dispatchEvent($e), f.copy(e.object.position), _.copy(e.object.quaternion), N.copy(e.target), !0) : !1;
      };
    }(), this.dispose = function() {
      e.domElement.removeEventListener("contextmenu", Re), e.domElement.removeEventListener("pointerdown", Ie), e.domElement.removeEventListener("pointercancel", $), e.domElement.removeEventListener("wheel", Oe), e.domElement.removeEventListener("pointermove", de), e.domElement.removeEventListener("pointerup", $), e.domElement.getRootNode().removeEventListener("keydown", ze, { capture: !0 }), e._domElementKeyEvents !== null && (e._domElementKeyEvents.removeEventListener("keydown", he), e._domElementKeyEvents = null);
    };
    const e = this, s = {
      NONE: -1,
      ROTATE: 0,
      DOLLY: 1,
      PAN: 2,
      TOUCH_ROTATE: 3,
      TOUCH_PAN: 4,
      TOUCH_DOLLY_PAN: 5,
      TOUCH_DOLLY_ROTATE: 6
    };
    let n = s.NONE;
    const a = 1e-6, c = new Ge(), d = new Ge();
    let h = 1;
    const u = new m(), v = new T(), w = new T(), b = new T(), M = new T(), E = new T(), O = new T(), z = new T(), C = new T(), A = new T(), x = new m(), y = new T();
    let D = !1;
    const g = [], j = {};
    let I = !1;
    function X(r) {
      return r !== null ? 2 * Math.PI / 60 * e.autoRotateSpeed * r : 2 * Math.PI / 60 / 60 * e.autoRotateSpeed;
    }
    function ee(r) {
      const l = Math.abs(r * 0.01);
      return Math.pow(0.95, e.zoomSpeed * l);
    }
    function K(r) {
      d.theta -= r;
    }
    function te(r) {
      d.phi -= r;
    }
    const Te = function() {
      const r = new m();
      return function(p, f) {
        r.setFromMatrixColumn(f, 0), r.multiplyScalar(-p), u.add(r);
      };
    }(), Le = function() {
      const r = new m();
      return function(p, f) {
        e.screenSpacePanning === !0 ? r.setFromMatrixColumn(f, 1) : (r.setFromMatrixColumn(f, 0), r.crossVectors(e.object.up, r)), r.multiplyScalar(p), u.add(r);
      };
    }(), U = function() {
      const r = new m();
      return function(p, f) {
        const _ = e.domElement;
        if (e.object.isPerspectiveCamera) {
          const N = e.object.position;
          r.copy(N).sub(e.target);
          let P = r.length();
          P *= Math.tan(e.object.fov / 2 * Math.PI / 180), Te(2 * p * P / _.clientHeight, e.object.matrix), Le(2 * f * P / _.clientHeight, e.object.matrix);
        } else e.object.isOrthographicCamera ? (Te(p * (e.object.right - e.object.left) / e.object.zoom / _.clientWidth, e.object.matrix), Le(f * (e.object.top - e.object.bottom) / e.object.zoom / _.clientHeight, e.object.matrix)) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."), e.enablePan = !1);
      };
    }();
    function ae(r) {
      e.object.isPerspectiveCamera || e.object.isOrthographicCamera ? h /= r : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), e.enableZoom = !1);
    }
    function ve(r) {
      e.object.isPerspectiveCamera || e.object.isOrthographicCamera ? h *= r : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), e.enableZoom = !1);
    }
    function ce(r, l) {
      if (!e.zoomToCursor)
        return;
      D = !0;
      const p = e.domElement.getBoundingClientRect(), f = r - p.left, _ = l - p.top, N = p.width, P = p.height;
      y.x = f / N * 2 - 1, y.y = -(_ / P) * 2 + 1, x.set(y.x, y.y, 1).unproject(e.object).sub(e.object.position).normalize();
    }
    function le(r) {
      return Math.max(e.minDistance, Math.min(e.maxDistance, r));
    }
    function _e(r) {
      v.set(r.clientX, r.clientY);
    }
    function dt(r) {
      ce(r.clientX, r.clientX), z.set(r.clientX, r.clientY);
    }
    function Se(r) {
      M.set(r.clientX, r.clientY);
    }
    function ht(r) {
      w.set(r.clientX, r.clientY), b.subVectors(w, v).multiplyScalar(e.rotateSpeed);
      const l = e.domElement;
      K(2 * Math.PI * b.x / l.clientHeight), te(2 * Math.PI * b.y / l.clientHeight), v.copy(w), e.update();
    }
    function ut(r) {
      C.set(r.clientX, r.clientY), A.subVectors(C, z), A.y > 0 ? ae(ee(A.y)) : A.y < 0 && ve(ee(A.y)), z.copy(C), e.update();
    }
    function mt(r) {
      E.set(r.clientX, r.clientY), O.subVectors(E, M).multiplyScalar(e.panSpeed), U(O.x, O.y), M.copy(E), e.update();
    }
    function pt(r) {
      ce(r.clientX, r.clientY), r.deltaY < 0 ? ve(ee(r.deltaY)) : r.deltaY > 0 && ae(ee(r.deltaY)), e.update();
    }
    function ft(r) {
      let l = !1;
      switch (r.code) {
        case e.keys.UP:
          r.ctrlKey || r.metaKey || r.shiftKey ? te(2 * Math.PI * e.rotateSpeed / e.domElement.clientHeight) : U(0, e.keyPanSpeed), l = !0;
          break;
        case e.keys.BOTTOM:
          r.ctrlKey || r.metaKey || r.shiftKey ? te(-2 * Math.PI * e.rotateSpeed / e.domElement.clientHeight) : U(0, -e.keyPanSpeed), l = !0;
          break;
        case e.keys.LEFT:
          r.ctrlKey || r.metaKey || r.shiftKey ? K(2 * Math.PI * e.rotateSpeed / e.domElement.clientHeight) : U(e.keyPanSpeed, 0), l = !0;
          break;
        case e.keys.RIGHT:
          r.ctrlKey || r.metaKey || r.shiftKey ? K(-2 * Math.PI * e.rotateSpeed / e.domElement.clientHeight) : U(-e.keyPanSpeed, 0), l = !0;
          break;
      }
      l && (r.preventDefault(), e.update());
    }
    function Ee(r) {
      if (g.length === 1)
        v.set(r.pageX, r.pageY);
      else {
        const l = W(r), p = 0.5 * (r.pageX + l.x), f = 0.5 * (r.pageY + l.y);
        v.set(p, f);
      }
    }
    function Me(r) {
      if (g.length === 1)
        M.set(r.pageX, r.pageY);
      else {
        const l = W(r), p = 0.5 * (r.pageX + l.x), f = 0.5 * (r.pageY + l.y);
        M.set(p, f);
      }
    }
    function Pe(r) {
      const l = W(r), p = r.pageX - l.x, f = r.pageY - l.y, _ = Math.sqrt(p * p + f * f);
      z.set(0, _);
    }
    function gt(r) {
      e.enableZoom && Pe(r), e.enablePan && Me(r);
    }
    function yt(r) {
      e.enableZoom && Pe(r), e.enableRotate && Ee(r);
    }
    function je(r) {
      if (g.length == 1)
        w.set(r.pageX, r.pageY);
      else {
        const p = W(r), f = 0.5 * (r.pageX + p.x), _ = 0.5 * (r.pageY + p.y);
        w.set(f, _);
      }
      b.subVectors(w, v).multiplyScalar(e.rotateSpeed);
      const l = e.domElement;
      K(2 * Math.PI * b.x / l.clientHeight), te(2 * Math.PI * b.y / l.clientHeight), v.copy(w);
    }
    function Ae(r) {
      if (g.length === 1)
        E.set(r.pageX, r.pageY);
      else {
        const l = W(r), p = 0.5 * (r.pageX + l.x), f = 0.5 * (r.pageY + l.y);
        E.set(p, f);
      }
      O.subVectors(E, M).multiplyScalar(e.panSpeed), U(O.x, O.y), M.copy(E);
    }
    function De(r) {
      const l = W(r), p = r.pageX - l.x, f = r.pageY - l.y, _ = Math.sqrt(p * p + f * f);
      C.set(0, _), A.set(0, Math.pow(C.y / z.y, e.zoomSpeed)), ae(A.y), z.copy(C);
      const N = (r.pageX + l.x) * 0.5, P = (r.pageY + l.y) * 0.5;
      ce(N, P);
    }
    function bt(r) {
      e.enableZoom && De(r), e.enablePan && Ae(r);
    }
    function wt(r) {
      e.enableZoom && De(r), e.enableRotate && je(r);
    }
    function Ie(r) {
      e.enabled !== !1 && (g.length === 0 && (e.domElement.setPointerCapture(r.pointerId), e.domElement.addEventListener("pointermove", de), e.domElement.addEventListener("pointerup", $)), !Et(r) && (_t(r), r.pointerType === "touch" ? ke(r) : xt(r)));
    }
    function de(r) {
      e.enabled !== !1 && (r.pointerType === "touch" ? vt(r) : Tt(r));
    }
    function $(r) {
      switch (St(r), g.length) {
        case 0:
          e.domElement.releasePointerCapture(r.pointerId), e.domElement.removeEventListener("pointermove", de), e.domElement.removeEventListener("pointerup", $), e.dispatchEvent(Ve), n = s.NONE;
          break;
        case 1:
          const l = g[0], p = j[l];
          ke({ pointerId: l, pageX: p.x, pageY: p.y });
          break;
      }
    }
    function xt(r) {
      let l;
      switch (r.button) {
        case 0:
          l = e.mouseButtons.LEFT;
          break;
        case 1:
          l = e.mouseButtons.MIDDLE;
          break;
        case 2:
          l = e.mouseButtons.RIGHT;
          break;
        default:
          l = -1;
      }
      switch (l) {
        case F.DOLLY:
          if (e.enableZoom === !1) return;
          dt(r), n = s.DOLLY;
          break;
        case F.ROTATE:
          if (r.ctrlKey || r.metaKey || r.shiftKey) {
            if (e.enablePan === !1) return;
            Se(r), n = s.PAN;
          } else {
            if (e.enableRotate === !1) return;
            _e(r), n = s.ROTATE;
          }
          break;
        case F.PAN:
          if (r.ctrlKey || r.metaKey || r.shiftKey) {
            if (e.enableRotate === !1) return;
            _e(r), n = s.ROTATE;
          } else {
            if (e.enablePan === !1) return;
            Se(r), n = s.PAN;
          }
          break;
        default:
          n = s.NONE;
      }
      n !== s.NONE && e.dispatchEvent(ge);
    }
    function Tt(r) {
      switch (n) {
        case s.ROTATE:
          if (e.enableRotate === !1) return;
          ht(r);
          break;
        case s.DOLLY:
          if (e.enableZoom === !1) return;
          ut(r);
          break;
        case s.PAN:
          if (e.enablePan === !1) return;
          mt(r);
          break;
      }
    }
    function Oe(r) {
      e.enabled === !1 || e.enableZoom === !1 || n !== s.NONE || (r.preventDefault(), e.dispatchEvent(ge), pt(Lt(r)), e.dispatchEvent(Ve));
    }
    function Lt(r) {
      const l = r.deltaMode, p = {
        clientX: r.clientX,
        clientY: r.clientY,
        deltaY: r.deltaY
      };
      switch (l) {
        case 1:
          p.deltaY *= 16;
          break;
        case 2:
          p.deltaY *= 100;
          break;
      }
      return r.ctrlKey && !I && (p.deltaY *= 10), p;
    }
    function ze(r) {
      r.key === "Control" && (I = !0, e.domElement.getRootNode().addEventListener("keyup", Ce, { passive: !0, capture: !0 }));
    }
    function Ce(r) {
      r.key === "Control" && (I = !1, e.domElement.getRootNode().removeEventListener("keyup", Ce, { passive: !0, capture: !0 }));
    }
    function he(r) {
      e.enabled === !1 || e.enablePan === !1 || ft(r);
    }
    function ke(r) {
      switch (Be(r), g.length) {
        case 1:
          switch (e.touches.ONE) {
            case Y.ROTATE:
              if (e.enableRotate === !1) return;
              Ee(r), n = s.TOUCH_ROTATE;
              break;
            case Y.PAN:
              if (e.enablePan === !1) return;
              Me(r), n = s.TOUCH_PAN;
              break;
            default:
              n = s.NONE;
          }
          break;
        case 2:
          switch (e.touches.TWO) {
            case Y.DOLLY_PAN:
              if (e.enableZoom === !1 && e.enablePan === !1) return;
              gt(r), n = s.TOUCH_DOLLY_PAN;
              break;
            case Y.DOLLY_ROTATE:
              if (e.enableZoom === !1 && e.enableRotate === !1) return;
              yt(r), n = s.TOUCH_DOLLY_ROTATE;
              break;
            default:
              n = s.NONE;
          }
          break;
        default:
          n = s.NONE;
      }
      n !== s.NONE && e.dispatchEvent(ge);
    }
    function vt(r) {
      switch (Be(r), n) {
        case s.TOUCH_ROTATE:
          if (e.enableRotate === !1) return;
          je(r), e.update();
          break;
        case s.TOUCH_PAN:
          if (e.enablePan === !1) return;
          Ae(r), e.update();
          break;
        case s.TOUCH_DOLLY_PAN:
          if (e.enableZoom === !1 && e.enablePan === !1) return;
          bt(r), e.update();
          break;
        case s.TOUCH_DOLLY_ROTATE:
          if (e.enableZoom === !1 && e.enableRotate === !1) return;
          wt(r), e.update();
          break;
        default:
          n = s.NONE;
      }
    }
    function Re(r) {
      e.enabled !== !1 && r.preventDefault();
    }
    function _t(r) {
      g.push(r.pointerId);
    }
    function St(r) {
      delete j[r.pointerId];
      for (let l = 0; l < g.length; l++)
        if (g[l] == r.pointerId) {
          g.splice(l, 1);
          return;
        }
    }
    function Et(r) {
      for (let l = 0; l < g.length; l++)
        if (g[l] == r.pointerId) return !0;
      return !1;
    }
    function Be(r) {
      let l = j[r.pointerId];
      l === void 0 && (l = new T(), j[r.pointerId] = l), l.set(r.pageX, r.pageY);
    }
    function W(r) {
      const l = r.pointerId === g[0] ? g[1] : g[0];
      return j[l];
    }
    e.domElement.addEventListener("contextmenu", Re), e.domElement.addEventListener("pointerdown", Ie), e.domElement.addEventListener("pointercancel", $), e.domElement.addEventListener("wheel", Oe, { passive: !1 }), e.domElement.getRootNode().addEventListener("keydown", ze, { passive: !0, capture: !0 }), this.update();
  }
}
class Mo extends Eo {
  constructor(t, o) {
    super(t, o), this.screenSpacePanning = !1, this.mouseButtons = { LEFT: F.PAN, MIDDLE: F.DOLLY, RIGHT: F.ROTATE }, this.touches = { ONE: Y.PAN, TWO: Y.DOLLY_ROTATE };
  }
}
class Po extends tt {
  scene;
  renderer;
  camera;
  controls;
  ambLight;
  dirLight;
  container;
  _clock = new et();
  _fogFactor = 1;
  get fogFactor() {
    return this._fogFactor;
  }
  set fogFactor(t) {
    this._fogFactor = t, this.controls.dispatchEvent({ type: "change", target: this.controls });
  }
  get width() {
    return this.container.clientWidth;
  }
  get height() {
    return this.container.clientHeight;
  }
  constructor(t, o = {}) {
    super();
    const e = typeof t == "string" ? document.querySelector(t) : t;
    if (e instanceof HTMLElement) {
      const {
        centerPostion: s = new m(0, 0, -3e3),
        cameraPosition: n = new m(0, 3e4, 0),
        antialias: a = !1,
        logarithmicDepthBuffer: c = !0
      } = o;
      this.container = e, this.renderer = this._createRenderer(a, c), this.scene = this._createScene(), this.camera = this._createCamera(n), this.controls = this._createControls(s), this.ambLight = this._createAmbLight(), this.scene.add(this.ambLight), this.dirLight = this._createDirLight(s), this.scene.add(this.dirLight), this.container.appendChild(this.renderer.domElement), window.addEventListener("resize", this.resize.bind(this)), this.resize(), this.renderer.setAnimationLoop(this.animate.bind(this));
    } else
      throw `${t} not found!}`;
  }
  _createScene() {
    const t = new Bt(), o = 14414079;
    return t.background = new xe(o), t.fog = new Ue(o, 0), t;
  }
  _createRenderer(t, o) {
    const e = new Ft({
      antialias: t,
      logarithmicDepthBuffer: o,
      alpha: !0,
      precision: "highp"
    });
    return e.debug.checkShaderErrors = !0, e.sortObjects = !0, e.setPixelRatio(window.devicePixelRatio), e;
  }
  _createCamera(t) {
    const o = new Nt(70, 1, 0.1, 5e4);
    return o.position.copy(t), o;
  }
  _createControls(t) {
    const o = new Mo(this.camera, this.container);
    return o.target.copy(t), o.screenSpacePanning = !1, o.minDistance = 0.1, o.maxDistance = 3e4, o.maxPolarAngle = 1.2, o.enableDamping = !0, o.keyPanSpeed = 5, o.listenToKeyEvents(window), o.addEventListener("change", () => {
      const e = Math.max(this.controls.getPolarAngle(), 0.1), s = Math.max(this.controls.getDistance(), 0.1);
      o.zoomSpeed = Math.max(Math.log(s), 1.8), this.camera.far = Z.clamp(s / e * 8, 100, 5e4), this.camera.near = this.camera.far / 1e3, this.camera.updateProjectionMatrix(), this.scene.fog instanceof Ue && (this.scene.fog.density = e / (s + 5) * this.fogFactor * 0.25), s > 8e3 ? (o.minAzimuthAngle = 0, o.maxAzimuthAngle = 0) : (o.minAzimuthAngle = -1 / 0, o.maxAzimuthAngle = 1 / 0), o.maxPolarAngle = Math.min(Math.pow(1e4, 4) / Math.pow(s, 4), 1.2);
    }), o;
  }
  _createAmbLight() {
    return new Yt(16777215, 1);
  }
  _createDirLight(t) {
    const o = new Zt(16777215, 1);
    return o.position.set(0, 2e3, 1e3), o.target.position.copy(t), o;
  }
  resize() {
    const t = this.width, o = this.height;
    return this.renderer.setPixelRatio(window.devicePixelRatio), this.renderer.setSize(t, o), this.camera.aspect = t / o, this.camera.updateProjectionMatrix(), this;
  }
  animate() {
    this.controls.update(), this.renderer.render(this.scene, this.camera), this.dispatchEvent({ type: "update", delta: this._clock.getDelta() });
  }
}
class jo extends S {
  token = "";
  format = "webp";
  style = "mapbox.satellite";
  attribution = "MapBox";
  maxLevel = 19;
  url = "https://api.mapbox.com/v4/{style}/{z}/{x}/{y}.{format}?access_token={token}";
  constructor(t) {
    super(t), Object.assign(this, t);
  }
}
class Ao extends S {
  dataType = "image";
  attribution = "ArcGIS";
  style = "World_Imagery";
  url = "https://services.arcgisonline.com/arcgis/rest/services/{style}/MapServer/tile/{z}/{y}/{x}";
  constructor(t) {
    super(t), Object.assign(this, t);
  }
}
class Do extends S {
  dataType = "lerc";
  attribution = "ArcGIS";
  maxLevel = 13;
  url = "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer/tile/{z}/{y}/{x}";
  constructor(t) {
    super(t), Object.assign(this, t);
  }
}
class Io extends S {
  dataType = "image";
  attribution = "Bing[GS(2021)1731号]";
  style = "A";
  mkt = "zh-CN";
  subdomains = "123";
  constructor(t) {
    super(t), Object.assign(this, t);
  }
  getUrl(t, o, e) {
    const s = Oo(e, t, o);
    return `https://t${this.s}.dynamic.tiles.ditu.live.com/comp/ch/${s}?mkt=${this.mkt}&ur=CN&it=${this.style}&n=z&og=804&cstl=vb`;
  }
}
function Oo(i, t, o) {
  let e = "";
  for (let s = i; s > 0; s--) {
    const n = 1 << s - 1;
    let a = 0;
    t & n && a++, o & n && (a += 2), e += a;
  }
  return e;
}
class zo extends S {
  dataType = "image";
  attribution = "高德[GS(2021)6375号]";
  style = "8";
  subdomains = "1234";
  maxLevel = 18;
  url = "https://webst0{s}.is.autonavi.com/appmaptile?style={style}&x={x}&y={y}&z={z}";
  constructor(t) {
    super(t), Object.assign(this, t);
  }
}
class Co extends S {
  dataType = "image";
  maxLevel = 16;
  attribution = "GeoQ[GS(2019)758号]";
  style = "ChinaOnlineStreetPurplishBlue";
  url = "https://map.geoq.cn/ArcGIS/rest/services/{style}/MapServer/tile/{z}/{y}/{x}";
  constructor(t) {
    super(t), Object.assign(this, t);
  }
}
class ko extends S {
  dataType = "image";
  attribution = "Google";
  maxLevel = 20;
  style = "y";
  subdomains = "0123";
  // 已失效
  // public url = "https://gac-geo.googlecnapps.cn/maps/vt?lyrs={style}&x={x}&y={y}&z={z}";
  // 2024年新地址，不知道能坚持多久。 续：坚持不到10天就挂了。
  url = "https://gac-geo.googlecnapps.club/maps/vt?lyrs={style}&x={x}&y={y}&z={z}";
  // 访问原版google，你懂的
  // public url = "http://mt{s}.google.com/vt/lyrs={style}&src=app&x={x}&y={y}&z={z}";
  constructor(t) {
    super(t), Object.assign(this, t);
  }
}
class Ro extends S {
  attribution = "MapTiler";
  token = "get_your_own_key_QmavnBrQwNGsQ8YvPzZg";
  format = "jpg";
  style = "satellite-v2";
  url = "https://api.maptiler.com/tiles/{style}/{z}/{x}/{y}.{format}?key={token}";
  constructor(t) {
    super(t), Object.assign(this, t);
  }
}
class Bo extends S {
  dataType = "image";
  attribution = "Stadia";
  url = "https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}.jpg";
  constructor(t) {
    super(t), Object.assign(this, t);
  }
}
class Fo extends S {
  dataType = "image";
  attribution = "天地图[GS(2023)336号]";
  token = "";
  style = "img_w";
  subdomains = "01234";
  url = "https://t{s}.tianditu.gov.cn/DataServer?T={style}&x={x}&y={y}&l={z}&tk={token}";
  constructor(t) {
    super(t), Object.assign(this, t);
  }
}
class No extends S {
  dataType = "image";
  style = "sateTiles";
  attribution = "腾讯[GS(2023)1号]";
  subdomains = "0123";
  maxLevel = 18;
  constructor(t) {
    super(t), Object.assign(this, t);
  }
  getUrl(t, o, e) {
    const s = t >> 4, n = (1 << e) - o >> 4, a = Math.pow(2, e) - 1 - o;
    return `https://p${this.s}.map.gtimg.com/${this.style}/${e}/${s}/${n}/${t}_${a}.jpg`;
  }
}
class Yo extends S {
  attribution = "中科星图[GS(2022)3995号]";
  token = "";
  style = "img";
  format = "webp";
  subdomains = "12";
  url = "https://tiles{s}.geovisearth.com/base/v1/{style}/{z}/{x}/{y}?format={format}&tmsIds=w&token={token}";
  constructor(t) {
    super(t), Object.assign(this, t);
  }
}
const Zo = `
varying vec2 vUv;
uniform vec3 bkColor;
uniform vec3 airColor;

void main() {  
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);  
}  
`, Go = `



varying vec2 vUv;
uniform vec3 bkColor;
uniform vec3 airColor;

void main() {   

    // 当前点距中点的距离
    float d = distance(vUv, vec2(0.5f))*5.0f;
    
    if(d<0.49f){
        // 球体颜色
        float a = smoothstep(0.0f,0.4f,d-0.12f);     
        gl_FragColor = vec4(vec3(0.0f), a);               
    } else if(d<0.5){
        float c = (d-0.48f)/0.02f;
        gl_FragColor =vec4(mix(vec3(0.0f),airColor,c*c),1.5f-d);
    } else if(d<0.53f){
        // 光晕(0.48-0.52)
        float c = (d-0.49f)/0.04f;
        gl_FragColor = vec4(mix(airColor,bkColor,sqrt(c)),1.0);
    } else{
        // 球体外颜色
        gl_FragColor = vec4(bkColor,1.0f);
    }
    
    // #include <tonemapping_fragment>
    // #include <encodings_fragment>    
    // #include <colorspace_fragment>
    
}  
`;
class lt extends Gt {
  constructor(t) {
    super({
      uniforms: Ut.merge([
        Wt.fog,
        {
          bkColor: {
            value: t.bkColor
          },
          airColor: {
            value: t.airColor
          }
        }
      ]),
      transparent: !0,
      depthTest: !1,
      vertexShader: Zo,
      fragmentShader: Go,
      lights: !1
    });
  }
}
class Uo extends be {
  get bkColor() {
    return this.material.uniforms.bkColor.value;
  }
  set bkColor(t) {
    this.material.uniforms.bkColor.value.set(t);
  }
  constructor(t, o = new xe(6724044)) {
    super(new G(5, 5), new lt({ bkColor: t, airColor: o })), this.renderOrder = 999;
  }
}
const Qo = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ArcGisDemSource: Do,
  ArcGisSource: Ao,
  BingSource: Io,
  EarthMaskMaterial: lt,
  FakeEarth: Uo,
  GDSource: zo,
  GLViewer: Po,
  GeoqSource: Co,
  GoogleSource: ko,
  MapBoxSource: jo,
  MapTilerSource: Ro,
  StadiaSource: Bo,
  TDTSource: Fo,
  TXSource: No,
  ZKXTSource: Yo
}, Symbol.toStringTag, { value: "Module" }));
export {
  oo as FileLoaderEx,
  ot as ImageLoaderEx,
  L as LoaderFactory,
  Qt as RootTile,
  ne as Tile,
  eo as TileGridGeometry,
  io as TileLoader,
  ct as TileMap,
  Jt as TileMaterial,
  Vo as TileSimpleGeometry,
  S as TileSource,
  ao as TileTextureLoader,
  $o as author,
  st as getSafeTileUrlAndBounds,
  Qo as plugin,
  rt as rect2ImageBounds,
  qo as resizeImage,
  Ko as version
};
