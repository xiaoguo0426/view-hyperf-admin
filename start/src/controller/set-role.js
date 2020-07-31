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
    //角色管理
    let tableIndex = hyperf.table.render({
        elem: '#LAY-user-role-list'
        , url: '/auth/list' //模拟接口
        , cols: [[
            {
                type: 'checkbox', fixed: 'left'
            }
            , {field: 'id', width: 80, title: 'ID'}
            , {field: 'title', title: '角色名', align: 'center'}
            , {field: 'desc', title: '角色描述', align: 'center'}
            , {field: 'status', title: '状态', align: 'center', templet: '#table-role-status'}
            , {title: '操作', width: 250, align: 'center', fixed: 'right', toolbar: '#table-role-actions'}
        ]]
    });

    //事件
    let events = {
        'batch-del': function () {
            let checkStatus = hyperf.table.checkStatus('LAY-user-role-list')
                , checkData = checkStatus.data; //得到选中的数据
            console.log(checkData);

            if (checkData.length === 0) {
                return hyperf.msg.toast('请选择数据');
            }
            hyperf.confirm('确定删除吗？', function (index) {
                //TODO 不是不支持，而是个人认为批量删删除角色的可行性很低，这里只是做一个批量删除的例子
                hyperf.msg.error('暂不支持批量删除！');
            });
        },
        info: function (that) {
            let id = $(that).attr('lay-id') || '';
            let popup = hyperf.auto.info({
                data: {
                    id: id
                },
                url: '/auth/info',
                title: id ? '编辑角色' : '添加角色',
                view: 'set/admin/role-form',
                success: function (res) {
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

                        hyperf.http.post({
                            url: id ? '/auth/edit' : '/auth/add',
                            data: fields,
                            done: function (res) {
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
                }
            });
        },
        prompt: function (that) {
            hyperf.prompt('标题', function (value) {
                hyperf.http.post({
                    url: '',
                    data: {
                        id: '10086',
                        desc: value
                    },
                    done:function (res) {

                    }
                });
            }, {
                placeholder: '请输入原因。长度50',
                maxlength: 50
            });
        }
    };

    $('body').on('click', '[lay-event]', function () {
        let $this = $(this),
            event = $this.attr('lay-event');
        events[event] && events[event].call(this, $this);
    });

    exports('set-role', {})
});