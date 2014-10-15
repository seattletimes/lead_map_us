/*global census, ich, Landline*/
require([
  "pym",
  "text!_tooltip.html",
  "jquery",
  "icanhaz",
  "landline",
  "landline.stateline",
  "states/states_packaged",
  "lib/underscore/underscore-min",
  "lib/raphael/raphael-min"
], function(pym, tooltip, $) {

  var child = pym.Child({
    polling: 500
  });

  var hover = $(".hover");

  child.id = "lead-map-us";

  ich.addTemplate("tooltip", tooltip);
  
  var map = new Landline.Stateline("#landline_container", "states");
  var lastPath = null;
  var isIE = navigator.userAgent.indexOf("Trident") > -1;

  map.on('mouseover', function(e, path, data) {
    path.attr("stroke", "#1a1a1a").attr("stroke-width", 3);
    if (isIE && lastPath && path != lastPath) {
      lastPath.attr("stroke", "white").attr("stroke-width", 1);
    }
    lastPath = path;
    path.toFront();
  });

  map.on('mousemove', function(e, path, data) {
    hover.html(ich.tooltip(census[data.fips]));
  });

  map.on('mouseout', function(e, path, data) {
    $("#landline_tooltip").hide();
    path.attr("stroke", "white").attr("stroke-width", 1);
    hover.html(ich.tooltip(census.US));
  });

  //This is a hack around IE events on SVG DOM
  //it's a bad idea and we should feel bad for doing it.
  if (isIE) {
    $("svg").on("mouseleave", function() {
      $("svg path").each(function(i, path) {
        path.setAttribute("stroke", "white");
        path.setAttribute("stroke-width", 1);
      });
      hover.html(ich.tooltip(census.US));
    });
  }

  var stateColor = function(income) {
    if (income > 20) return "#3c5056";
    if (income > 16) return "#3c5056";
    if (income > 10) return "#7c8389";
    if (income > 5) return "#c1bfc1";
    if (income > 0) return "#e0e0e1";
    return "#d38b82";
  };

  var commafy = function(n) {
    //would prefer to use the options in toLocaleString, but isn't in IE<11
    return (n * 1).toLocaleString().replace(/\.0+$/, "");
  };

  for (var fips in census) {
    var state = census[fips];
    state.violations = commafy((state.violations));
    state.leadRelated = commafy((state.leadRelated));
    state.penalty = commafy(Math.round(state.penalty));
    state.currentPenalty = commafy(Math.round(state.currentPenalty));
    map.style(fips, "fill", stateColor(state.inspected));
    map.style(fips, "stroke-width", 1);
  }

  map.createMap();

  hover.html(ich.tooltip(census.US));
  
});
