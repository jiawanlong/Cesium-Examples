/* by jiawanlong*/

function createGalleryChart(example) {
  var target = 'editor-wechat.html',
    defaultThumb = '../img/thumb.png',
    title = utils.getLocalPairs(example, 'name'),
    href = example.fileName ? example.fileName : '',
    thumbnail = example.thumbnail ? thumbLocation + '/img/' + example.thumbnail : '',
    version = example.version;
  href = href.replace(/editor/, 'editor-wechat');
  var chartDiv = $("<div class='col-xlg-2 col-lg-3 col-md-4 col-sm-6 col-xs-6'></div>");
  var chart = $("<div class='chart'></div>");
  var link = $("<a class='chart-link' href='" + target + '#' + href + "'></a>");
  var chartTitle = $("<h5 class='chart-title'>" + title + '</h5>');
  var newTip = $(
    '<svg xmlns="http://www.w3.org/2000/svg" class="new-example" style="width:8px !important;height:8px;right: 1px;top: 1px;position: absolute;"><circle cx="4" cy="4" r="4" fill="#e14d57"></circle></svg>'
  );
  var thumb = $(
    "<img class='chart-thumb' src='" + defaultThumb + "' data-original='" + thumbnail + "' style='display: inline'>"
  );

  chartTitle.appendTo(link);
  if (window.version === version) {
    newTip.appendTo(link);
  }
  thumb.appendTo(link);
  link.appendTo(chart);
  chart.appendTo(chartDiv);

  return chartDiv;
}
