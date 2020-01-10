/**

 @Name：layuiAdmin 用户管理 管理员管理 角色管理
 @Author：star1029
 @Site：http://www.layui.com/admin/
 @License：LPPL

 */


layui.define(['table', 'form'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , setter = layui.setter
        , table = layui.table
        , form = layui.form
        , hyperf = layui.hyperf;

    let request = setter.request;

    //管理员管理
    hyperf.table.render({
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
            , {field: 'check', title: '状态', templet: '#buttonTpl', minWidth: 80, align: 'center'}
            , {title: '操作', width: 150, align: 'center', fixed: 'right', toolbar: '#table-useradmin-admin'}
        ]]
    });

    let events = {
        info: function (that) {
            let id = $(that).attr('lay-id') || '';
            let popup = hyperf.auto.info({
                data: {
                    id: id
                },
                url: '/admin/user/info',
                title: id ? '编辑管理员' : '添加管理员',
                view: 'user/administrators/admin-form',
                done: function (res) {

                    let data = res.data;

                    form.val('admin-user-form', data);
                    form.render(null, 'admin-user-form');

                    // //监听提交
                    // form.on('submit(role-form-submit)', function (data) {
                    //     let fields = data.field; //获取提交的字段
                    //     console.log(fields);
                    //     hyperf.http.post({
                    //         url: id ? '/auth/edit' : '/auth/add',
                    //         data: fields,
                    //         done: function (res) {
                    //             if (res.code) {
                    //                 hyperf.msg.error(res.msg);
                    //             } else {
                    //                 hyperf.msg.success(res.msg,function () {
                    //                     hyperf.close(popup);
                    //                 });
                    //                 tableIndex.reload({
                    //                     page: {
                    //                         curr: 1 //重新从第 1 页开始
                    //                     }
                    //                 });
                    //             }
                    //         }
                    //     });
                    // });
                }
            });
        }
    };

    $('body').on('click', '[lay-event]', function () {
        let $this = $(this),
            event = $this.attr('lay-event');
        events[event] && events[event].call(this, $this);
    });

    exports('user-admin', {})
});