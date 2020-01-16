layui.config({
    base: '/start/js/' //你存放新模块的目录，注意，不是layui的模块目录
}).extend({
    aliossUploader: 'aliossUploader'
}).define(['form', 'upload', 'aliossUploader'], function (exports) {

    let $ = layui.$
        , layer = layui.layer
        , laytpl = layui.laytpl
        , form = layui.form
        , element = layui.element
        // , upload = layui.upload
        , upload = layui.aliossUploader
        , hyperf = layui.hyperf;

    let $body = $('body'),

        profileTemplate = document.getElementById('profile'),
        contentObj = document.getElementById('content'),

        rolesTemplate = document.getElementById('rolesList');


    hyperf.http.get({
        url: '/admin/user/get',
        done: function (res) {
            let data = res.data;

            laytpl(profileTemplate.innerHTML).render(data, function (html) {
                contentObj.innerHTML = html;
            });

            let rolesObj = document.getElementById('roles');

            let d = {
                v: data.role_id,
                roles: data.roles
            };
            //渲染select
            laytpl(rolesTemplate.innerHTML).render(d, function (html) {
                rolesObj.innerHTML = html;
            });

            element.render();
            // element.render('select');
            // element.render('radio');

            form.render();//这句话一定要加，不然radio，select会不出现
            form.render('select', 'role_id');
            form.render('radio', 'gender');

            let avatarSrc = $('#LAY_avatarSrc'),
                avatarPreview = $('button#avatarPreview');

            hyperf.http.get({
                url: '/plugin/upload/getOss',
                done: function (res) {
                    console.log(res);
                    if (res.code > 0) {
                        hyperf.msg.error(res.msg);
                        return false;
                    }
                    let oss = res.data;

                    upload.render({
                        elm: '#LAY_avatarUpload',
                        host: oss.host,
                        layerTitle: '上传数据文件',
                        accessId: oss.accessKeyId,
                        policy: oss.policy,
                        signature: oss.signature,
                        prefixPath: oss.dir,
                        maxSize: oss.maxSize,
                        fileType: 'images',
                        multiple: false,
                        allUploaded: function (res) {
                            console.log(res);
                            avatarSrc.val(res.ossUrl);
                            avatarPreview.attr('hyperf-preview',res.ossUrl);
                        }
                    });
                }
            });
        }
    });


    //自定义验证
    // form.verify({
    //     nickname: function (value, item) { //value：表单的值、item：表单的DOM对象
    //         if (!new RegExp("^[a-zA-Z0-9_\u4e00-\u9fa5\\s·]+$").test(value)) {
    //             return '用户名不能有特殊字符';
    //         }
    //         if (/(^\_)|(\__)|(\_+$)/.test(value)) {
    //             return '用户名首尾不能出现下划线\'_\'';
    //         }
    //         if (/^\d+\d+\d$/.test(value)) {
    //             return '用户名不能全为数字';
    //         }
    //     }
    // });

    //设置我的资料
    form.on('submit(lay-user-info)', function (obj) {
        //提交修改
        hyperf.http.auto(obj, {
            done: function (res) {
                console.log('auto done');
            },
            success: function (res) {
                console.log('auto success');
                hyperf.msg.success(res.msg);
            }
        });

        return false;
    });

    //上传头像
    // var avatarSrc = $('#LAY_avatarSrc');
    // upload.render({
    //     url: '/api/upload/'
    //     , elem: '#LAY_avatarUpload'
    //     , done: function (res) {
    //         if (res.status == 0) {
    //             avatarSrc.val(res.url);
    //         } else {
    //             layer.msg(res.msg, {icon: 5});
    //         }
    //     }
    // });

    //对外暴露的接口
    exports('set', {});
});