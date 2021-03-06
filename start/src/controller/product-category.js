layui.define(['form'], function (exports) {
    let $ = layui.$
        , form = layui.form
        , laytpl = layui.laytpl
        , hyperf = layui.hyperf;

    let tableIndex = hyperf.table.render({
        elem: '#LAY-product-category-list'
        , url: '/product/category/list' //模拟接口
        ,page: false //开启分页
        , cols: [[
            {
                type: 'checkbox', fixed: 'left'
            }
            , {field: 'title', title: '分类名称', align: 'left',templet:function (d) {
                    return d.spl + d.title;
                }}
            , {field: 'sort', title: '排序', align: 'center'}
            , {field: 'status', title: '状态', align: 'center', templet: '#table-category-status'}
            , {title: '操作', width: 250, align: 'center', fixed: 'right', toolbar: '#table-category-actions'}
        ]]
    });

    //监听搜索
    // form.on('submit(LAY-product-category-search)', function (data) {
    //     var field = data.field;
    //     //执行重载
    //     tableIndex.reload({
    //         where: field,
    //         page: {
    //             curr: 1 //重新从第 1 页开始
    //         }
    //     });
    // });

    //事件
    let events = {
        info: function (that) {
            let id = $(that).attr('lay-id') || '';
            let popup = hyperf.auto.info({
                data: {
                    id: id
                },
                url: '/product/category/info',
                title: id ? '编辑分类' : '添加分类',
                view: 'product/category/category-form',
                success: function (res) {
                    let data = res.data;

                    let categoryTpl = document.getElementById('product-category-select-tpl'),
                        categorySelect = document.getElementById('product-category-select');

                    laytpl(categoryTpl.innerHTML).render({
                        id: data.id,
                        parent_id: data.parent_id,
                        categories: data.categories
                    }, function (html) {
                        categorySelect.innerHTML = html;
                    });

                    form.val('category-form', data);
                    form.render(null, 'category-form');

                    form.render('select', 'parent_id');

                    //监听提交
                    form.on('submit(category-form-submit)', function (data) {
                        let fields = data.field; //获取提交的字段

                        hyperf.http.post({
                            url: id ? '/product/category/edit' : '/product/category/add',
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
        }
    };

    $('body').on('click', '[lay-event]', function () {
        let $this = $(this),
            event = $this.attr('lay-event');
        events[event] && events[event].call(this, $this);
    });

    exports('product-category', {})
});