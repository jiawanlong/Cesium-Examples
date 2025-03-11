function toStyleVariable(variable) {
  return '--' + variable.replace(/[A-Z]/g, '-$&').toLowerCase();
}

var isBrowser = typeof window !== 'undefined';
var isNativeSupport = isBrowser && window.CSS && window.CSS.supports && window.CSS.supports('(--a: 0)');

function setRootStyle (theme) {
  var targetTheme = null;
  window.themeConfig.forEach(function (item) {
    if (item.label === theme) {
      targetTheme = item;
    };
  })
  var acceptedThemeStyle = targetTheme || window.themeConfig[1];
  var variables = {};
  var themeKeys = Object.keys(acceptedThemeStyle);
  themeKeys.forEach(function(key) {
    var varKey = toStyleVariable(key);
    variables[varKey] = acceptedThemeStyle[key];
  })
  var rootStyleSelector = ':root';
  var antdStyleId = 'sm-theme-style';
  var rootStyle = rootStyleSelector + ' ' + JSON.stringify(variables, null, 2)
    .replace(/(:.+),/g, '$1;')
    .replace(/"/g, '');
  var rootStyleTag = document.getElementById(antdStyleId);
  if (!rootStyleTag) {
    rootStyleTag = document.createElement('style');
    rootStyleTag.setAttribute('id', antdStyleId);
    rootStyleTag.setAttribute('type', 'text/css');
    document.head.insertBefore(rootStyleTag, document.head.firstChild);
  }
  var options = {
    include: 'style#sm-theme-style, link[href*=css]',
    silent: true,
    onlyLegacy: true,
    variables: {},
    watch: false
  };
  if (!isNativeSupport) {
    options.onlyLegacy = false;
    options.watch = true;
    options.variables = variables;
  }
  cssVars(options);
  rootStyleTag.innerHTML = rootStyle;
}


initSkin();
function initSkin() {
  var skin = utils.getCookie('theme') || 'dark';
  var rootElem = document.querySelector('html');
  rootElem.classList.remove("light", "dark");
  rootElem.classList.add(skin);
  setRootStyle(skin);
}