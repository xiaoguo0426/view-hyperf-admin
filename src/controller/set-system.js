layui.define(['table', 'form'], function (exports) {
    let $ = layui.$
        , form = layui.form
        , hyperf = layui.hyperf;

    hyperf.http.get({
        url: '/auth/getWeb',
        done: function (res) {
            console.log(res);
        }
    });

    //对外暴露的接口
    exports('set-system', {});
});
