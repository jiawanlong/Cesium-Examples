(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("three"));
	else if(typeof define === 'function' && define.amd)
		define(["three"], factory);
	else if(typeof exports === 'object')
		exports["threeWtm"] = factory(require("three"));
	else
		root["threeWtm"] = factory(root["THREE"]);
})(window, function(__WEBPACK_EXTERNAL_MODULE__0__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__0__;

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DataTransport", function() { return DataTransport; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DeUglify", function() { return DeUglify; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GeometryTransport", function() { return GeometryTransport; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MaterialStore", function() { return MaterialStore; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MaterialUtils", function() { return MaterialUtils; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MaterialsTransport", function() { return MaterialsTransport; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MeshTransport", function() { return MeshTransport; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ObjectManipulator", function() { return ObjectManipulator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ObjectUtils", function() { return ObjectUtils; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WorkerTaskManager", function() { return WorkerTaskManager; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WorkerTaskManagerDefaultRouting", function() { return WorkerTaskManagerDefaultRouting; });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);

/**
 * Development repository: https://github.com/kaisalmen/three-wtm
 */

/**
 * Static functions useful in the context of handling materials.
 */

class MaterialUtils {
  /**
   * Adds the provided material to the provided materials object if the material does not exists.
   * Use force override existing material.
   *
   * @param {object.<string, Material>} materialsObject
   * @param {Material} material
   * @param {string} materialName
   * @param {boolean} force
   * @param {boolean} [log] Log messages to the console
   */
  static addMaterial(materialsObject, material, materialName, force, log) {
    let existingMaterial; // ensure materialName is set

    material.name = materialName;

    if (!force) {
      existingMaterial = materialsObject[materialName];

      if (existingMaterial) {
        if (existingMaterial.uuid !== existingMaterial.uuid) {
          if (log) console.log('Same material name "' + existingMaterial.name + '" different uuid [' + existingMaterial.uuid + '|' + material.uuid + ']');
        }
      } else {
        materialsObject[materialName] = material;
        if (log) console.info('Material with name "' + materialName + '" was added.');
      }
    } else {
      materialsObject[materialName] = material;
      if (log) console.info('Material with name "' + materialName + '" was forcefully overridden.');
    }
  }
  /**
   * Transforms the named materials object to an object with named jsonified materials.
   *
   * @param {object.<string, Material>}
   * @returns {Object} Map of Materials in JSON representation
   */


  static getMaterialsJSON(materialsObject) {
    const materialsJSON = {};
    let material;

    for (const materialName in materialsObject) {
      material = materialsObject[materialName];

      if (typeof material.toJSON === 'function') {
        materialsJSON[materialName] = material.toJSON();
      }
    }

    return materialsJSON;
  }
  /**
   * Clones a material according the provided instructions.
   *
   * @param {object.<String, Material>} materials
   * @param {object} materialCloneInstruction
   * @param {boolean} [log]
   */


  static cloneMaterial(materials, materialCloneInstruction, log) {
    let material;

    if (materialCloneInstruction) {
      let materialNameOrg = materialCloneInstruction.materialNameOrg;
      materialNameOrg = materialNameOrg !== undefined && materialNameOrg !== null ? materialNameOrg : '';
      const materialOrg = materials[materialNameOrg];

      if (materialOrg) {
        material = materialOrg.clone();
        Object.assign(material, materialCloneInstruction.materialProperties);
        MaterialUtils.addMaterial(materials, material, materialCloneInstruction.materialProperties.name, true);
      } else {
        if (log) console.info('Requested material "' + materialNameOrg + '" is not available!');
      }
    }

    return material;
  }

}
/**
 * Development repository: https://github.com/kaisalmen/three-wtm
 */


class DeUglify {
  static buildThreeConst() {
    return 'const EventDispatcher = THREE.EventDispatcher;\n' + 'const BufferGeometry = THREE.BufferGeometry;\n' + 'const BufferAttribute = THREE.BufferAttribute;\n' + 'const Box3 = THREE.Box3;\n' + 'const Sphere = THREE.Sphere;\n' + 'const Texture = THREE.Texture;\n' + 'const MaterialLoader = THREE.MaterialLoader;\n';
  }

  static buildUglifiedThreeMapping() {
    function _BufferGeometry() {
      return three__WEBPACK_IMPORTED_MODULE_0__["BufferGeometry"];
    }

    function _BufferAttribute() {
      return three__WEBPACK_IMPORTED_MODULE_0__["BufferAttribute"];
    }

    function _Box3() {
      return three__WEBPACK_IMPORTED_MODULE_0__["Box3"];
    }

    function _Sphere() {
      return three__WEBPACK_IMPORTED_MODULE_0__["Sphere"];
    }

    function _Texture() {
      return three__WEBPACK_IMPORTED_MODULE_0__["Texture"];
    }

    function _MaterialLoader() {
      return three__WEBPACK_IMPORTED_MODULE_0__["MaterialLoader"];
    }

    return DeUglify.buildUglifiedNameAssignment(_BufferGeometry, 'BufferGeometry', /_BufferGeometry/, false) + DeUglify.buildUglifiedNameAssignment(_BufferAttribute, 'BufferAttribute', /_BufferAttribute/, false) + DeUglify.buildUglifiedNameAssignment(_Box3, 'Box3', /_Box3/, false) + DeUglify.buildUglifiedNameAssignment(_Sphere, 'Sphere', /_Sphere/, false) + DeUglify.buildUglifiedNameAssignment(_Texture, 'Texture', /_Texture/, false) + DeUglify.buildUglifiedNameAssignment(_MaterialLoader, 'MaterialLoader', /_MaterialLoader/, false);
  }

  static buildUglifiedThreeWtmMapping() {
    function _DataTransport() {
      return DataTransport;
    }

    function _GeometryTransport() {
      return GeometryTransport;
    }

    function _MeshTransport() {
      return MeshTransport;
    }

    function _MaterialsTransport() {
      return MaterialsTransport;
    }

    function _MaterialUtils() {
      return MaterialUtils;
    }

    return DeUglify.buildUglifiedNameAssignment(_DataTransport, 'DataTransport', /_DataTransport/, true) + DeUglify.buildUglifiedNameAssignment(_GeometryTransport, 'GeometryTransport', /_GeometryTransport/, true) + DeUglify.buildUglifiedNameAssignment(_MeshTransport, 'MeshTransport', /_MeshTransport/, true) + DeUglify.buildUglifiedNameAssignment(_MaterialsTransport, 'MaterialsTransport', /_MaterialsTransport/, true) + DeUglify.buildUglifiedNameAssignment(_MaterialUtils, 'MaterialUtils', /_MaterialUtils/, true);
  }

  static buildUglifiedNameAssignment(func, name, methodPattern, invert) {
    let funcStr = func.toString(); // remove the method name and any line breaks (rollup lib creation, non-uglify case

    funcStr = funcStr.replace(methodPattern, "").replace(/[\r\n]+/gm, ""); // remove return and any semi-colons

    funcStr = funcStr.replace(/.*return/, "").replace(/\}/, "").replace(/;/gm, "");
    const retrieveNamed = funcStr.trim(); // return non-empty string in uglified case (name!=retrieveNamed); e.g. "const BufferGeometry = e";
    // return empty string in case of non-uglified lib/src

    let output = "";

    if (retrieveNamed !== name) {
      const left = invert ? name : retrieveNamed;
      const right = invert ? retrieveNamed : name;
      output = "const " + left + " = " + right + ";\n";
    }

    return output;
  }

}
/**
 * Define a base structure that is used to ship data in between main and workers.
 */


class DataTransport {
  /**
   * Creates a new {@link DataTransport}.
   * @param {string} [cmd]
   * @param {string} [id]
   */
  constructor(cmd, id) {
    this.main = {
      cmd: cmd !== undefined ? cmd : 'unknown',
      id: id !== undefined ? id : 0,
      type: 'DataTransport',

      /** @type {number} */
      progress: 0,
      buffers: {},
      params: {}
    };
    /** @type {ArrayBuffer[]} */

    this.transferables = [];
  }
  /**
   * Populate this object with previously serialized data.
   * @param {object} transportObject
   * @return {DataTransport}
   */


  loadData(transportObject) {
    this.main.cmd = transportObject.cmd;
    this.main.id = transportObject.id;
    this.main.type = 'DataTransport';
    this.setProgress(transportObject.progress);
    this.setParams(transportObject.params);

    if (transportObject.buffers) {
      Object.entries(transportObject.buffers).forEach(([name, buffer]) => {
        this.main.buffers[name] = buffer;
      });
    }

    return this;
  }
  /**
   * Returns the value of the command.
   * @return {string}
   */


  getCmd() {
    return this.main.cmd;
  }
  /**
   * Returns the id.
   * @return {string}
   */


  getId() {
    return this.main.id;
  }
  /**
   * Set a parameter object which is a map with string keys and strings or objects as values.
   * @param {object.<string, *>} params
   * @return {DataTransport}
   */


  setParams(params) {
    if (params !== null && params !== undefined) {
      this.main.params = params;
    }

    return this;
  }
  /**
   * Return the parameter object
   * @return {object.<string, *>}
   */


  getParams() {
    return this.main.params;
  }
  /**
   * Set the current progress (e.g. percentage of progress)
   * @param {number} numericalValue
   * @return {DataTransport}
   */


  setProgress(numericalValue) {
    this.main.progress = numericalValue;
    return this;
  }
  /**
   * Add a named {@link ArrayBuffer}
   * @param {string} name
   * @param {ArrayBuffer} buffer
   * @return {DataTransport}
   */


  addBuffer(name, buffer) {
    this.main.buffers[name] = buffer;
    return this;
  }
  /**
   * Retrieve an {@link ArrayBuffer} by name
   * @param {string} name
   * @return {ArrayBuffer}
   */


  getBuffer(name) {
    return this.main.buffers[name];
  }
  /**
   * Package all data buffers into the transferable array. Clone if data needs to stay in current context.
   * @param {boolean} cloneBuffers
   * @return {DataTransport}
   */


  package(cloneBuffers) {
    for (let buffer of Object.values(this.main.buffers)) {
      if (buffer !== null && buffer !== undefined) {
        const potentialClone = cloneBuffers ? buffer.slice(0) : buffer;
        this.transferables.push(potentialClone);
      }
    }

    return this;
  }
  /**
   * Return main data object
   * @return {object}
   */


  getMain() {
    return this.main;
  }
  /**
   * Return all transferable in one array.
   * @return {ArrayBuffer[]}
   */


  getTransferables() {
    return this.transferables;
  }
  /**
   * Posts a message by invoking the method on the provided object.
   * @param {object} postMessageImpl
   * @return {DataTransport}
   */


  postMessage(postMessageImpl) {
    postMessageImpl.postMessage(this.main, this.transferables);
    return this;
  }

}
/**
 * Define a structure that is used to ship materials data between main and workers.
 */


class MaterialsTransport extends DataTransport {
  /**
   * Creates a new {@link MeshMessageStructure}.
   * @param {string} [cmd]
   * @param {string} [id]
   */
  constructor(cmd, id) {
    super(cmd, id);
    this.main.type = 'MaterialsTransport';
    /** {object.<string, Material>} */

    this.main.materials = {};
    /** {object.<number, string>} */

    this.main.multiMaterialNames = {};
    this.main.cloneInstructions = [];
  }
  /**
   * See {@link DataTransport#loadData}
   * @param {object} transportObject
   * @return {MaterialsTransport}
   */


  loadData(transportObject) {
    super.loadData(transportObject);
    this.main.type = 'MaterialsTransport';
    Object.assign(this.main, transportObject);
    const materialLoader = new three__WEBPACK_IMPORTED_MODULE_0__["MaterialLoader"]();
    Object.entries(this.main.materials).forEach(([name, materialObject]) => {
      this.main.materials[name] = materialLoader.parse(materialObject);
    });
    return this;
  }

  _cleanMaterial(material) {
    Object.entries(material).forEach(([key, value]) => {
      if (value instanceof three__WEBPACK_IMPORTED_MODULE_0__["Texture"] || value === null) {
        material[key] = undefined;
      }
    });
    return material;
  }
  /**
   * See {@link DataTransport#loadData}
   * @param {string} name
   * @param {ArrayBuffer} buffer
   * @return {MaterialsTransport}
   */


  addBuffer(name, buffer) {
    super.addBuffer(name, buffer);
    return this;
  }
  /**
   * See {@link DataTransport#setParams}
   * @param {object.<string, *>} params
   * @return {MaterialsTransport}
   */


  setParams(params) {
    super.setParams(params);
    return this;
  }
  /**
   * Set an object containing named materials.
   * @param {object.<string, Material>} materials
   */


  setMaterials(materials) {
    if (materials !== undefined && materials !== null && Object.keys(materials).length > 0) this.main.materials = materials;
    return this;
  }
  /**
   * Returns all maerials
   * @return {object.<string, Material>}
   */


  getMaterials() {
    return this.main.materials;
  }
  /**
   * Removes all textures and null values from all materials
   */


  cleanMaterials() {
    let clonedMaterials = {};
    let clonedMaterial;

    for (let material of Object.values(this.main.materials)) {
      if (typeof material.clone === 'function') {
        clonedMaterial = material.clone();
        clonedMaterials[clonedMaterial.name] = this._cleanMaterial(clonedMaterial);
      }
    }

    this.setMaterials(clonedMaterials);
    return this;
  }
  /**
   * See {@link DataTransport#package}
   * @param {boolean} cloneBuffers
   * @return {DataTransport}
   */


  package(cloneBuffers) {
    super.package(cloneBuffers);
    this.main.materials = MaterialUtils.getMaterialsJSON(this.main.materials);
    return this;
  }
  /**
   * Tell whether a multi-material was defined
   * @return {boolean}
   */


  hasMultiMaterial() {
    return Object.keys(this.main.multiMaterialNames).length > 0;
  }
  /**
   * Returns a single material if it is defined or null.
   * @return {Material|null}
   */


  getSingleMaterial() {
    if (Object.keys(this.main.materials).length > 0) {
      return Object.entries(this.main.materials)[0][1];
    } else {
      return null;
    }
  }
  /**
   * Adds contained material or multi-material the provided materials object or it clones and adds new materials according clone instructions.
   *
   * @param {Object.<string, Material>} materials
   * @param {boolean} log
   *
   * @return {Material|Material[]}
   */


  processMaterialTransport(materials, log) {
    for (let i = 0; i < this.main.cloneInstructions.length; i++) {
      MaterialUtils.cloneMaterial(materials, this.main.cloneInstructions[i], log);
    }

    let outputMaterial;

    if (this.hasMultiMaterial()) {
      // multi-material
      outputMaterial = [];
      Object.entries(this.main.multiMaterialNames).forEach(([materialIndex, materialName]) => {
        outputMaterial[materialIndex] = materials[materialName];
      });
    } else {
      const singleMaterial = this.getSingleMaterial();

      if (singleMaterial !== null) {
        outputMaterial = materials[singleMaterial.name];
        if (!outputMaterial) outputMaterial = singleMaterial;
      }
    }

    return outputMaterial;
  }

}
/**
 * Define a structure that is used to send geometry data between main and workers.
 */


class GeometryTransport extends DataTransport {
  /**
   * Creates a new {@link GeometryTransport}.
   * @param {string} [cmd]
   * @param {string} [id]
   */
  constructor(cmd, id) {
    super(cmd, id);
    this.main.type = 'GeometryTransport'; // 0: mesh, 1: line, 2: point

    /** @type {number} */

    this.main.geometryType = 0;
    /** @type {object} */

    this.main.geometry = {};
    /** @type {BufferGeometry} */

    this.main.bufferGeometry = null;
  }
  /**
   * See {@link DataTransport#loadData}
   * @param {object} transportObject
   * @return {GeometryTransport}
   */


  loadData(transportObject) {
    super.loadData(transportObject);
    this.main.type = 'GeometryTransport';
    return this.setGeometry(transportObject.geometry, transportObject.geometryType);
  }
  /**
   * Returns the geometry type [0=Mesh|1=LineSegments|2=Points]
   * @return {number}
   */


  getGeometryType() {
    return this.main.geometryType;
  }
  /**
   * See {@link DataTransport#setParams}
   * @param {object} params
   * @return {GeometryTransport}
   */


  setParams(params) {
    super.setParams(params);
    return this;
  }
  /**
   * Set the {@link BufferGeometry} and geometry type that can be used when a mesh is created.
   *
   * @param {BufferGeometry} geometry
   * @param {number} geometryType [0=Mesh|1=LineSegments|2=Points]
   * @return {GeometryTransport}
   */


  setGeometry(geometry, geometryType) {
    this.main.geometry = geometry;
    this.main.geometryType = geometryType;
    if (geometry instanceof three__WEBPACK_IMPORTED_MODULE_0__["BufferGeometry"]) this.main.bufferGeometry = geometry;
    return this;
  }
  /**
   * Package {@link BufferGeometry} and prepare it for transport.
   *
   * @param {boolean} cloneBuffers Clone buffers if their content shall stay in the current context.
   * @return {GeometryTransport}
   */


  package(cloneBuffers) {
    super.package(cloneBuffers);
    const vertexBA = this.main.geometry.getAttribute('position');
    const normalBA = this.main.geometry.getAttribute('normal');
    const uvBA = this.main.geometry.getAttribute('uv');
    const colorBA = this.main.geometry.getAttribute('color');
    const skinIndexBA = this.main.geometry.getAttribute('skinIndex');
    const skinWeightBA = this.main.geometry.getAttribute('skinWeight');
    const indexBA = this.main.geometry.getIndex();

    this._addBufferAttributeToTransferable(vertexBA, cloneBuffers);

    this._addBufferAttributeToTransferable(normalBA, cloneBuffers);

    this._addBufferAttributeToTransferable(uvBA, cloneBuffers);

    this._addBufferAttributeToTransferable(colorBA, cloneBuffers);

    this._addBufferAttributeToTransferable(skinIndexBA, cloneBuffers);

    this._addBufferAttributeToTransferable(skinWeightBA, cloneBuffers);

    this._addBufferAttributeToTransferable(indexBA, cloneBuffers);

    return this;
  }
  /**
   * Reconstructs the {@link BufferGeometry} from the raw buffers.
   * @param {boolean} cloneBuffers
   * @return {GeometryTransport}
   */


  reconstruct(cloneBuffers) {
    if (this.main.bufferGeometry instanceof three__WEBPACK_IMPORTED_MODULE_0__["BufferGeometry"]) return this;
    this.main.bufferGeometry = new three__WEBPACK_IMPORTED_MODULE_0__["BufferGeometry"]();
    const transferredGeometry = this.main.geometry;

    this._assignAttribute(transferredGeometry.attributes.position, 'position', cloneBuffers);

    this._assignAttribute(transferredGeometry.attributes.normal, 'normal', cloneBuffers);

    this._assignAttribute(transferredGeometry.attributes.uv, 'uv', cloneBuffers);

    this._assignAttribute(transferredGeometry.attributes.color, 'color', cloneBuffers);

    this._assignAttribute(transferredGeometry.attributes.skinIndex, 'skinIndex', cloneBuffers);

    this._assignAttribute(transferredGeometry.attributes.skinWeight, 'skinWeight', cloneBuffers);

    const index = transferredGeometry.index;

    if (index !== null && index !== undefined) {
      const indexBuffer = cloneBuffers ? index.array.slice(0) : index.array;
      this.main.bufferGeometry.setIndex(new three__WEBPACK_IMPORTED_MODULE_0__["BufferAttribute"](indexBuffer, index.itemSize, index.normalized));
    }

    const boundingBox = transferredGeometry.boundingBox;
    if (boundingBox !== null) this.main.bufferGeometry.boundingBox = Object.assign(new three__WEBPACK_IMPORTED_MODULE_0__["Box3"](), boundingBox);
    const boundingSphere = transferredGeometry.boundingSphere;
    if (boundingSphere !== null) this.main.bufferGeometry.boundingSphere = Object.assign(new three__WEBPACK_IMPORTED_MODULE_0__["Sphere"](), boundingSphere);
    this.main.bufferGeometry.uuid = transferredGeometry.uuid;
    this.main.bufferGeometry.name = transferredGeometry.name;
    this.main.bufferGeometry.type = transferredGeometry.type;
    this.main.bufferGeometry.groups = transferredGeometry.groups;
    this.main.bufferGeometry.drawRange = transferredGeometry.drawRange;
    this.main.bufferGeometry.userData = transferredGeometry.userData;
    return this;
  }
  /**
   * Returns the {@link BufferGeometry}.
   * @return {BufferGeometry|null}
   */


  getBufferGeometry() {
    return this.main.bufferGeometry;
  }

  _addBufferAttributeToTransferable(input, cloneBuffer) {
    if (input !== null && input !== undefined) {
      const arrayBuffer = cloneBuffer ? input.array.slice(0) : input.array;
      this.transferables.push(arrayBuffer.buffer);
    }

    return this;
  }

  _assignAttribute(attr, attrName, cloneBuffer) {
    if (attr) {
      const arrayBuffer = cloneBuffer ? attr.array.slice(0) : attr.array;
      this.main.bufferGeometry.setAttribute(attrName, new three__WEBPACK_IMPORTED_MODULE_0__["BufferAttribute"](arrayBuffer, attr.itemSize, attr.normalized));
    }

    return this;
  }

}
/**
 * Define a structure that is used to send mesh data between main and workers.
 */


class MeshTransport extends GeometryTransport {
  /**
   * Creates a new {@link MeshTransport}.
   * @param {string} [cmd]
   * @param {string} [id]
   */
  constructor(cmd, id) {
    super(cmd, id);
    this.main.type = 'MeshTransport'; // needs to be added as we cannot inherit from both materials and geometry

    this.main.materialsTransport = new MaterialsTransport();
  }
  /**
   * See {@link GeometryTransport#loadData}
   * @param {object} transportObject
   * @return {MeshTransport}
   */


  loadData(transportObject) {
    super.loadData(transportObject);
    this.main.type = 'MeshTransport';
    this.main.meshName = transportObject.meshName;
    this.main.materialsTransport = new MaterialsTransport().loadData(transportObject.materialsTransport.main);
    return this;
  }
  /**
   * See {@link GeometryTransport#loadData}
   * @param {object} params
   * @return {MeshTransport}
   */


  setParams(params) {
    super.setParams(params);
    return this;
  }
  /**
   * The {@link MaterialsTransport} wraps all info regarding the material for the mesh.
   * @param {MaterialsTransport} materialsTransport
   * @return {MeshTransport}
   */


  setMaterialsTransport(materialsTransport) {
    if (materialsTransport instanceof MaterialsTransport) this.main.materialsTransport = materialsTransport;
    return this;
  }
  /**
   * @return {MaterialsTransport}
   */


  getMaterialsTransport() {
    return this.main.materialsTransport;
  }
  /**
   * Sets the mesh and the geometry type [0=Mesh|1=LineSegments|2=Points]
   * @param {Mesh} mesh
   * @param {number} geometryType
   * @return {MeshTransport}
   */


  setMesh(mesh, geometryType) {
    this.main.meshName = mesh.name;
    super.setGeometry(mesh.geometry, geometryType);
    return this;
  }
  /**
   * See {@link GeometryTransport#package}
   * @param {boolean} cloneBuffers
   * @return {MeshTransport}
   */


  package(cloneBuffers) {
    super.package(cloneBuffers);
    if (this.main.materialsTransport !== null) this.main.materialsTransport.package(cloneBuffers);
    return this;
  }
  /**
   * See {@link GeometryTransport#reconstruct}
   * @param {boolean} cloneBuffers
   * @return {MeshTransport}
   */


  reconstruct(cloneBuffers) {
    super.reconstruct(cloneBuffers); // so far nothing needs to be done for material

    return this;
  }

}
/**
 * Utility for serializing object in memory
 */


class ObjectUtils {
  /**
   * Serializes a class with an optional prototype
   * @param targetClass
   * @param targetPrototype
   * @param fullObjectName
   * @param processPrototype
   * @return {string}
   */
  static serializePrototype(targetClass, targetPrototype, fullObjectName, processPrototype) {
    let prototypeFunctions = [];
    let objectString = '';
    let target;

    if (processPrototype) {
      objectString = targetClass.toString() + "\n\n";
      target = targetPrototype;
    } else {
      target = targetClass;
    }

    for (let name in target) {
      let objectPart = target[name];
      let code = objectPart.toString();

      if (typeof objectPart === 'function') {
        prototypeFunctions.push('\t' + name + ': ' + code + ',\n\n');
      }
    }

    let protoString = processPrototype ? '.prototype' : '';
    objectString += fullObjectName + protoString + ' = {\n\n';

    for (let i = 0; i < prototypeFunctions.length; i++) {
      objectString += prototypeFunctions[i];
    }

    objectString += '\n}\n;';
    return objectString;
  }
  /**
   * Serializes a class.
   * @param {object} targetClass An ES6+ class
   * @return {string}
   */


  static serializeClass(targetClass) {
    return targetClass.toString() + "\n\n";
  }

}
/**
 * Object manipulation utilities.
 */


class ObjectManipulator {
  /**
   * Applies values from parameter object via set functions or via direct assignment.
   *
   * @param {Object} objToAlter The objToAlter instance
   * @param {Object} params The parameter object
   * @param {boolean} forceCreation Force the creation of a property
   */
  static applyProperties(objToAlter, params, forceCreation) {
    // fast-fail
    if (objToAlter === undefined || objToAlter === null || params === undefined || params === null) return;
    let property, funcName, values;

    for (property in params) {
      funcName = 'set' + property.substring(0, 1).toLocaleUpperCase() + property.substring(1);
      values = params[property];

      if (typeof objToAlter[funcName] === 'function') {
        objToAlter[funcName](values);
      } else if (objToAlter.hasOwnProperty(property) || forceCreation) {
        objToAlter[property] = values;
      }
    }
  }

}
/**
 * Development repository: https://github.com/kaisalmen/three-wtm
 */

/**
 * Helper class around an object storing materials by name.
 * Optionally, create and store default materials.
 */


class MaterialStore {
  /**
   * Creates a new {@link MaterialStore}.
   * @param {boolean} createDefaultMaterials
   */
  constructor(createDefaultMaterials) {
    this.materials = {};

    if (createDefaultMaterials) {
      const defaultMaterial = new three__WEBPACK_IMPORTED_MODULE_0__["MeshStandardMaterial"]({
        color: 0xDCF1FF
      });
      defaultMaterial.name = 'defaultMaterial';
      const defaultVertexColorMaterial = new three__WEBPACK_IMPORTED_MODULE_0__["MeshStandardMaterial"]({
        color: 0xDCF1FF
      });
      defaultVertexColorMaterial.name = 'defaultVertexColorMaterial';
      defaultVertexColorMaterial.vertexColors = three__WEBPACK_IMPORTED_MODULE_0__["VertexColors"];
      const defaultLineMaterial = new three__WEBPACK_IMPORTED_MODULE_0__["LineBasicMaterial"]();
      defaultLineMaterial.name = 'defaultLineMaterial';
      const defaultPointMaterial = new three__WEBPACK_IMPORTED_MODULE_0__["PointsMaterial"]({
        size: 0.1
      });
      defaultPointMaterial.name = 'defaultPointMaterial';
      this.materials[defaultMaterial.name] = defaultMaterial;
      this.materials[defaultVertexColorMaterial.name] = defaultVertexColorMaterial;
      this.materials[defaultLineMaterial.name] = defaultLineMaterial;
      this.materials[defaultPointMaterial.name] = defaultPointMaterial;
    }
  }
  /**
   * Set materials loaded by any supplier of an Array of {@link Material}.
   *
   * @param {object<string, Material>} newMaterials Object with named {@link Material}
   * @param {boolean} forceOverrideExisting boolean Override existing material
   */


  addMaterials(newMaterials, forceOverrideExisting) {
    if (newMaterials === undefined || newMaterials === null) newMaterials = {};

    if (Object.keys(newMaterials).length > 0) {
      let material;

      for (const materialName in newMaterials) {
        material = newMaterials[materialName];
        MaterialUtils.addMaterial(this.materials, material, materialName, forceOverrideExisting === true);
      }
    }
  }
  /**
   * Returns the mapping object of material name and corresponding material.
   *
   * @returns {Object} Map of {@link Material}
   */


  getMaterials() {
    return this.materials;
  }
  /**
   *
   * @param {String} materialName
   * @returns {Material}
   */


  getMaterial(materialName) {
    return this.materials[materialName];
  }
  /**
   * Removes all materials
   */


  clearMaterials() {
    this.materials = {};
  }

}
/**
 * Development repository: https://github.com/kaisalmen/three-wtm
 */


class WorkerTaskManagerDefaultRouting {
  static comRouting(context, message, object, initFunction, executeFunction) {
    let payload = message.data;

    if (payload.cmd === 'init') {
      if (object !== undefined && object !== null) {
        object[initFunction](context, payload.workerId, payload.config);
      } else {
        initFunction(context, payload.workerId, payload.config);
      }
    } else if (payload.cmd === 'execute') {
      if (object !== undefined && object !== null) {
        object[executeFunction](context, payload.workerId, payload.config);
      } else {
        executeFunction(context, payload.workerId, payload.config);
      }
    }
  }

}
/**
 * Development repository: https://github.com/kaisalmen/three-wtm
 * Initial idea by Don McCurdy / https://www.donmccurdy.com
 */

/**
 * Register one to many tasks type to the WorkerTaskManager. Then init and enqueue a worker based execution by passing
 * configuration and buffers. The WorkerTaskManager allows to execute a maximum number of executions in parallel.
 */


class WorkerTaskManager {
  /**
   * Creates a new WorkerTaskManager instance.
   *
   * @param {number} [maxParallelExecutions] How many workers are allowed to be executed in parallel.
   */
  constructor(maxParallelExecutions) {
    /**
     * @type {Map<string, WorkerTypeDefinition>}
     */
    this.taskTypes = new Map();
    this.verbose = false;
    this.maxParallelExecutions = maxParallelExecutions ? maxParallelExecutions : 4;
    this.actualExecutionCount = 0;
    /**
     * @type {StoredExecution[]}
     */

    this.storedExecutions = [];
    this.teardown = false;
  }
  /**
   * Set if logging should be verbose
   *
   * @param {boolean} verbose
   * @return {WorkerTaskManager}
   */


  setVerbose(verbose) {
    this.verbose = verbose;
    return this;
  }
  /**
   * Set the maximum number of parallel executions.
   *
   * @param {number} maxParallelExecutions How many workers are allowed to be executed in parallel.
   * @return {WorkerTaskManager}
   */


  setMaxParallelExecutions(maxParallelExecutions) {
    this.maxParallelExecutions = maxParallelExecutions;
    return this;
  }
  /**
   * Returns the maximum number of parallel executions.
   * @return {number}
   */


  getMaxParallelExecutions() {
    return this.maxParallelExecutions;
  }
  /**
   * Returns true if support for the given task type is available.
   *
   * @param {string} taskType The task type as string
   * @return boolean
   */


  supportsTaskType(taskType) {
    return this.taskTypes.has(taskType);
  }
  /**
   * Registers functions and dependencies for a new task type.
   *
   * @param {string} taskType The name to be used for registration.
   * @param {Function} initFunction The function to be called when the worker is initialised
   * @param {Function} executeFunction The function to be called when the worker is executed
   * @param {Function} comRoutingFunction The function that should handle communication, leave undefined for default behavior
   * @param {boolean} fallback Set to true if execution should be performed in main
   * @param {Object[]} [dependencyDescriptions]
   * @return {boolean} Tells if registration is possible (new=true) or if task was already registered (existing=false)
   */


  registerTaskType(taskType, initFunction, executeFunction, comRoutingFunction, fallback, dependencyDescriptions) {
    let allowedToRegister = !this.supportsTaskType(taskType);

    if (allowedToRegister) {
      let workerTypeDefinition = new WorkerTypeDefinition(taskType, this.maxParallelExecutions, fallback, this.verbose);
      workerTypeDefinition.setFunctions(initFunction, executeFunction, comRoutingFunction);
      workerTypeDefinition.setDependencyDescriptions(dependencyDescriptions);
      this.taskTypes.set(taskType, workerTypeDefinition);
    }

    return allowedToRegister;
  }
  /**
   * Registers functionality for a new task type based on module file.
   *
   * @param {string} taskType The name to be used for registration.
   * @param {string} workerModuleUrl The URL to be used for the Worker. Module must provide logic to handle "init" and "execute" messages.
   * @return {boolean} Tells if registration is possible (new=true) or if task was already registered (existing=false)
   */


  registerTaskTypeModule(taskType, workerModuleUrl) {
    let allowedToRegister = !this.supportsTaskType(taskType);

    if (allowedToRegister) {
      let workerTypeDefinition = new WorkerTypeDefinition(taskType, this.maxParallelExecutions, false, this.verbose);
      workerTypeDefinition.setWorkerModule(workerModuleUrl);
      this.taskTypes.set(taskType, workerTypeDefinition);
    }

    return allowedToRegister;
  }
  /**
   * Provides initialization configuration and transferable objects.
   *
   * @param {string} taskType The name of the registered task type.
   * @param {object} config Configuration properties as serializable string.
   * @param {Transferable[]} [transferables] Any optional {@link ArrayBuffer} encapsulated in object.
   */


  async initTaskType(taskType, config, transferables) {
    let workerTypeDefinition = this.taskTypes.get(taskType);

    if (workerTypeDefinition) {
      if (!workerTypeDefinition.status.initStarted) {
        workerTypeDefinition.status.initStarted = true;

        if (workerTypeDefinition.isWorkerModule()) {
          await workerTypeDefinition.createWorkerModules().then(() => workerTypeDefinition.initWorkers(config, transferables)).then(() => workerTypeDefinition.status.initComplete = true).catch(e => console.error(e));
        } else {
          await workerTypeDefinition.loadDependencies().then(() => workerTypeDefinition.createWorkers()).then(() => workerTypeDefinition.initWorkers(config, transferables)).then(() => workerTypeDefinition.status.initComplete = true).catch(e => console.error(e));
        }
      } else {
        while (!workerTypeDefinition.status.initComplete) {
          await this._wait(10);
        }
      }
    }
  }

  async _wait(milliseconds) {
    return new Promise(resolve => {
      setTimeout(resolve, milliseconds);
    });
  }
  /**
   * Queues a new task of the given type. Task will not execute until initialization completes.
   *
   * @param {string} taskType The name of the registered task type.
   * @param {object} config Configuration properties as serializable string.
   * @param {Function} assetAvailableFunction Invoke this function if an asset become intermediately available
   * @param {Transferable[]} [transferables] Any optional {@link ArrayBuffer} encapsulated in object.
   * @return {Promise}
   */


  async enqueueForExecution(taskType, config, assetAvailableFunction, transferables) {
    let localPromise = new Promise((resolveUser, rejectUser) => {
      this.storedExecutions.push(new StoredExecution(taskType, config, assetAvailableFunction, resolveUser, rejectUser, transferables));

      this._depleteExecutions();
    });
    return localPromise;
  }

  _depleteExecutions() {
    let counter = 0;

    while (this.actualExecutionCount < this.maxParallelExecutions && counter < this.storedExecutions.length) {
      // TODO: storedExecutions and results from worker seem to get mixed up
      let storedExecution = this.storedExecutions[counter];
      let workerTypeDefinition = this.taskTypes.get(storedExecution.taskType);
      let taskWorker = workerTypeDefinition.getAvailableTask();

      if (taskWorker) {
        this.storedExecutions.splice(counter, 1);
        this.actualExecutionCount++;
        let promiseWorker = new Promise((resolveWorker, rejectWorker) => {
          taskWorker.onmessage = message => {
            // allow intermediate asset provision before flagging execComplete
            if (message.data.cmd === 'assetAvailable') {
              if (storedExecution.assetAvailableFunction instanceof Function) {
                storedExecution.assetAvailableFunction(message.data);
              }
            } else {
              resolveWorker(message);
            }
          };

          taskWorker.onerror = rejectWorker;
          taskWorker.postMessage({
            cmd: "execute",
            workerId: taskWorker.getId(),
            config: storedExecution.config
          }, storedExecution.transferables);
        });
        promiseWorker.then(message => {
          workerTypeDefinition.returnAvailableTask(taskWorker);
          storedExecution.resolve(message.data);
          this.actualExecutionCount--;

          this._depleteExecutions();
        }).catch(e => {
          storedExecution.reject("Execution error: " + e);
        });
      } else {
        counter++;
      }
    }
  }
  /**
   * Destroys all workers and associated resources.
   * @return {WorkerTaskManager}
   */


  dispose() {
    this.teardown = true;

    for (let workerTypeDefinition of this.taskTypes.values()) {
      workerTypeDefinition.dispose();
    }

    return this;
  }

}
/**
 * Defines a worker type: functions, dependencies and runtime information once it was created.
 */


class WorkerTypeDefinition {
  /**
   * Creates a new instance of {@link WorkerTypeDefinition}.
   *
   * @param {string} taskType The name of the registered task type.
   * @param {Number} maximumCount Maximum worker count
   * @param {boolean} fallback Set to true if execution should be performed in main
   * @param {boolean} [verbose] Set if logging should be verbose
   */
  constructor(taskType, maximumCount, fallback, verbose) {
    this.taskType = taskType;
    this.fallback = fallback;
    this.verbose = verbose === true;
    this.initialised = false;
    this.functions = {
      /** @type {Function} */
      init: null,

      /** @type {Function} */
      execute: null,

      /** @type {Function} */
      comRouting: null,
      dependencies: {
        /** @type {Object[]} */
        descriptions: [],

        /** @type {string[]} */
        code: []
      },

      /**
       * @type {URL}
       */
      workerModuleUrl: null
    };
    this.workers = {
      /** @type {string[]} */
      code: [],

      /** @type {TaskWorker[]|MockedTaskWorker[]} */
      instances: new Array(maximumCount),

      /** @type {TaskWorker[]|MockedTaskWorker[]} */
      available: []
    };
    this.status = {
      initStarted: false,
      initComplete: false
    };
  }

  getTaskType() {
    return this.taskType;
  }
  /**
   * Set the three functions. A default comRouting function is used if it is not passed here.
   * Then it creates the code fr.
   *
   * @param {Function} initFunction The function to be called when the worker is initialised
   * @param {Function} executeFunction The function to be called when the worker is executed
   * @param {Function} [comRoutingFunction] The function that should handle communication, leave undefined for default behavior
   */


  setFunctions(initFunction, executeFunction, comRoutingFunction) {
    this.functions.init = initFunction;
    this.functions.execute = executeFunction;
    this.functions.comRouting = comRoutingFunction;

    if (this.functions.comRouting === undefined || this.functions.comRouting === null) {
      this.functions.comRouting = WorkerTaskManagerDefaultRouting.comRouting;
    }

    this._addWorkerCode('init', this.functions.init.toString());

    this._addWorkerCode('execute', this.functions.execute.toString());

    this._addWorkerCode('comRouting', this.functions.comRouting.toString());

    this.workers.code.push('self.addEventListener( "message", message => comRouting( self, message, null, init, execute ), false );');
  }
  /**
   *
   * @param {string} functionName Name of the function
   * @param {string} functionString A function as string
   * @private
   */


  _addWorkerCode(functionName, functionString) {
    if (functionString.startsWith('function')) {
      this.workers.code.push('const ' + functionName + ' = ' + functionString + ';\n\n');
    } else {
      this.workers.code.push('function ' + functionString + ';\n\n');
    }
  }
  /**
   * Set the url of all dependent libraries (only used in non-module case).
   *
   * @param {Object[]} dependencyDescriptions URLs of code init and execute functions rely on.
   */


  setDependencyDescriptions(dependencyDescriptions) {
    if (dependencyDescriptions) {
      dependencyDescriptions.forEach(description => {
        this.functions.dependencies.descriptions.push(description);
      });
    }
  }
  /**
   * Set the url of the module worker.
   *
   * @param {string} workerModuleUrl The URL is created from this string.
   */


  setWorkerModule(workerModuleUrl) {
    this.functions.workerModuleUrl = new URL(workerModuleUrl, window.location.href);
  }
  /**
   * Is it a module worker?
   *
   * @return {boolean} True or false
   */


  isWorkerModule() {
    return this.functions.workerModuleUrl !== null;
  }
  /**
   * Loads all dependencies and stores each as {@link ArrayBuffer} into the array. Returns if all loading is completed.
   *
   * @return {String[]}
   */


  async loadDependencies() {
    let promises = [];
    let fileLoader = new three__WEBPACK_IMPORTED_MODULE_0__["FileLoader"]();
    fileLoader.setResponseType('arraybuffer');

    for (let description of this.functions.dependencies.descriptions) {
      if (description.url) {
        let url = new URL(description.url, window.location.href);
        promises.push(fileLoader.loadAsync(url.href, report => {
          if (this.verbose) console.log(report);
        }));
      }

      if (description.code) {
        promises.push(new Promise(resolve => resolve(description.code)));
      }
    }

    if (this.verbose) console.log('Task: ' + this.getTaskType() + ': Waiting for completion of loading of all dependencies.');
    this.functions.dependencies.code = await Promise.all(promises);
  }
  /**
   * Creates workers based on the configured function and dependency strings.
   *
   */


  async createWorkers() {
    let worker;

    if (!this.fallback) {
      let workerBlob = new Blob(this.functions.dependencies.code.concat(this.workers.code), {
        type: 'application/javascript'
      });
      let objectURL = window.URL.createObjectURL(workerBlob);

      for (let i = 0; i < this.workers.instances.length; i++) {
        worker = new TaskWorker(i, objectURL);
        this.workers.instances[i] = worker;
      }
    } else {
      for (let i = 0; i < this.workers.instances.length; i++) {
        worker = new MockedTaskWorker(i, this.functions.init, this.functions.execute);
        this.workers.instances[i] = worker;
      }
    }
  }
  /**
   * Creates module workers.
   *
   */


  async createWorkerModules() {
    for (let worker, i = 0; i < this.workers.instances.length; i++) {
      worker = new TaskWorker(i, this.functions.workerModuleUrl.href, {
        type: "module"
      });
      this.workers.instances[i] = worker;
    }
  }
  /**
   * Initialises all workers with common configuration data.
   *
   * @param {object} config
   * @param {Transferable[]} transferables
   */


  async initWorkers(config, transferables) {
    let promises = [];

    for (let taskWorker of this.workers.instances) {
      let taskWorkerPromise = new Promise((resolveWorker, rejectWorker) => {
        taskWorker.onmessage = message => {
          if (this.verbose) console.log('Init Complete: ' + message.data.id);
          resolveWorker(message);
        };

        taskWorker.onerror = rejectWorker; // ensure all transferables are copies to all workers on init!

        let transferablesToWorker;

        if (transferables) {
          transferablesToWorker = [];

          for (let i = 0; i < transferables.length; i++) {
            transferablesToWorker.push(transferables[i].slice(0));
          }
        }

        taskWorker.postMessage({
          cmd: "init",
          workerId: taskWorker.getId(),
          config: config
        }, transferablesToWorker);
      });
      promises.push(taskWorkerPromise);
    }

    if (this.verbose) console.log('Task: ' + this.getTaskType() + ': Waiting for completion of initialization of all workers.');
    await Promise.all(promises);
    this.workers.available = this.workers.instances;
  }
  /**
   * Returns the first {@link TaskWorker} or {@link MockedTaskWorker} from array of available workers.
   *
   * @return {TaskWorker|MockedTaskWorker|undefined}
   */


  getAvailableTask() {
    let task = undefined;

    if (this.hasTask()) {
      task = this.workers.available.shift();
    }

    return task;
  }
  /**
   * Returns if a task is available or not.
   *
   * @return {boolean}
   */


  hasTask() {
    return this.workers.available.length > 0;
  }
  /**
   *
   * @param {TaskWorker|MockedTaskWorker} taskWorker
   */


  returnAvailableTask(taskWorker) {
    this.workers.available.push(taskWorker);
  }
  /**
   * Dispose all worker instances.
   */


  dispose() {
    for (let taskWorker of this.workers.instances) {
      taskWorker.terminate();
    }
  }

}
/**
 * Contains all things required for later executions of Worker.
 */


class StoredExecution {
  /**
   * Creates a new instance.
   *
   * @param {string} taskType
   * @param {object} config
   * @param {Function} assetAvailableFunction
   * @param {Function} resolve
   * @param {Function} reject
   * @param {Transferable[]} [transferables]
   */
  constructor(taskType, config, assetAvailableFunction, resolve, reject, transferables) {
    this.taskType = taskType;
    this.config = config;
    this.assetAvailableFunction = assetAvailableFunction;
    this.resolve = resolve;
    this.reject = reject;
    this.transferables = transferables;
  }

}
/**
 * Extends the {@link Worker} with an id.
 */


class TaskWorker extends Worker {
  /**
   * Creates a new instance.
   *
   * @param {number} id Numerical id of the task.
   * @param {string} aURL
   * @param {object} [options]
   */
  constructor(id, aURL, options) {
    super(aURL, options);
    this.id = id;
  }
  /**
   * Returns the id.
   * @return {number}
   */


  getId() {
    return this.id;
  }

}
/**
 * This is a mock of a worker to be used on Main. It defines necessary functions, so it can be handled like
 * a regular {@link TaskWorker}.
 */


class MockedTaskWorker {
  /**
   * Creates a new instance.
   *
   * @param {number} id
   * @param {Function} initFunction
   * @param {Function} executeFunction
   */
  constructor(id, initFunction, executeFunction) {
    this.id = id;
    this.functions = {
      init: initFunction,
      execute: executeFunction
    };
  }
  /**
   * Returns the id.
   * @return {number}
   */


  getId() {
    return this.id;
  }
  /**
   * Delegates the message to the registered functions
   * @param {String} message
   * @param {Transferable[]} [transfer]
   */


  postMessage(message, transfer) {
    let scope = this;
    let self = {
      postMessage: function (m) {
        scope.onmessage({
          data: m
        });
      }
    };
    WorkerTaskManagerDefaultRouting.comRouting(self, {
      data: message
    }, null, scope.functions.init, scope.functions.execute);
  }
  /**
   * Mocking termination
   */


  terminate() {}

}



/***/ })
/******/ ]);
});