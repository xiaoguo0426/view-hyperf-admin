/**

 @Name：layuiAdmin 用户管理 管理员管理 角色管理
 @Author：star1029
 @Site：http://www.layui.com/admin/
 @License：LPPL

 */


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
                view: 'user/administrators/admin-form',
                done: function (res) {
                    let data = res.data,
                        adminFormTpl = document.getElementById('admin-form-tpl'),

                        adminForm = document.getElementById('admin-form')

                    laytpl(adminFormTpl.innerHTML).render(data, function (html) {
                        adminForm.innerHTML = html;
                    });

                    let userRolesTpl = document.getElementById('user-roles-select-tpl'),

                        userRolesSelect = document.getElementById('user-roles-select');

                    console.log(data.roles);
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

                    // //监听提交
                    form.on('submit(user-form-submit)', function (data) {
                        let fields = data.field; //获取提交的字段
                        console.log(fields);
                        hyperf.http.post({
                            url: id ? '/admin/user/edit' : '/admin/user/add',
                            data: fields,
                            done: function (res) {
                                if (res.code) {
                                    hyperf.msg.error(res.msg);
                                } else {
                                    hyperf.msg.success(res.msg, function () {
                                        hyperf.close(popup);
                                    });
                                    tableIndex.reload({
                                        page: {
                                            curr: 1 //重新从第 1 页开始
                                        }
                                    });
                                }
                            }
                        });
                    });
                }
            });
        }
    };

    $('div#lay-admin-user').on('click', '[lay-event]', function () {
        let $this = $(this),
            event = $this.attr('lay-event');
        events[event] && events[event].call(this, $this);
    });

    exports('user-admin', {})
});