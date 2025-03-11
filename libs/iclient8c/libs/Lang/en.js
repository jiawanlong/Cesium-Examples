/**
 * @requires SuperMap/Lang.js
 */

/**
 * Namespace: SuperMap.Lang["en"]
 * Dictionary for English.  Keys for entries are used in calls to
 *     <SuperMap.Lang.translate>.  Entry bodies are normal strings or
 *     strings formatted for use with <SuperMap.String.format> calls.
 */
SuperMap.Lang.en = {

	'unhandledRequest': "Unhandled request return ${statusText}",

	'Permalink': "Permalink",

	'Overlays': "Overlays",

	'Base Layer': "Base Layer",

	'LayerSwitcher': "LayerSwitcher",

	'noFID': "Can't update a feature for which there is no FID.",

	'browserNotSupported':
		"Your browser does not support vector rendering. Currently supported renderers are:\n${renderers}",

	// console message
	'minZoomLevelError':
		"The minZoomLevel property is only intended for use " +
		"with the FixedZoomLevels-descendent layers. That this " +
		"wfs layer checks for minZoomLevel is a relic of the" +
		"past. We cannot, however, remove it without possibly " +
		" breaking OL based applications that may depend on it." +
		"Therefore we are deprecating it -- the minZoomLevel." +
		"Please instead use min/max resolution setting.",

	'commitSuccess': "WFS Transaction: SUCCESS ${response}",

	'commitFailed': "WFS Transaction: FAILED ${response}",

	'googleWarning':
		"The Google Layer was unable to load correctly.<br><br>" +
		"To get rid of this message, select a new BaseLayer " +
		"in the layer switcher in the upper-right corner.<br><br>" +
		"Most likely, this is because the Google Maps library " +
		"script was either not included, or does not contain the " +
		"correct API key for your site.<br><br>",

	'getLayerWarning':
		"The ${layerType} Layer was unable to load correctly.<br><br>" +
		"To get rid of this message, select a new BaseLayer " +
		"in the layer switcher in the upper-right corner.<br><br>" +
		"Most likely, this is because the ${layerLib} library " +
		"script was not correctly included.<br><br>",

	'Scale = 1 : ${scaleDenom}': "Scale = 1 : ${scaleDenom}",

	//labels for the graticule control
	'W': 'W',
	'E': 'E',
	'N': 'N',
	'S': 'S',
	'Graticule': 'Graticule',

	// console message
	'reprojectDeprecated':
		"You are using the 'reproject' option " +
		"on the ${layerName} layer. This option is deprecated: " +
		"its use was designed to support displaying data over commercial " +
		"basemaps, but that functionality should now be achieved by using " +
		"Spherical Mercator support.",

	// console message
	'methodDeprecated':
		"This method has been deprecated and will be removed. " +
		"Please use ${newMethod} instead.",

	'proxyNeeded': "You probably need to set SuperMap.ProxyHost to access ${url}.",

	// **** end ****
	'end': '',
	'mi': "mi",
	'km': "km",
	'm': "m",
	'ft': "ft",

	//SuperMap Cloud Attribution
    'supermap_cloud_map': '&copy;2016 AMap GS(2015)2681',

    //Tencent Map Attribution
    'tencent_map':'&copy;2017 Tencent - GS(2016)930 - Data&copy; NavInfo',

	//VectorMapEditor
	'editorName':"VectorMapEditor",
	'layerList':"LayerList",
	'point':"PointLayer",
	'line':"LineLayer",
	'region':"PolygonLayer",
	'text':"TextLayer",
	'advanceSetting':"advanceSetting",
	'expandingPointContent':"Expanding",
	'volleyPointContent':"Volley",
	'rendezvousPointContent':"Rendezvous",
	'supplyPointContent':"Supply",
	//symbolAlgo
	'symbolAlgo_17703':"Add",
	'symbolAlgo_17704':"Emergency",
	'symbolAlgo_21600':"Punching",
	'symbolAlgo_28000_1':"Danger",
	'symbolAlgo_28000_2':"Middle",
	'symbolAlgo_28000_3':"light",
	'symbolAlgo_31304':"Electric resistance",
	'symbolAlgo_3010301':"Adjustment",
	'symbolAlgo_3010303':"StartOff",
	'symbolAlgo_3010304':"Coordinate",

	'symbolAlgo_2121505':"Fire",
	'symbolAlgo_2121506':"mound",
	'symbolAlgo_2121507':"compound",
	'symbolAlgo_2121601':"far",
	'symbolAlgo_2121602':"barrier",
	'symbolAlgo_30010':"?",
	'symbolAlgo_3001101':"collection",
	'symbolAlgo_3001102':"expose",
	'symbolAlgo_3001103':"disturb",
	'symbolAlgo_3001104':"private",
	'symbolAlgo_3001105':"robber",
	'symbolAlgo_30020':"Water",
	'symbolAlgo_3002001':"earthquake",
	'symbolAlgo_3002004':"Fire",
	'symbolAlgo_30025':"stay",
	'symbolAlgo_5010301':"Adjustment",
	'symbolAlgo_5010303':"StartOff",
	'symbolAlgo_5010304':"Coordinate",
	'symbolAlgo_5010401':"JZ",
	'symbolAlgo_5022001':"ZD0",
	'symbolAlgo_5034801':"hurry",
	"symbolAlgo_60203":"avoid",
	'symbolAlgo_60301':"expose",
	'symbolAlgo_6030101':"dug",
	'symbolAlgo_6030102':"water",
	'symbolAlgo_6030103':"step",
	'symbolAlgo_6030104':"outfit",
	'symbolAlgo_6030105':"stone",
	'symbolAlgo_6030106':"sand",
	'symbolAlgo_6030107':"practice",
	'symbolAlgo_60304':"tunnel",

	'symbolAlgo_3002501':"tread",
	'symbolAlgo_30026':"disaster",
	'symbolAlgo_40104':"arrest",
	'symbolAlgo_4030301':"symptom",
	'symbolAlgo_4030302':"advise",
	'symbolAlgo_4030303':"dredge",
	'symbolAlgo_40304':"police",
	'symbolAlgo_4030401':"police",

	//basic symbol
	'polyLine':"polyLine",
	'parallelogram':"parallelogram",
	'circle':"circle",
	'ellipse':"ellipse",
	'annotation':"annotation",
	'regularPolygon':"regular polygon",
	'polygon':"polygon",
	'bezier':"bezier",
	'closedBesselCurve':"closed bessel curve",
	'kidney':"kidney",
	'brace':"brace",
	'trapezoid':"trapezoid",
    'rectangle':"rectangle",
    'chord':"chord",
    'sector':"sector",
    'arc':"arc",
    'parallel':"parallel",
	'annoFrame':"annoframe",
	'tooltipBoxM':"tooltip BoxM",
	'runway':"runway",
	'curveEight':"curveEight",
	'arrowLine':"ArrowLine",
	'pathText':"pathText",
	'concentricCircle':"ConcentricCircle",
	'combinedCircle':"combinedCircle",
	'freeCurve':"freeCurve",
	'nodeChain':"nodeChain",
	'lineMarking':"line marking",
	'symbolTextBox':"symbolText box",
	'picture':"picture",
	'editableContentBox':"editableContentBox",
	'wire': "wire",
    'symbolAlgo_311':'attack direction',
	'symbolAlgo_317':'pincer attack',

	//generation Symbol
	'parallelFlatArrow':"parallel flat arrow",
	'multipleArrow':"multiple Arrow",
	'trapezoidalFlatArrow':"trapezoidal flat arrow",
	'besselPointArrow':"bessel point arrow",
	'besselArrow':"bassel arrow",
	'doubleArrow':"double arrow",
	'brokenSpaceTriangleArrow':"broken_space_triangle_arrow",
	'besselDovetailArrow':"bessel dovetail arrow",
	'ordinaryLineArrow':"ordinary line arrow",
	'besselPointedEarsTailArrow':"bessel pointed ears tail arrow",
	'besselTipArrow':"bessel_tip_arrow",
	'besselArrowNoGraph':"bessel arrow no graph",
	'brokenSpaceTriangleArrowNoGraph':"broken space triangle arrow no graph",
	'besselPointedEarsTailArrowNoGraph':"bessel pointed ears tail arrow no graph",
	'ordinaryLineArrowNoGraph':"ordinary line arrow no graph",
	'combianationArrow':"combianation arrow",


	'airDeployment':"airDeployment",
	'airRoute':"airRoute",
	'arcRegion':"arcRegion",
	'flagGroup':"flagGroup",
	'lineRelation':"lineRelation",
	'polygonRegion':"polygonRegion",
	'navyRoute':"navyRoute",
	'missileRoute':"missileRoute",
	'navyDeployment':"navyDeployment",
	'satelliteTimeWindows':"satelliteTimeWindows",
	'satellite':"satellite",
	'symbolText':"symbolText",
	'symbolText1':"symbolText1",
	'interferenceBeam':"interferenceBeam",
	'groupObject':"groupObject",

	//routeNodeTypeName
	'RENDEZVOUS': "RENDEZVOUS",
	'EXPANDING': "EXPANDING",
	'VOLLEY': "VOLLEY",
	'STANDBY': "STANDBY",
	'SUPPLY': "SUPPLY",
	'TAKEOFF': "TAKEOFF",
	'INITIAL': "INITIAL",
	'VISUALINITAL': "VISUALINITAL",
	'LANCH': "LANCH",
	'TURNING': "TURNING",
	'AIMING': "AIMING",
	'COMMONROUTE': "COMMONROUTE",
	'WEAPONLAUNCH': "WEAPONLAUNCH",
	'TARGET': "TARGET",
	'ATTACK':"ATTACK",
	'SUPPRESS':"SUPPRESS",
	'EIGHTSPIRAL':"EIGHTSPIRAL",
	'HAPPYVALLEY':"HAPPYVALLEY",
	'LITERATESIGN':"LITERATESIGN",
    'textContent':"Please input text",

	'undoStackOverflow': 'undo stack overflow',

	//Mapviewer
	'noContent':'None',
	'lableTitle': '_Lable Layer'


};

