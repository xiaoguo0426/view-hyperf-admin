layui.define([], function (exports) {
    let $ = layui.$
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

    //对外暴露的接口
    exports('set-menu', {});
});
