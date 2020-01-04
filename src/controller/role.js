layui.define(['form'], function (exports) {
    let $ = layui.$
        // , admin = layui.admin
        // , view = layui.view
        // , setter = layui.setter
        // , table = layui.table
        , form = layui.form
        , hyperf = layui.hyperf;


    // //角色管理
    let tableIndex = hyperf.table.render({
        elem: '#LAY-user-back-role'
        , url: '/auth/list' //模拟接口
        , cols: [[
            {
                type: 'checkbox', fixed: 'left', templet: '#'
            }
            , {field: 'id', width: 80, title: 'ID'}
            , {field: 'title', title: '角色名'}
            , {field: 'desc', title: '描述'}
            , {title: '操作', width: 250, align: 'center', fixed: 'right', toolbar: '#table-useradmin-admin'}
        ]]
    });

    //事件
    var active = {
        batchdel: function () {
            console.log(12312321);
            let checkStatus = hyperf.table.checkStatus('LAY-user-back-role')
                , checkData = checkStatus.data; //得到选中的数据

            console.log(checkStatus);
            console.log(checkData);
            if (checkData.length === 0) {
                return hyperf.toast('请选择数据');
            }

            hyperf.confirm('确定删除吗？', function (index) {

                //执行 Ajax 后重载
                /*
                admin.req({
                  url: 'xxx'
                  //,……
                });
                */
                tableIndex.reload('LAY-user-back-role');
                hyperf.toast('已删除');
            });
        },
        add: function () {
            // admin.popup({
            //     title: '添加新角色'
            //     , area: ['500px', '480px']
            //     , id: 'LAY-popup-user-add'
            //     , success: function (layero, index) {
            //         view(this.id).render('user/administrators/roleform').done(function () {
            //             form.render(null, 'layuiadmin-form-role');
            //
            //             //监听提交
            //             form.on('submit(LAY-user-role-submit)', function (data) {
            //                 var field = data.field; //获取提交的字段
            //
            //                 //提交 Ajax 成功后，关闭当前弹层并重载表格
            //                 //$.ajax({});
            //                 layui.table.reload('LAY-user-back-role'); //重载表格
            //                 layer.close(index); //执行关闭
            //             });
            //         });
            //     }
            // });
        }
    };
    $('.layui-btn.layuiadmin-btn-role').on('click', function () {
        var type = $(this).data('type');
        active[type] ? active[type].call(this) : '';
    });

    exports('role', {})
});