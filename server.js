const express = require("express");
const cheerio = require("cheerio");
const bent = require("bent");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();

function shouldProxy(path) {https://www.blockaway.net/
  return !(path.endsWith("index.html") || path.endsWith("/") || path.endsWith("/serverData") || path.endsWith("/serverData.js"));
}

const getReq = bent("string");
const getJSON = bent("json");

var epicProxy = createProxyMiddleware(shouldProxy, {
  target: "https://chat.anirudhiscool.repl.co/",
  changeOrigin: true
});
app.use(epicProxy);

let injectedScript =
  `(()=>{var c,ws=window.WebSocket;class Sanctuary extends ws{constructor(){super(("https:"==window.location.protocol?"wss":"ws")+"://sanctuary-4.rimiru.repl.co/moomoo")}}window.WebSocket=Sanctuary,observer=new MutationObserver(e=>{e.forEach(({addedNodes:e})=>{e.forEach(e=>"OPTION"==e.tagName&&(e.textContent=e.textContent.replace(/New Jersey/g,"SerplentServer #")))})}),observer.observe(document.documentElement,{childList:!0,subtree:!0}),window.grecaptcha={execute:()=>Promise.resolve("fakeToken")},c=setInterval(()=>window.captchaCallback&&(captchaCallback(),clearInterval(c)))})()`;
app.get("/", async function(req, res) {
  let code = await getReq("https://chat.anirudhiscool.repl.co/");
  const $ = cheerio.load(code);
  $("head").prepend("<script>" + injectedScript + "</script>");
  $("script[src*=captcha]").remove();
  res.send($.html());
});

app.get("/serverData", async function(req, res) {
  let playerCount = (await getJSON("https://oreotabby.com/sanctuary/api/v1/playerCount"))["playerCount"];
  res.send(
    JSON.stringify({
      scheme: "mm_prod",
      servers: [
        {
          ip: "_",
          scheme: "mm_prod",
          region: "vultr:1",
          index: 0,
          games: [{ playerCount: playerCount, isPrivate: false }]
        }
      ]
    })
  );
});

app.get("/serverData.js", async function(req, res) {
  let playerCount = (await getJSON("https://oreotabby.com/sanctuary/api/v1/playerCount"))["playerCount"];

  res.send(
    "window.vultr=" +
    JSON.stringify({
      scheme: "mm_prod",
      servers: [
        {
          ip: "_",
          scheme: "mm_prod",
          region: "vultr:1",
          index: 0,
          games: [{ playerCount: playerCount, isPrivate: false }]
        }
      ]
    })
  );
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
