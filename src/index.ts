const UPLOADER = "easyimage";

module.exports = (ctx) => {
  const config = (ctx) => {
    let userConfig = ctx.getConfig("picBed." + UPLOADER);

    if (!userConfig) {
      userConfig = {};
    }

    return [
      {
        name: "server",
        type: "input",
        default: userConfig.server,
        required: true,
        message: "示例: http://10.20.30.19:8070/api/index.php",
        alias: "API调用地址",
      },
      {
        name: "token",
        type: "input",
        default: userConfig.token,
        required: true,
        message: "认证 token 信息",
        alias: "调用Token",
      },
    ];
  };

  // 上传图片
  const uploader = {
    config,
    handle: async (ctx) => {
      let userConfig = ctx.getConfig("picBed." + UPLOADER);

      if (!userConfig) {
        throw new Error("Can't find uploader config");
      }

      const imgList = ctx.output;

      for (let i in imgList) {
        const img = imgList[i];
        const { base64Image, fileName } = img;
        let { buffer } = img;

        if (!buffer && base64Image) {
          buffer = Buffer.from(img.base64Image, "base64");
        }

        const requestConfig = {
          url: userConfig.server,
          method: "POST",
          headers: { "Content-Type": "multipart/form-data" },
          formData: {
            token: userConfig.token,
            image: {
              value: buffer,
              options: {
                filename: fileName,
              },
            },
          },
        };

        let body = await ctx.Request.request(requestConfig);
        body = JSON.parse(body);

        const { url: imgUrl, message } = body;

        if (imgUrl) {
          img.imgUrl = imgUrl;
        } else {
          ctx.emit("notification", {
            title: "上传失败",
            body: message,
          });
        }
      }

      return ctx;
    },
  };

  const register = () => {
    ctx.helper.uploader.register(UPLOADER, uploader);
  };

  return {
    register,
    config,
    uploader: UPLOADER,
  };
};
