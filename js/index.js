(() => {
  // Onload Stuff;
  let liveReportArr = [];
  let searchValidationArr = [];
  let liveReportDataPush = "";
  showCoinsAsync();

  //Api
  function getData(url) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: url,
        success: (data) => resolve(data),
        error: (err) => reject(err),
      });
    });
  }

  // Display coins on page
  async function showCoinsAsync() {
    try {
      const coinData = await getData(
        "https://api.coingecko.com/api/v3/coins/list"
      );
      for (let i = 0; i < 200; i++) {
        const randCoin = Math.floor(Math.random() * coinData.length);
        let coinToAppend = printCoin(coinData[randCoin], i);
        $("#coinData").append(coinToAppend);
        $(`.switch .${[i]}`).click(function () {
          // Add an event to the toggle button.
          validateForLiveReport(this);
        });
      }
      $("#loading").hide();
    } catch (err) {
      alert(err);
      $("#loading").hide();
    }
  }

  //Save to storage.
  async function getMoreInfoAndSaveAsync(id) {
    try {
      if (sessionStorage.getItem(id) === null) {
        const coinMoreInfo = await getData(
          `https://api.coingecko.com/api/v3/coins/${id}`
        );
        const jason = JSON.stringify(coinMoreInfo);
        sessionStorage.setItem(id, jason);
        setTimeout(() => {
          sessionStorage.removeItem(id);
        }, 120000);
      }
    } catch (err) {
      alert(err);
    }
  }

  //Dynamic Html Functions ----------------->

  function printCoin(coinData, num) {
    let coinToAppend = `
    <div class="card border-dark col-lg-4 shadow" style="max-width: 18rem;">
    <div class="card-body text-dark">
    <label class="switch">
    <input name="${coinData.symbol}" type="checkbox" class="switch ${num}">
    <span class="slider round"></span>
    </label>
    <div class="row"><h5 class="card-title">${coinData.symbol.toUpperCase()}</h5></div>
    <div class="row "><h6 class="card-title">${coinData.name}</h6></div>
    <div class="row">
    <button id="${
      coinData.id
    }" class="btn btn-light btn-outline-dark" type="button"  data-toggle="collapse" data-target="#moreInfo${
      coinData.id
    }" aria-expanded="true" aria-controls="moreInfo${
      coinData.id
    }">More Info</button>
    <div class="collapse mt-3" id="moreInfo${coinData.id}">
    <div class="card card-body shadow-sm  moreInfo${coinData.id}">
    <div class="progressBar${coinData.id}"></div>
    </div>
    </div>
    </div>
    </div>
    </div> 
    `;
    return coinToAppend;
  }

  async function coinMoreInfo(id) {
    await getMoreInfoAndSaveAsync(id);
    const jason = sessionStorage.getItem(id);
    const coinData = JSON.parse(jason);
    $(`.moreInfo${id}`).empty();
    $(`.moreInfo${id}`).append(`
      <img class="coinImg" src="${coinData.image.thumb}" alt="${coinData.id}">
      Current Market Prices:
     <table>
     <tr><td>Usd:</td><td>${coinData.market_data.current_price.usd}$</td></tr>
     <tr><td>Eur:</td><td>${coinData.market_data.current_price.eur}€</td></tr> 
     <tr><td>ILS:</td><td>${coinData.market_data.current_price.ils}₪</td></tr>
      </table>
      `);
  }

  function showPersonalDetailsAboutSection() {
    $("#coinData").append(
      `
          <div class="container aboutSec">
          <h4 class="m-auto col-xl-4 text-center">Bit Stream 2021</h4>
          <h6 class="m-auto col-xl-5 text-center">The Latest Quotes of <bold>ALL</bold> Cryptocurrencies</h6>
          <h6 class="m-auto col-xl-3 text-center">Made By Yonatan Levin</h6>
          <div class="m-auto col-xl-5 "><img src="/Assets/img/circle-cropped.png" class="m-auto yonatanImg"></div>
          </div>
          `
    );
    $("#loading").hide();
  }

  function appendCoinToModal() {
    $(".modal-body").empty();
    liveReportArr.forEach((coin) => {
      const str = coin;
      const capCoin = str.charAt(0).toUpperCase() + str.slice(1);
      $(".modal-body").append(
        `<div class="d-flex"><div>${capCoin}:</div><input name="${coin}" type="checkbox" class="ml-auto mt-1 btn-check ${coin}"></div>`
      );

      $(`.${coin}`).click(function () {
        addCoinToArr(this);
      });
    });
    liveReportArr.splice(0);
  }

  //  <------------------------------------------------->
  //  Buttons Events

  $(".home").click(() => {
    $("#loading").show();
    clearInterval(liveReportDataPush);
    $("#searchData").children().remove();
    $("#coinData").children().remove();
    showCoinsAsync();
    liveReportArr = [];
    searchValidationArr = [];
  });

  $(".about").click(() => {
    $("#loading").show();
    clearInterval(liveReportDataPush);
    $("#searchData").children().remove();
    $("#coinData").children().remove();
    showPersonalDetailsAboutSection();
    liveReportArr = [];
    searchValidationArr = [];
  });

  $(".liveReport").click(function () {
    if (liveReportArr.length >= 1) {
      $("#loading").show();
      $("#coinData").children().remove();
      $("#searchData").children().remove();
      liveReportAsync();
      searchValidationArr = [];
      return;
    }
    alert("Select at least one coin in order to display Live Report");
  });

  //   More Info Btn.
  $("#coinData, #searchData").on("click", "button", function () {
    $(`.progressBar${this.id}`).circleProgress({
      startAngle: -Math.PI,
      animationStartValue: 0.0,
      value: 1,
      fill: { color: "black" },
      lineCap: "round",
    });
    coinMoreInfo(this.id);
  });
  //  <------------------------------------------------->
  // Live Report functions.

  function validateForLiveReport(coin) {
    addCoinToArr(coin);
    
    if (liveReportArr.length > 5) {
      $("#liveReportCoinSelect").modal();
      appendCoinToModal();
      return;
    }
  }

  function addCoinToArr(coin) {
    if (coin.checked) {
      liveReportArr.push(coin.name);
 
    } else {
      const remove = liveReportArr.indexOf(coin.name);
      liveReportArr.splice(remove, 1);
   
    }
  }

  $("#saveCoinModal").click(function () {
    if (liveReportArr.length > 0) {
      $("#liveReportCoinSelect").modal(`toggle`);
      $(".switch").each(function () {
        $(this).prop("checked", false);
      });
      liveReportArr.forEach((item) => {
        $(`input[name=${item}]`).prop("checked", true);
      });
      return;
    }
  });

  function liveReportAsync() {
    let options = {
      exportEnabled: true,
      animationEnabled: true,
      title: {
        text: ``,
      },
      subtitles: [{}],
      axisX: {
        title: "Current Time",
      },
      axisY: {
        title: "Coin Value",
        titleFontColor: "#4F81BC",
        lineColor: "#4F81BC",
        labelFontColor: "#4F81BC",
        tickColor: "#4F81BC",
      },
      toolTip: {
        shared: true,
      },
      legend: {
        cursor: "pointer",
        itemclick: toggleDataSeries,
      },
      data: [
        {
          type: "spline",
          name: "",
          showInLegend: true,
          xValueFormatString: "MM",
          yValueFormatString: "$#,##0",
          dataPoints: [],
        },
        {
          type: "spline",
          name: "",
          showInLegend: true,
          xValueFormatString: "MM",
          yValueFormatString: "$#,##0.#",
          dataPoints: [],
        },
        {
          type: "spline",
          name: "",
          showInLegend: true,
          xValueFormatString: "MM",
          yValueFormatString: "$#,##0.#",
          dataPoints: [],
        },
        {
          type: "spline",
          name: "",
          showInLegend: true,
          xValueFormatString: "MM",
          yValueFormatString: "$#,##0.#",
          dataPoints: [],
        },
        {
          type: "spline",
          name: "",
          showInLegend: true,
          xValueFormatString: "MM",
          yValueFormatString: "$#,##0.#",
          dataPoints: [],
        },
      ],
    };
    $("#coinData").CanvasJSChart(options);
    $("#loading").hide();
    function toggleDataSeries(e) {
      if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
      } else {
        e.dataSeries.visible = true;
      }
      e.chart.render();
    }
    liveReportDataPush = setInterval(async function () {
      try {
        const url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${liveReportArr[0]},${liveReportArr[1]},${liveReportArr[2]},${liveReportArr[3]},${liveReportArr[4]}&tsyms=USD`;
        const data = await getData(url);
        let date = new Date();
        if (liveReportArr.length !== Object.keys(data).length) {
          options.axisX.title = "Unable To Retrieve All Requested Quotes.";
        }
        options.title.text = Object.keys(data) + "To USD";
        let i = 0;
        while (i < Object.keys(data).length) {
          for (let coin in data) {
            options.data[i].name = coin;
            options.data[i].dataPoints.push({ x: date, y: data[coin].USD });
            i++;
          }
        }
        $("#coinData").CanvasJSChart().render();
      } catch (err) {
        console.log(err);
        alert("Unable To Retrieve Quotes On Requested Quarry");
        $("#loading").show();
        clearInterval(liveReportDataPush);
        $("#searchData").children().remove();
        $("#coinData").children().remove();
        showCoinsAsync();
        liveReportArr = [];
        searchValidationArr = [];
      }
    }, 2000);
  }

  // Search Script--------------------------------->

  $("#navbarHead").on("click", ".icon", () => {
    let searchVal = document
      .getElementsByTagName("input")[0]
      .value.toLocaleLowerCase();
    clearInterval(liveReportDataPush);
    document.getElementsByTagName("input")[0].value = "";
    coinSearchedAsync(searchVal);
  });

  $("#navbarHead").on("keyup", ".search-input", (event) => {
    if (event.keyCode === 13 || undefined) {
      clearInterval(liveReportDataPush);
      let searchVal = document
        .getElementsByTagName("input")[0]
        .value.toLocaleLowerCase();
      document.getElementsByTagName("input")[0].value = "";
      coinSearchedAsync(searchVal);
    }
  });

  // Suggestions search bar----------------------->
  $("#navbarHead").on("keyup click", ".search-input", async () => {
    const event = $(".search").val();
    if (event === "") {
      return $(".acpWrap").children().remove();
    }
    $(".acpWrap").children().remove();
    try {
      const coinData = await getData(
        `https://api.coingecko.com/api/v3/coins/list`
      );
      let arr = coinData.filter((data) => {
        return data.id
          .toLocaleLowerCase()
          .startsWith(event.toLocaleLowerCase());
      });
      for (let i = 0; i < 5; i++) {
        let symbol = arr[i].symbol;
        let item = `<div class="${symbol}1 searchHover" role="button">${arr[i].id}</div>`;
        $(".acpWrap").append(item);

        $(`.${symbol}1`).click(() => {
          console.log(searchValidationArr);
          clearInterval(liveReportDataPush);
          document.getElementsByTagName("input")[0].value = "";
          coinSearchedAsync(symbol);
          $(".acpWrap").children().remove();
        });
      }
    } catch (err) {
        console.log(err)
    }
  });

  async function coinSearchedAsync(searchVal) {
    if (searchValidationArr.includes(searchVal)) {
      return alert("Value already exists");
    }
    try {
      const coinData = await getData(
        `https://api.coingecko.com/api/v3/coins/list`
      );
      const coinSearched = coinData.find((item) => item.symbol === searchVal);
      if (coinSearched === undefined) {
        return alert("Search by coin symbol only.");
      }
      $("#coinData").children().remove();
      $("#searchData").append(printCoin(coinSearched, coinSearched.id));
      $(`.switch .${coinSearched.id}`).click(function () {
        // Add an event to the toggle button.
        validateForLiveReport(this);
      });
      searchValidationArr.push(searchVal);
      liveReportArr = [];
    } catch (err) {
      console.log(err);
      alert("Search by coin symbol only.");
    }
  }
})();
