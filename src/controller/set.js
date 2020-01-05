layui.define(['form', 'upload'], function (exports) {
    let $ = layui.$
        , layer = layui.layer
        , laytpl = layui.laytpl
        , form = layui.form
        , element = layui.element
        , upload = layui.upload
        , hyperf = layui.hyperf;

    let $body = $('body');

    let profileTemplate = document.getElementById('profile');
    let contentObj = document.getElementById('content');

    let rolesTemplate = document.getElementById('rolesList');
    // console.log(rolesObj);
    let roles = [
        {
            'id': 1,
            'name': '系统管理员'
        },
        {
            'id': 2,
            'name': '一般管理员'
        },
        {
            'id': 3,
            'name': '一般用户'
        },
        {
            'id': 4,
            'name': '一般角色'
        }
    ];


    hyperf.http.get({
        url: '/admin/user/info',
        done: function (res) {
            let data = res.data;

            laytpl(profileTemplate.innerHTML).render(data, function (html) {
                contentObj.innerHTML = html;
            });

            let rolesObj = document.getElementById('roles');

            let d = {
                v: data.role_id,
                roles: roles
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
        }
    });


    //自定义验证
    form.verify({
        nickname: function (value, item) { //value：表单的值、item：表单的DOM对象
            if (!new RegExp("^[a-zA-Z0-9_\u4e00-\u9fa5\\s·]+$").test(value)) {
                return '用户名不能有特殊字符';
            }
            if (/(^\_)|(\__)|(\_+$)/.test(value)) {
                return '用户名首尾不能出现下划线\'_\'';
            }
            if (/^\d+\d+\d$/.test(value)) {
                return '用户名不能全为数字';
            }
        }

        //我们既支持上述函数式的方式，也支持下述数组的形式
        //数组的两个值分别代表：[正则匹配、匹配不符时的提示文字]
        , pass: [
            /^[\S]{6,12}$/
            , '密码必须6到12位，且不能出现空格'
        ]

        //确认密码
        , repass: function (value) {
            if (value !== $('#LAY_password').val()) {
                return '两次密码输入不一致';
            }
        }
    });

    //网站设置
    // form.on('submit(set_website)', function (obj) {
    //     console.log(obj);
    //     layer.msg(JSON.stringify(obj.field));
    //
    //     //提交修改
    //     /*
    //     admin.req({
    //       url: ''
    //       ,data: obj.field
    //       ,success: function(){
    //
    //       }
    //     });
    //     */
    //     return false;
    // });

    //邮件服务
    // form.on('submit(set_system_email)', function (obj) {
    //     layer.msg(JSON.stringify(obj.field));
    //
    //     //提交修改
    //     /*
    //     admin.req({
    //       url: ''
    //       ,data: obj.field
    //       ,success: function(){
    //
    //       }
    //     });
    //     */
    //     return false;
    // });


    //设置我的资料
    form.on('submit(auto)', function (obj) {
        //提交修改
        hyperf.http.auto(obj, {
            done: function (res) {
                console.log('done');
                console.log(res);
            },
            success:function (res) {
                console.log('success');
                console.log(res);
            }
        });

        return false;
    });

    //上传头像
    var avatarSrc = $('#LAY_avatarSrc');
    upload.render({
        url: '/api/upload/'
        , elem: '#LAY_avatarUpload'
        , done: function (res) {
            if (res.status == 0) {
                avatarSrc.val(res.url);
            } else {
                layer.msg(res.msg, {icon: 5});
            }
        }
    });

    //设置密码
    form.on('submit(setmypass)', function (obj) {
        layer.msg(JSON.stringify(obj.field));

        //提交修改
        /*
        admin.req({
          url: ''
          ,data: obj.field
          ,success: function(){

          }
        });
        */
        return false;
    });

    //对外暴露的接口
    exports('set', {});
});