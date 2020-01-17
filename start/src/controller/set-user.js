layui.config({
    base: '/js/' //你存放新模块的目录，注意，不是layui的模块目录
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
                    let {accessKeyId, dir, host, maxSize, policy, signature} = res.data;

                    upload.render({
                        elm: '#LAY_avatarUpload',
                        host: host,
                        layerTitle: '上传数据文件',
                        accessId: accessKeyId,
                        policy: policy,
                        signature: signature,
                        prefixPath: dir,
                        maxSize: maxSize,
                        fileType: 'images',
                        multiple: false,
                        allUploaded: function (res) {
                            console.log(res);
                            avatarSrc.val(res.ossUrl);
                            avatarPreview.attr('hyperf-preview', res.ossUrl);
                        }
                    });
                }
            });
        }

    });

    //设置我的资料
    form.on('submit(lay-user-info)', function (obj) {
        //提交修改
        hyperf.http.auto(obj);
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
    exports('set-user', {});
});