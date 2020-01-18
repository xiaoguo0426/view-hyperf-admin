layui.define(['table', 'form'], function (exports) {
    let $ = layui.$
        , form = layui.form
        , setter = layui.setter
        , hyperf = layui.hyperf;

    let laySiteInfoForm = 'lay-site-info-form',
        laySMTPInfoForm = 'lay-smtp-info-form';

    hyperf.http.get({
        url: '/admin/setting/getWeb',
        done: function (res) {
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
        hyperf.http.auto(obj, {
            success: function (res) {
                hyperf.msg.success(res.msg);

                let d = obj.field;
                // layui.setter.site = 123123;
                // console.log(layui.setter.site = 123123);
                layui.data(setter.tableName, {
                    key: 'system',
                    value: d
                });

                document.getElementsByTagName('title')[0].innerText = d.site;

                $('#site-title').text(d.site);

                $("meta[name='keywords']").attr('content', d.keywords);
                $("meta[name='description']").attr('content', d.desc);
                $("meta[name='author']").attr('content', d.author);
                $("meta[name='copyright']").attr('content', d.copyright);

                hyperf.page.refreshAll();
            }
        });
    });

    form.on('submit(lay-smtp-info)', function (obj) {
        //提交修改
        hyperf.http.auto(obj);
    });

    //对外暴露的接口
    exports('set-system', {});
});
