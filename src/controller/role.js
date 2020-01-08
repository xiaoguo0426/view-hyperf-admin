layui.define(['form', 'authtree'], function (exports) {
    let $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , laytpl = layui.laytpl
        // , setter = layui.setter
        // , table = layui.table
        , element = layui.element
        , form = layui.form
        , authtree = layui.authtree
        , hyperf = layui.hyperf;
    console.log(authtree);
    //角色管理
    let tableIndex = hyperf.table.render({
        elem: '#LAY-user-back-role'
        , url: '/auth/list' //模拟接口
        , cols: [[
            {
                type: 'checkbox', fixed: 'left'
            }
            , {field: 'id', width: 80, title: 'ID'}
            , {field: 'title', title: '角色名'}
            , {field: 'desc', title: '描述'}
            , {title: '操作', width: 250, align: 'center', fixed: 'right', toolbar: '#table-useradmin-admin'}
        ]]
    });

    //事件
    let events = {
        'batch-del': function () {
            console.log(12312321);
            let checkStatus = hyperf.table.checkStatus('LAY-user-back-role')
                , checkData = checkStatus.data; //得到选中的数据

            console.log(checkStatus);
            console.log(checkData);
            if (checkData.length === 0) {
                return hyperf.toast('请选择数据');
            }

            hyperf.confirm('确定删除吗？', function (index) {
                tableIndex.reload('LAY-user-back-role');
                hyperf.toast('已删除');
            });
        },
        info: function (that) {
            let id = $(that).attr('lay-id') || '';
            console.log(id);
            hyperf.popup({
                title: '添加新角色'
                , area: ['600px', '480px']
                , id: 'LAY-popup-user-add'
                , success: function (layero, index) {
                    view(this.id).render('user/administrators/role-form').done(function () {
                        hyperf.http.get({
                            url: '/auth/info',
                            data: {
                                id: id
                            },
                            done: function (res) {
                                console.log(res);
                                if (res.code > 0) {
                                    hyperf.msg.error(res.msg);
                                    return false;
                                }

                                let data = res.data;
                                let auths = data.auths;

                                authtree.render('#auth-list', auths, {
                                    inputname: 'nodes[]',
                                    layfilter: 'lay-check-auth',
                                    autowidth: true,
                                    valueKey: 'node',
                                    nameKey: 'title',
                                    childKey: 'sub',
                                });

                                form.val('role-form', data);
                                form.render(null, 'role-form');

                                //监听提交
                                form.on('submit(role-form-submit)', function (data) {
                                    let fields = data.field; //获取提交的字段
                                    console.log(fields);
                                    hyperf.http.post({
                                        url: '/auth/edit',
                                        data: fields,
                                        done: function (res) {
                                            console.log(res);
                                        }
                                    });
                                });

                            }
                        });

                    });
                }
            });
        },
        edit: function (that) {
            console.log('edit');
        },
        auth: function (that) {
            console.log('auth');
        },
        del: function (that) {
            console.log('del');
        }
    };

    $('body').on('click', '[lay-event]', function () {
        let $this = $(this),
            event = $this.attr('lay-event');
        events[event] && events[event].call(this, $this);
    });

    exports('role', {})
});