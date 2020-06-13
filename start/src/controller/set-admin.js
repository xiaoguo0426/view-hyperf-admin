layui.define(['table', 'form'], function (exports) {
    let $ = layui.$
        , form = layui.form
        , laytpl = layui.laytpl
        , hyperf = layui.hyperf;

    //管理员管理
    let tableIndex = hyperf.table.render({
        elem: '#LAY-user-admin-list'
        , url: '/admin/user/list' //模拟接口
        , cols: [[
            {type: 'checkbox', fixed: 'left'}
            , {field: 'id', width: 80, title: 'ID'}
            , {field: 'username', title: '登录名'}
            , {
                field: 'role', title: '角色', templet: function (d) {
                    return d.role.title
                }
            }
            , {field: 'nickname', title: '昵称'}
            , {field: 'mobile', title: '手机'}
            , {field: 'email', title: '邮箱'}
            , {field: 'created_at', title: '创建时间'}
            , {field: 'check', title: '状态', templet: '#table-admin-status', minWidth: 80, align: 'center'}
            , {title: '操作', width: 150, align: 'center', fixed: 'right', toolbar: '#table-user-actions'}
        ]]
    });

    //监听搜索
    form.on('submit(LAY-user-admin-search)', function (data) {
        var field = data.field;
        //执行重载
        tableIndex.reload({
            where: field,
            page: {
                curr: 1 //重新从第 1 页开始
            }
        });
    });
    // form.render('LAY-user-admin-search-div');
    // form.render('select', 'roles');
    // form.render();

    let userAdminSearchRolesDiv = document.getElementById('user-admin-search-roles-div'),
        userAdminSearchRolesTpl = document.getElementById('user-admin-search-roles-tpl');

    hyperf.http.get({
        url: '/auth/list',
        data: {
            page: 0,
            limit: 0
        },
        loading: false,//关闭loading效果
        done: function (res) {
            laytpl(userAdminSearchRolesTpl.innerHTML).render(res.data, function (html) {
                userAdminSearchRolesDiv.innerHTML = html;
            });
            form.render();
            // form.render('select', 'roles');
        }
    });

    let events = {
        info: function (that) {
            let id = $(that).attr('lay-id') || '';
            let popup = hyperf.auto.info({
                data: {
                    id: id
                },
                area: ['520px', '600px'],
                url: '/admin/user/info',
                title: id ? '编辑管理员' : '添加管理员',
                view: 'set/admin/admin-form',
                done: function (res) {
                    console.log(res);

                    return false;
                    let data = res.data,
                        adminFormTpl = document.getElementById('admin-form-tpl'),

                        adminForm = document.getElementById('admin-form');

                    laytpl(adminFormTpl.innerHTML).render(data, function (html) {
                        adminForm.innerHTML = html;
                    });

                    let userRolesTpl = document.getElementById('user-roles-select-tpl'),

                        userRolesSelect = document.getElementById('user-roles-select');

                    laytpl(userRolesTpl.innerHTML).render({
                        role_id: data.role_id,
                        roles: data.roles
                    }, function (html) {
                        userRolesSelect.innerHTML = html;
                    });

                    form.val('admin-user-form', data);
                    form.render(null, 'admin-user-form');

                    form.render('select', 'role_id');
                    form.render('radio', 'gender');

                    form.verify({
                        username: function (value, item) { //value：表单的值、item：表单的DOM对象
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
                    });

                    // //监听提交
                    form.on('submit(user-form-submit)', function (data) {

                        let fields = data.field; //获取提交的字段
                        hyperf.http.post({
                            url: id ? '/admin/user/edit' : '/admin/user/add',
                            data: fields,
                            success: function (res) {
                                hyperf.msg.success(res.msg, function () {
                                    hyperf.close(popup);
                                });
                                tableIndex.reload({
                                    page: {
                                        curr: 1 //重新从第 1 页开始
                                    }
                                });
                            }
                        });
                    });
                },
                error:function (res) {
                    console.log(123123);
                }
            });
        }
    };

    $('div#lay-admin-user').on('click', '[lay-event]', function () {
        let $this = $(this),
            event = $this.attr('lay-event');
        events[event] && events[event].call(this, $this);
    });

    exports('set-admin', {})
});