layui.define(function (exports) {
    let $ = layui.jquery,
        events = {
            preview: function (obj) {
                console.log($(obj).data('img'));
                return false;
                return this.album([{
                    src: src
                }], options);
            },
            album: function (data, options) {
                layer.photos($.extend({
                    photos: {
                        data: data
                    }
                    , shade: 0.01//背景透明度
                    , closeBtn: 1//是否显示关闭按钮
                    , anim: 5//图片入场方式
                }, options));
            }
        };

    exports('hyperf_events', events);
});