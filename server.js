require('isomorphic-fetch');
const Koa = require('koa');
const Router = require('koa-router');
const Static = require('koa-static');
const he = require('he');
const path = require('path');
const open = require('open');
const port = 8080;
const server = new Koa();
const router = new Router();

router.all('*', Static(path.resolve(__dirname, './static/')));

router.get('/getFormStr', async (ctx, next) => {
  const response = await fetch(
    'http://rap2.taobao.org:38080/app/mock/250475/getFormStr',
  );
  const result = await response.json();
  ctx.body = result;
  await next();
});

router.get('/redirectForm', async (ctx, next) => {
  const response = await fetch(
    'http://rap2.taobao.org:38080/app/mock/250475/getFormStr',
  );
  const result = await response.json();
  const formStr = he.decode(result.formStr, {
    isAttributeValue: true,
  });
  const formStrArr = formStr.split('\n');
  const aliPayUrl = `${formStrArr[0].match(/action="([\s|\S]*)">/)[1]}&${
    formStrArr[1].match(/name="([\s|\S]*)" value="/)[1]
  }=${formStrArr[1].match(/value="([\s|\S]*)">/)[1]}`;
  ctx.response.redirect(aliPayUrl);
});

server.listen(port);
server.use(router.routes());
open(`http://localhost:${port}/`);

console.log(`Server running at http://localhost:${port}/`);
