app.get("/", (req, res) => {
  const appKey = process.env.appKey; // 환경변수에서 APP_KEY를 가져옴
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>입지분석</title>
    <style>
      .map_wrap,
      .map_wrap * {
        margin: 0;
        padding: 0;
        font-family: "Malgun Gothic", dotum, "돋움", sans-serif;
        font-size: 12px;
      }
      .map_wrap a,
      .map_wrap a:hover,
      .map_wrap a:active {
        color: #000;
        text-decoration: none;
      }
      .map_wrap {
        position: relative;
        width: 100%;
        height: 200px;
      }
      #menu_wrap {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 250px;
        margin: 10px 0 30px 10px;
        padding: 5px;
        overflow-y: auto;
        background: rgba(255, 255, 255, 0.7);
        z-index: 1;
        font-size: 12px;
        border-radius: 10px;
      }
      .bg_white {
        background: #fff;
      }
      #menu_wrap .option {
        text-align: center;
      }
      #menu_wrap .option p {
        margin: 10px 0;
      }
      #menu_wrap .option button {
        margin-left: 5px;
      }
    </style>
  </head>

  <body>
    <div class="map_wrap">
      <div
        id="map"
        style="width: 100%; height: 100vh; position: relative; overflow: hidden"
      ></div>

      <div id="menu_wrap" class="bg_white">
        <div class="option">
          <div>
            <form onsubmit="searchPlaces(); return false;">
              주거 반경(m) :
              <input type="text" value="2000" id="a1" size="15" /> <br />
              교육 반경(m) :
              <input type="text" value="300" id="a2" size="15" /> <br />
              <br />
              도로명 주소 : <input type="text" id="a3" size="20" /> <br />
              <br />
              지적편집도
              <input
                type="checkbox"
                id="chkUseDistrict"
                onchange="setOverlayMapTypeId()"
              />
              지형정보
              <input
                type="checkbox"
                id="chkTerrain"
                onchange="setOverlayMapTypeId()"
              />
              <br />
              <br />
              <button type="submit" class="btn btn-success" onclick="ajm();">
                검색
              </button>
            </form>
          </div>
        </div>
        <hr />
      </div>
    </div>

    <script
      type="text/javascript"
      src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&libraries=services"
    ></script>
    <script>
      var category1 = ["SC4", "SW8"]; // 학교, 지하철 카테고리
      var category2 = ["MT1", "CT1", "HP8", "PO3"]; // 상업, 문화, 병원, 공공 카테고리

      var mapContainer = document.getElementById("map"); // 지도를 표시할 div
      var mapOption = {
        center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
        level: 3, // 지도의 확대 레벨
      };

      // 지도를 생성합니다
      var map = new kakao.maps.Map(mapContainer, mapOption);

      var mapTypes = {
        terrain: kakao.maps.MapTypeId.TERRAIN,
        useDistrict: kakao.maps.MapTypeId.USE_DISTRICT,
      };

      function setOverlayMapTypeId() {
        var chkTerrain = document.getElementById("chkTerrain");
        var chkUseDistrict = document.getElementById("chkUseDistrict");

        for (var type in mapTypes) {
          if (mapTypes.hasOwnProperty(type)) {
            map.removeOverlayMapTypeId(mapTypes[type]);
          }
        }

        if (chkUseDistrict.checked) {
          map.addOverlayMapTypeId(mapTypes.useDistrict);
        }

        if (chkTerrain.checked) {
          map.addOverlayMapTypeId(mapTypes.terrain);
        }
      }

      var geocoder = new kakao.maps.services.Geocoder();

      var infowindow = new kakao.maps.InfoWindow({
        content: "",
      });
      var currentMarkers = []; // 이전 마커들을 저장할 배열
      var currentCircles = []; // 이전 원들을 저장할 배열

      function ajm() {
        // 이전에 생성된 마커와 원을 삭제합니다.
        for (var i = 0; i < currentMarkers.length; i++) {
          currentMarkers[i].setMap(null);
        }
        currentMarkers = [];

        for (var i = 0; i < currentCircles.length; i++) {
          currentCircles[i].setMap(null);
        }
        currentCircles = [];

        var r1 = document.getElementById("a1").value;
        var r2 = document.getElementById("a2").value;
        var juso = document.getElementById("a3").value;

        var marker0;

        geocoder.addressSearch(juso, function (result, status) {
          if (status === kakao.maps.services.Status.OK) {
            var coords = new kakao.maps.LatLng(result[0].y, result[0].x);

            marker0 = new kakao.maps.Marker({
              map: map,
              position: coords,
            });

            infowindow.setContent(
              '<div style="width:150px;text-align:center;padding:6px 0;">사업지</div>'
            );
            infowindow.open(map, marker0);

            map.setCenter(coords);

            var marker1 = new kakao.maps.Marker({
              position: coords,
              title: "마커1",
              map: map,
            });

            var circle1 = new kakao.maps.Circle({
              map: map,
              center: coords,
              radius: r1,
              strokeWeight: 2,
              strokeColor: "#888",
              strokeOpacity: 0.8,
              strokeStyle: "dashed",
              fillColor: "#888",
              fillOpacity: 0.2,
            });

            var circle2 = new kakao.maps.Circle({
              map: map,
              center: coords,
              radius: r2,
              strokeWeight: 2,
              strokeColor: "#888",
              strokeOpacity: 0.8,
              strokeStyle: "dashed",
              fillColor: "#888",
              fillOpacity: 0.2,
            });

            for (var i = 0; i < category1.length; i++) {
              searchPlaces(category1[i], r1, coords);
            }

            for (var j = 0; j < category2.length; j++) {
              searchPlaces(category2[j], r2, coords);
            }

            currentMarkers.push(marker0, marker1);
            currentCircles.push(circle1, circle2);
          }
        });
      }

      function searchPlaces(category, radius, coords) {
        var ps = new kakao.maps.services.Places(map);
        ps.categorySearch(
          category,
          function (data, status, pagination) {
            if (status === kakao.maps.services.Status.OK) {
              for (var i = 0; i < data.length; i++) {
                displayMarker(data[i]);
              }
            }
          },
          {
            radius: radius,
            location: coords,
          }
        );
      }

      function displayMarker(place) {
        var marker = new kakao.maps.Marker({
          map: map,
          position: new kakao.maps.LatLng(place.y, place.x),
        });

        kakao.maps.event.addListener(marker, "click", function () {
          infowindow.setContent(
            '<div style="padding:5px;font-size:12px;">' +
              place.place_name +
              "</div>"
          );
          infowindow.open(map, marker);
        });

        currentMarkers.push(marker);
      }
    </script>
  </body>
</html>
`;
  res.send(html); // 동적으로 생성된 HTML 파일을 응답으로 보냄
});
