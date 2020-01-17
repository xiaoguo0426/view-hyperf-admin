layui.define(['table', 'form'], function (exports) {
    let $ = layui.$
        , form = layui.form
        , hyperf = layui.hyperf;

    let laySiteInfoForm = 'lay-site-info-form',
        laySMTPInfoForm = 'lay-smtp-info-form';

    hyperf.http.get({
        url: '/admin/setting/getWeb',
        done: function (res) {
            console.log(res.data);
            form.val(laySiteInfoForm, res.data);
        }
    });

    hyperf.http.get({
        url: '/admin/setting/getSMTP',
        done: function (res) {
            console.log(res.data);
            form.val(laySMTPInfoForm, res.data);
        }
    });


    form.on('submit(lay-site-info)', function (obj) {
        //提交修改
        // hyperf.http.auto(obj, {
        //     done: function (res) {
        //         hyperf.msg.success(res.msg, function () {
        //             hyperf.page.refresh();
        //         });
        //     }
        // });
        hyperf.http.auto(obj);
    });

    form.on('submit(lay-smtp-info)', function (obj) {
        //提交修改
        // hyperf.http.auto(obj, {
        //     done: function (res) {
        //         hyperf.msg.success(res.msg, function () {
        //             hyperf.page.refresh();
        //         });
        //     }
        // });
        hyperf.http.auto(obj);
    });

    //对外暴露的接口
    exports('set-system', {});
});
