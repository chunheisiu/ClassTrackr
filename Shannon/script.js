const urlPre = "https://iris2.usfca.edu/prod/bwckschd.p_disp_detail_sched?";
const urlTerm = "term_in=";
const urlClass = "crn_in=";

const urlClasses = "classes.txt";

var classes;

function init() {
  loadClassesWithTxt();
}

function loadClassesWithTxt() {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      classes = this.responseText.split('\n');
      for (var c of classes) {
        cCode = c.split(',')[0];
        cName = c.split(',')[1];
        createTile(cCode);
        requestClass("201840", cCode, cName);
      }
    }
  };
  xmlhttp.open("GET", urlClasses, true);
  xmlhttp.send();
}

function requestClass(term, c, cName) {
  var xmlhttp = new XMLHttpRequest();
  //var url = "https://cors.io/?";
  var url = "https://cors-anywhere.herokuapp.com/";
  url += urlPre + urlTerm + term + "&" + urlClass + c;
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var response = this.responseText;
      try {
        var classArr = parseClass(response);
        updateTile(c, classArr, cName);
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
  var link = ("https://iris2.usfca.edu" + response.match(/<a href="(.+)">View Catalog Entry<\/a>/)[1]).replace(/&amp;/g, "&");
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
  var resultArr = [name, cap, act, rem, capWait, actWait, remWait, link];
  return resultArr;
}

function createTile(c) {
  var anchor = document.createElement("a");
  anchor.setAttribute("id", ("crn_" + c));
  anchor.setAttribute("class", "box");
  anchor.setAttribute("href", "#");
  document.getElementById("container").appendChild(anchor);

  var html;
  html = "<div class='box-content'>";
  html += "<span class='classCode'>" + c + "</span><br><br>";
  html += "<span class='classSeat'>––/–– Seats Remaining</span><br>";
  html += "</div>";

  anchor.innerHTML = html;
}

function updateTile(c, classArr, cName) {
  var div = document.getElementById(("crn_" + c));
  div.setAttribute("href", classArr[7]);
  div.setAttribute("target", "_blank");
  var percent = +classArr[3] / +classArr[1];
  var status = "";

  if (percent == 0) {
    status = " full";
  } else if (percent <= 0.25) {
    status = " bad";
  } else if (percent <= 0.5) {
    status = " mid";
  } else if (percent <= 1) {
    status = " good";
  }

  div.setAttribute("class", "box" + status);

  var nameStr = classArr[0].match(/(.+) - (\d{5}) - (.+)/);

  var html;
  html = "<div class='box-content'>";
  html += "<span class='classCode'>" + nameStr[2] + "</span><br><br>";
  html += "<span class='classTitle'>" + nameStr[3] + "</span><br>";
  //html += "<span class='classTitle'>" + nameStr[1] + "</span><br><br>";
  html += "<span class='classTitle'>" + cName + "</span><br><br>";
  html += "<span class='classSeat'>" + classArr[3] + "/" + classArr[1] + " Seats Remaining</span><br>";
  html += "</div>";
  div.innerHTML = html;

  div.setAttribute("style", "filter: brightness(1.5);");
  setTimeout(function() {
    div.removeAttribute("style");
  }, 500)
}

function on() {
    document.getElementById("overlay").style.display = "block";
}

function off() {
    document.getElementById("overlay").style.display = "none";
}

init();