# 南方之诗 - 鉴权与访问上下文 - 前端
这个是[鉴权与访问服务](https://github.com/YuJuncen/verse-of-south-identify)的一个包装器。
提供一个最基础的用户界面交互。

# 使用
```bash
npm i
npm start
```
还请注意，先启动后端[鉴权与访问服务](https://github.com/YuJuncen/verse-of-south-identify)之后这个才能正常运行。
另外在`app.js`中保存着一些最初的配置，诸如 jwt 密钥和 api 地址等等。
如果真的打算使用这个（！），注意处理一下这些东西。

## 注意
这个东西的实现非常粗暴。  
有许多东西都散发着显著的坏味道并且亟待重构。  
但是它确实看上去可以工作。  
就这样吧。  
