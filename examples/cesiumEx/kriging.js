/*!
 * author: [object Object] 
 * @sakitam-gis/kriging v0.1.0
 * build-time: 2019-7-6 20:41
 * LICENSE: MIT
 * (c) 2019-2019 https://github.com/sakitam-gis/kriging.js
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.kriging = {}));
}(this, function (exports) { 'use strict';

  function max(source) {
      return Math.max.apply(null, source);
  }
  function min(source) {
      return Math.min.apply(null, source);
  }
  function rep(source, n) {
      var array = [];
      for (var i = 0; i < n; i++) {
          array.push(source);
      }
      return array;
  }
  function pip(source, x, y) {
      var i = 0;
      var j = source.length - 1;
      var c = false;
      var length = source.length;
      for (; i < length; j = i++) {
          if (((source[i][1] > y) !== (source[j][1] > y))
              && (x < (source[j][0] - source[i][0]) * (y - source[i][1]) / (source[j][1] - source[i][1]) + source[i][0])) {
              c = !c;
          }
      }
      return c;
  }
  function matrixDiag(c, n) {
      var i = 0;
      var Z = rep(0, n * n);
      for (; i < n; i++) {
          Z[i * n + i] = c;
      }
      return Z;
  }
  function matrixTranspose(X, n, m) {
      var i = 0;
      var j;
      var Z = Array(m * n);
      for (; i < n; i++) {
          j = 0;
          for (; j < m; j++) {
              Z[j * n + i] = X[i * m + j];
          }
      }
      return Z;
  }
  function matrixAdd(X, Y, n, m) {
      var i = 0;
      var j;
      var Z = Array(n * m);
      for (; i < n; i++) {
          j = 0;
          for (; j < m; j++) {
              Z[i * m + j] = X[i * m + j] + Y[i * m + j];
          }
      }
      return Z;
  }
  function matrixMultiply(X, Y, n, m, p) {
      var i = 0;
      var j;
      var k;
      var Z = Array(n * p);
      for (; i < n; i++) {
          j = 0;
          for (; j < p; j++) {
              Z[i * p + j] = 0;
              k = 0;
              for (; k < m; k++) {
                  Z[i * p + j] += X[i * m + k] * Y[k * p + j];
              }
          }
      }
      return Z;
  }
  function matrixChol(X, n) {
      var i;
      var j;
      var k;
      var p = Array(n);
      for (i = 0; i < n; i++)
          p[i] = X[i * n + i];
      for (i = 0; i < n; i++) {
          for (j = 0; j < i; j++)
              p[i] -= X[i * n + j] * X[i * n + j];
          if (p[i] <= 0)
              return false;
          p[i] = Math.sqrt(p[i]);
          for (j = i + 1; j < n; j++) {
              for (k = 0; k < i; k++)
                  X[j * n + i] -= X[j * n + k] * X[i * n + k];
              X[j * n + i] /= p[i];
          }
      }
      for (i = 0; i < n; i++)
          X[i * n + i] = p[i];
      return true;
  }
  function matrixChol2inv(X, n) {
      var i;
      var j;
      var k;
      var sum;
      for (i = 0; i < n; i++) {
          X[i * n + i] = 1 / X[i * n + i];
          for (j = i + 1; j < n; j++) {
              sum = 0;
              for (k = i; k < j; k++)
                  sum -= X[j * n + k] * X[k * n + i];
              X[j * n + i] = sum / X[j * n + j];
          }
      }
      for (i = 0; i < n; i++)
          for (j = i + 1; j < n; j++)
              X[i * n + j] = 0;
      for (i = 0; i < n; i++) {
          X[i * n + i] *= X[i * n + i];
          for (k = i + 1; k < n; k++)
              X[i * n + i] += X[k * n + i] * X[k * n + i];
          for (j = i + 1; j < n; j++)
              for (k = j; k < n; k++)
                  X[i * n + j] += X[k * n + i] * X[k * n + j];
      }
      for (i = 0; i < n; i++)
          for (j = 0; j < i; j++)
              X[i * n + j] = X[j * n + i];
  }
  function matrixSolve(X, n) {
      var m = n;
      var b = Array(n * n);
      var indxc = Array(n);
      var indxr = Array(n);
      var ipiv = Array(n);
      var i;
      var icol = 0;
      var irow = 0;
      var j;
      var k;
      var l;
      var ll;
      var big;
      var dum;
      var pivinv;
      var temp;
      for (i = 0; i < n; i++) {
          for (j = 0; j < n; j++) {
              if (i === j)
                  b[i * n + j] = 1;
              else
                  b[i * n + j] = 0;
          }
      }
      for (j = 0; j < n; j++)
          ipiv[j] = 0;
      for (i = 0; i < n; i++) {
          big = 0;
          for (j = 0; j < n; j++) {
              if (ipiv[j] !== 1) {
                  for (k = 0; k < n; k++) {
                      if (ipiv[k] === 0) {
                          if (Math.abs(X[j * n + k]) >= big) {
                              big = Math.abs(X[j * n + k]);
                              irow = j;
                              icol = k;
                          }
                      }
                  }
              }
          }
          ++(ipiv[icol]);
          if (irow !== icol) {
              for (l = 0; l < n; l++) {
                  temp = X[irow * n + l];
                  X[irow * n + l] = X[icol * n + l];
                  X[icol * n + l] = temp;
              }
              for (l = 0; l < m; l++) {
                  temp = b[irow * n + l];
                  b[irow * n + l] = b[icol * n + l];
                  b[icol * n + l] = temp;
              }
          }
          indxr[i] = irow;
          indxc[i] = icol;
          if (X[icol * n + icol] === 0)
              return false;
          pivinv = 1 / X[icol * n + icol];
          X[icol * n + icol] = 1;
          for (l = 0; l < n; l++)
              X[icol * n + l] *= pivinv;
          for (l = 0; l < m; l++)
              b[icol * n + l] *= pivinv;
          for (ll = 0; ll < n; ll++) {
              if (ll !== icol) {
                  dum = X[ll * n + icol];
                  X[ll * n + icol] = 0;
                  for (l = 0; l < n; l++)
                      X[ll * n + l] -= X[icol * n + l] * dum;
                  for (l = 0; l < m; l++)
                      b[ll * n + l] -= b[icol * n + l] * dum;
              }
          }
      }
      for (l = (n - 1); l >= 0; l--) {
          if (indxr[l] !== indxc[l]) {
              for (k = 0; k < n; k++) {
                  temp = X[k * n + indxr[l]];
                  X[k * n + indxr[l]] = X[k * n + indxc[l]];
                  X[k * n + indxc[l]] = temp;
              }
          }
      }
      return true;
  }
  function variogramGaussian(h, nugget, range, sill, A) {
      return nugget + ((sill - nugget) / range)
          * (1.0 - Math.exp(-(1.0 / A) * Math.pow(h / range, 2)));
  }
  function variogramExponential(h, nugget, range, sill, A) {
      return nugget + ((sill - nugget) / range)
          * (1.0 - Math.exp(-(1.0 / A) * (h / range)));
  }
  function variogramSpherical(h, nugget, range, sill) {
      if (h > range)
          return nugget + (sill - nugget) / range;
      return nugget + ((sill - nugget) / range)
          * (1.5 * (h / range) - 0.5 * Math.pow(h / range, 3));
  }

  function train(t, x, y, model, sigma2, alpha) {
      var variogram = {
          t: t,
          x: x,
          y: y,
          nugget: 0.0,
          range: 0.0,
          sill: 0.0,
          A: 1 / 3,
          n: 0,
          model: variogramExponential,
          K: [],
          M: [],
      };
      switch (model) {
          case 'gaussian':
              variogram.model = variogramGaussian;
              break;
          case 'exponential':
              variogram.model = variogramExponential;
              break;
          case 'spherical':
              variogram.model = variogramSpherical;
              break;
          default:
              variogram.model = variogramExponential;
      }
      var i;
      var j;
      var k;
      var l;
      var n = t.length;
      var distance = Array((n * n - n) / 2);
      for (i = 0, k = 0; i < n; i++) {
          for (j = 0; j < i; j++, k++) {
              distance[k] = Array(2);
              distance[k][0] = Math.pow(Math.pow(x[i] - x[j], 2)
                  + Math.pow(y[i] - y[j], 2), 0.5);
              distance[k][1] = Math.abs(t[i] - t[j]);
          }
      }
      distance.sort(function (a, b) { return a[0] - b[0]; });
      variogram.range = distance[(n * n - n) / 2 - 1][0];
      var lags = ((n * n - n) / 2) > 30 ? 30 : (n * n - n) / 2;
      var tolerance = variogram.range / lags;
      var lag = rep(0, lags);
      var semi = rep(0, lags);
      if (lags < 30) {
          for (l = 0; l < lags; l++) {
              lag[l] = distance[l][0];
              semi[l] = distance[l][1];
          }
      }
      else {
          for (i = 0, j = 0, k = 0, l = 0; i < lags && j < ((n * n - n) / 2); i++, k = 0) {
              while (distance[j][0] <= ((i + 1) * tolerance)) {
                  lag[l] += distance[j][0];
                  semi[l] += distance[j][1];
                  j++;
                  k++;
                  if (j >= ((n * n - n) / 2))
                      break;
              }
              if (k > 0) {
                  lag[l] /= k;
                  semi[l] /= k;
                  l++;
              }
          }
          if (l < 2)
              return variogram;
      }
      n = l;
      variogram.range = lag[n - 1] - lag[0];
      var X = rep(1, 2 * n);
      var Y = Array(n);
      var A = variogram.A;
      for (i = 0; i < n; i++) {
          switch (model) {
              case 'gaussian':
                  X[i * 2 + 1] = 1.0 - Math.exp(-(1.0 / A) * Math.pow(lag[i] / variogram.range, 2));
                  break;
              case 'exponential':
                  X[i * 2 + 1] = 1.0 - Math.exp(-(1.0 / A) * lag[i] / variogram.range);
                  break;
              case 'spherical':
                  X[i * 2 + 1] = 1.5 * (lag[i] / variogram.range)
                      - 0.5 * Math.pow(lag[i] / variogram.range, 3);
                  break;
          }
          Y[i] = semi[i];
      }
      var Xt = matrixTranspose(X, n, 2);
      var Z = matrixMultiply(Xt, X, 2, n, 2);
      Z = matrixAdd(Z, matrixDiag(1 / alpha, 2), 2, 2);
      var cloneZ = Z.slice(0);
      if (matrixChol(Z, 2)) {
          matrixChol2inv(Z, 2);
      }
      else {
          matrixSolve(cloneZ, 2);
          Z = cloneZ;
      }
      var W = matrixMultiply(matrixMultiply(Z, Xt, 2, 2, n), Y, 2, n, 1);
      variogram.nugget = W[0];
      variogram.sill = W[1] * variogram.range + variogram.nugget;
      variogram.n = x.length;
      n = x.length;
      var K = Array(n * n);
      for (i = 0; i < n; i++) {
          for (j = 0; j < i; j++) {
              K[i * n + j] = variogram.model(Math.pow(Math.pow(x[i] - x[j], 2)
                  + Math.pow(y[i] - y[j], 2), 0.5), variogram.nugget, variogram.range, variogram.sill, variogram.A);
              K[j * n + i] = K[i * n + j];
          }
          K[i * n + i] = variogram.model(0, variogram.nugget, variogram.range, variogram.sill, variogram.A);
      }
      var C = matrixAdd(K, matrixDiag(sigma2, n), n, n);
      var cloneC = C.slice(0);
      if (matrixChol(C, n)) {
          matrixChol2inv(C, n);
      }
      else {
          matrixSolve(cloneC, n);
          C = cloneC;
      }
      var K1 = C.slice(0);
      var M = matrixMultiply(C, t, n, n, 1);
      variogram.K = K1;
      variogram.M = M;
      return variogram;
  }
  function predict(x, y, variogram) {
      var i;
      var k = Array(variogram.n);
      for (i = 0; i < variogram.n; i++) {
          k[i] = variogram.model(Math.pow(Math.pow(x - variogram.x[i], 2)
              + Math.pow(y - variogram.y[i], 2), 0.5), variogram.nugget, variogram.range, variogram.sill, variogram.A);
      }
      return matrixMultiply(k, variogram.M, 1, variogram.n, 1)[0];
  }
  function variance(x, y, variogram) {
      var i;
      var k = Array(variogram.n);
      for (i = 0; i < variogram.n; i++) {
          k[i] = variogram.model(Math.pow(Math.pow(x - variogram.x[i], 2) + Math.pow(y - variogram.y[i], 2), 0.5), variogram.nugget, variogram.range, variogram.sill, variogram.A);
      }
      var val = matrixMultiply(matrixMultiply(k, variogram.K, 1, variogram.n, variogram.n), k, 1, variogram.n, 1)[0];
      return variogram.model(0, variogram.nugget, variogram.range, variogram.sill, variogram.A) + val;
  }
  function grid(polygons, variogram, width) {
      var i;
      var j;
      var k;
      var n = polygons.length;
      if (n === 0)
          return;
      var xlim = [polygons[0][0][0], polygons[0][0][0]];
      var ylim = [polygons[0][0][1], polygons[0][0][1]];
      for (i = 0; i < n; i++) {
          for (j = 0; j < polygons[i].length; j++) {
              if (polygons[i][j][0] < xlim[0])
                  xlim[0] = polygons[i][j][0];
              if (polygons[i][j][0] > xlim[1])
                  xlim[1] = polygons[i][j][0];
              if (polygons[i][j][1] < ylim[0])
                  ylim[0] = polygons[i][j][1];
              if (polygons[i][j][1] > ylim[1])
                  ylim[1] = polygons[i][j][1];
          }
      }
      var xtarget;
      var ytarget;
      var a = Array(2);
      var b = Array(2);
      var lxlim = Array(2);
      var lylim = Array(2);
      var x = Math.ceil((xlim[1] - xlim[0]) / width);
      var y = Math.ceil((ylim[1] - ylim[0]) / width);
      var A = Array(x + 1);
      for (i = 0; i <= x; i++)
          A[i] = Array(y + 1);
      for (i = 0; i < n; i++) {
          lxlim[0] = polygons[i][0][0];
          lxlim[1] = lxlim[0];
          lylim[0] = polygons[i][0][1];
          lylim[1] = lylim[0];
          for (j = 1; j < polygons[i].length; j++) {
              if (polygons[i][j][0] < lxlim[0])
                  lxlim[0] = polygons[i][j][0];
              if (polygons[i][j][0] > lxlim[1])
                  lxlim[1] = polygons[i][j][0];
              if (polygons[i][j][1] < lylim[0])
                  lylim[0] = polygons[i][j][1];
              if (polygons[i][j][1] > lylim[1])
                  lylim[1] = polygons[i][j][1];
          }
          a[0] = Math.floor(((lxlim[0] - ((lxlim[0] - xlim[0]) % width)) - xlim[0]) / width);
          a[1] = Math.ceil(((lxlim[1] - ((lxlim[1] - xlim[1]) % width)) - xlim[0]) / width);
          b[0] = Math.floor(((lylim[0] - ((lylim[0] - ylim[0]) % width)) - ylim[0]) / width);
          b[1] = Math.ceil(((lylim[1] - ((lylim[1] - ylim[1]) % width)) - ylim[0]) / width);
          for (j = a[0]; j <= a[1]; j++) {
              for (k = b[0]; k <= b[1]; k++) {
                  xtarget = xlim[0] + j * width;
                  ytarget = ylim[0] + k * width;
                  if (pip(polygons[i], xtarget, ytarget)) {
                      A[j][k] = predict(xtarget, ytarget, variogram);
                  }
              }
          }
      }
      return {
          xlim: xlim,
          ylim: ylim,
          width: width,
          data: A,
          zlim: [min(variogram.t), max(variogram.t)],
      };
  }
  function plot(canvas, grid, xlim, ylim, colors) {
      var ctx = canvas.getContext('2d');
      var data = grid.data, zlim = grid.zlim, width = grid.width;
      if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          var range = [xlim[1] - xlim[0], ylim[1] - ylim[0], zlim[1] - zlim[0]];
          var i = void 0;
          var j = void 0;
          var x = void 0;
          var y = void 0;
          var z = void 0;
          var n = data.length;
          var m = data[0].length;
          var wx = Math.ceil(width * canvas.width / (xlim[1] - xlim[0]));
          var wy = Math.ceil(width * canvas.height / (ylim[1] - ylim[0]));
          for (i = 0; i < n; i++) {
              for (j = 0; j < m; j++) {
                  if (data[i][j] === undefined)
                      continue;
                  x = canvas.width * (i * width + grid.xlim[0] - xlim[0]) / range[0];
                  y = canvas.height * (1 - (j * width + grid.ylim[0] - ylim[0]) / range[1]);
                  z = (data[i][j] - zlim[0]) / range[2];
                  if (z < 0.0)
                      z = 0.0;
                  if (z > 1.0)
                      z = 1.0;
                  ctx.fillStyle = colors[Math.floor((colors.length - 1) * z)];
                  ctx.fillRect(Math.round(x - wx / 2), Math.round(y - wy / 2), wx, wy);
              }
          }
      }
  }
  var index = {
      train: train,
      predict: predict,
      variance: variance,
      grid: grid,
      plot: plot,
      max: max,
      min: min,
      pip: pip,
      rep: rep,
      matrixDiag: matrixDiag,
      matrixTranspose: matrixTranspose,
      matrixAdd: matrixAdd,
      matrixMultiply: matrixMultiply,
      matrixChol: matrixChol,
      matrixChol2inv: matrixChol2inv,
      matrixSolve: matrixSolve,
      variogramGaussian: variogramGaussian,
      variogramExponential: variogramExponential,
      variogramSpherical: variogramSpherical,
  };

  exports.default = index;
  exports.grid = grid;
  exports.matrixAdd = matrixAdd;
  exports.matrixChol = matrixChol;
  exports.matrixChol2inv = matrixChol2inv;
  exports.matrixDiag = matrixDiag;
  exports.matrixMultiply = matrixMultiply;
  exports.matrixSolve = matrixSolve;
  exports.matrixTranspose = matrixTranspose;
  exports.max = max;
  exports.min = min;
  exports.pip = pip;
  exports.plot = plot;
  exports.predict = predict;
  exports.rep = rep;
  exports.train = train;
  exports.variance = variance;
  exports.variogramExponential = variogramExponential;
  exports.variogramGaussian = variogramGaussian;
  exports.variogramSpherical = variogramSpherical;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=kriging.js.map
