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

// 处理静态文件
router.all('*', Static(path.resolve(__dirname, './static/')));

// 获取支付宝支付的表单
router.get('/getFormStr', async (ctx, next) => {
  const response = await fetch(
    'http://rap2.taobao.org:38080/app/mock/250475/getFormStr',
  );
  const result = await response.json();

  ctx.body = result;

  await next();
});

// 获取支付宝支付的表单，之后重定向到支付宝支付页
router.get('/redirectForm', async (ctx, next) => {
  const response = await fetch(
    'http://rap2.taobao.org:38080/app/mock/250475/getFormStr',
  );
  const result = await response.json();

  // 进行Entity转换
  const decodedFormStr = he.decode(result.formStr, {
    isAttributeValue: true,
  });
  const decodedFormStrArr = decodedFormStr.split('\n');
  // 截取表单中的有用参数，并拼接成跳转支付宝的URL
  const aliPayUrl = `${decodedFormStrArr[0].match(/action="([\s|\S]*)">/)[1]}&${
    decodedFormStrArr[1].match(/name="([\s|\S]*)" value="/)[1]
  }=${decodedFormStrArr[1].match(/value="([\s|\S]*)">/)[1]}`;

  ctx.response.redirect(aliPayUrl);
  await next();
});

server.listen(port);
server.use(router.routes());
open(`http://localhost:${port}/`);

console.log(`Server running at http://localhost:${port}/`);
