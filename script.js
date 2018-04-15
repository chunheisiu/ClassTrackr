const urlPre = "https://iris2.usfca.edu/prod/bwckschd.p_disp_detail_sched?";
const urlTerm = "term_in=";
const urlClass = "crn_in=";

var classes;

function init() {
  loadClasses();
}

function loadClasses() {
  var term = getQueryVariable("term");
  var classList = getQueryVariable("classes");
  if (classList != null) {
    classes = classList.split(',');
    for (var c of classes) {
      createTile(c);
      requestClass(term, c);
    }
  }
}

function requestClass(term, c) {
  var xmlhttp = new XMLHttpRequest();
  var url = "https://cors.io/?";
  url += urlPre + urlTerm + term + "&" + urlClass + c;
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var response = this.responseText;
      try {
        var classArr = parseClass(response);
        updateTile(c, classArr);
      } catch (e) {
        //requestClass(term, c);
      }
    }
  };
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

function parseClass(response) {
  var name = response.match(/<table  CLASS="datadisplaytable" SUMMARY="This table is used to present the detailed class information." width="100%"><caption class="captiontext">Detailed Class Information<\/caption>\n<tr>\n<th CLASS="ddlabel" scope="row" >(.+)<br \/><br \/><\/th>/)[1];
  var seatsStrArr = response.match(/<td CLASS="dddefault">(\d+)<\/td>/g);
  var seatsArr = [];
  for (i in seatsStrArr) {
    seatsArr[i] = seatsStrArr[i].match(/<td CLASS="dddefault">(\d+)<\/td>/)[1];
  }
  var cap = seatsArr[0];
  var act = seatsArr[1];
  var rem = seatsArr[2];
  var capWait = seatsArr[3];
  var actWait = seatsArr[4];
  var remWait = seatsArr[5];
  var resultArr = [name, cap, act, rem, capWait, actWait, remWait];
  return resultArr;
}

function createTile(c) {
  var div = document.createElement("div");
  div.setAttribute("class", "box");
  div.setAttribute("id", ("crn_" + c));
  var html;
  html = "<div class='box-content'>";
  html += "<span class='classTitle'>" + c + "</span><br><br>";
  html += "<span class='classSeat'>––/–– Seats Remaining</span><br>";
  html += "</div>";
  div.innerHTML = html;
  document.getElementById("container").appendChild(div);
}

function updateTile(c, classArr) {
  var div = document.getElementById(("crn_" + c));
  var percent = +classArr[3] / +classArr[1];
  var status = "";

  if (percent >= 0.75) {
    status = " good";
  } else if (percent >= 0.5) {
    status = " mid";
  } else if (percent >= 0.25) {
    status = " bad";
  }

  div.setAttribute("class", "box" + status);

  var html;
  html = "<div class='box-content'>";
  html += "<span class='classTitle'>" + classArr[0] + "</span><br><br>";
  html += "<span class='classSeat'>" + classArr[3] + "/" + classArr[1] + " Seats Remaining</span><br>";
  html += "</div>";
  div.innerHTML = html;

  div.setAttribute("style", "filter: brightness(1.5);");
  setTimeout(function() {
    div.removeAttribute("style");
  }, 500)
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return null;
}

function on() {
    document.getElementById("overlay").style.display = "block";
}

function off() {
    document.getElementById("overlay").style.display = "none";
}

init();
